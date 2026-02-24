package com.shopnest.product.service;

import com.shopnest.product.dto.ProductDto;
import com.shopnest.product.model.Category;
import com.shopnest.product.model.Product;
import com.shopnest.product.model.ProductImage;
import com.shopnest.product.repository.CategoryRepository;
import com.shopnest.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Cacheable(value = "products", key = "#keyword + '_' + #categoryId + '_' + #brand + '_' + #pageable.pageNumber")
    public Page<ProductDto.ProductResponse> getAllProducts(String keyword, Long categoryId, String brand,
            Pageable pageable) {
        return productRepository.searchProducts(keyword, categoryId, brand, pageable)
                .map(this::toDto);
    }

    public ProductDto.ProductResponse getProductById(Long id) {
        return productRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));
    }

    @CacheEvict(value = "products", allEntries = true)
    public ProductDto.ProductResponse createProduct(ProductDto.CreateProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .brand(request.getBrand())
                .stockQuantity(request.getStockQuantity())
                .category(category)
                .build();
        if (request.getImageUrls() != null) {
            Product finalProduct = product;
            List<ProductImage> images = request.getImageUrls().stream()
                    .map(url -> ProductImage.builder().product(finalProduct).imageUrl(url).build())
                    .collect(Collectors.toList());
            product.setImages(images);
        }
        product = productRepository.save(product);
        return toDto(product);
    }

    @CacheEvict(value = "products", allEntries = true)
    public ProductDto.ProductResponse updateProduct(Long id, ProductDto.CreateProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setBrand(request.getBrand());
        product.setStockQuantity(request.getStockQuantity());
        return toDto(productRepository.save(product));
    }

    @CacheEvict(value = "products", allEntries = true)
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    @Cacheable(value = "categories")
    public List<ProductDto.CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(c -> ProductDto.CategoryResponse.builder()
                        .id(c.getId()).name(c.getName()).description(c.getDescription()).build())
                .collect(Collectors.toList());
    }

    public ProductDto.CategoryResponse createCategory(ProductDto.CreateCategoryRequest request) {
        Category category = Category.builder().name(request.getName()).description(request.getDescription()).build();
        category = categoryRepository.save(category);
        return ProductDto.CategoryResponse.builder()
                .id(category.getId()).name(category.getName()).description(category.getDescription()).build();
    }

    private ProductDto.ProductResponse toDto(Product p) {
        return ProductDto.ProductResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .price(p.getPrice())
                .brand(p.getBrand())
                .stockQuantity(p.getStockQuantity())
                .categoryId(p.getCategory() != null ? p.getCategory().getId() : null)
                .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
                .imageUrls(p.getImages() != null
                        ? p.getImages().stream().map(ProductImage::getImageUrl).collect(Collectors.toList())
                        : List.of())
                .build();
    }
}

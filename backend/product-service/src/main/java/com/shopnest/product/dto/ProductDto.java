package com.shopnest.product.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

public class ProductDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductResponse {
        private Long id;
        private String name;
        private String description;
        private BigDecimal price;
        private String brand;
        private Integer stockQuantity;
        private Long categoryId;
        private String categoryName;
        private List<String> imageUrls;
    }

    @Data
    public static class CreateProductRequest {
        private String name;
        private String description;
        private BigDecimal price;
        private Long categoryId;
        private String brand;
        private Integer stockQuantity;
        private List<String> imageUrls;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryResponse {
        private Long id;
        private String name;
        private String description;
    }

    @Data
    public static class CreateCategoryRequest {
        private String name;
        private String description;
    }
}

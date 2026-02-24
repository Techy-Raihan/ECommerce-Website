package com.shopnest.cart.service;

import com.shopnest.cart.dto.CartDto;
import com.shopnest.cart.model.Cart;
import com.shopnest.cart.model.CartItem;
import com.shopnest.cart.repository.CartItemRepository;
import com.shopnest.cart.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;

    public CartDto.CartResponse getCart(String userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> cartRepository.save(Cart.builder().userId(userId).build()));
        List<CartItem> items = cartItemRepository.findByCartId(cart.getId());
        return buildResponse(cart, items);
    }

    @Transactional
    public CartDto.CartResponse addToCart(String userId, CartDto.AddToCartRequest request) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> cartRepository.save(Cart.builder().userId(userId).build()));
        List<CartItem> items = cartItemRepository.findByCartId(cart.getId());
        CartItem existing = items.stream()
                .filter(i -> i.getProductId().equals(request.getProductId()))
                .findFirst().orElse(null);
        if (existing != null) {
            existing.setQuantity(existing.getQuantity() + request.getQuantity());
            cartItemRepository.save(existing);
        } else {
            CartItem item = CartItem.builder()
                    .cart(cart).productId(request.getProductId())
                    .productName(request.getProductName()).price(request.getPrice())
                    .quantity(request.getQuantity()).imageUrl(request.getImageUrl())
                    .build();
            cartItemRepository.save(item);
        }
        return getCart(userId);
    }

    @Transactional
    public CartDto.CartResponse removeItem(String userId, Long itemId) {
        cartItemRepository.deleteById(itemId);
        return getCart(userId);
    }

    @Transactional
    public void clearCart(String userId) {
        cartRepository.findByUserId(userId).ifPresent(cart -> cartItemRepository.deleteByCartId(cart.getId()));
    }

    private CartDto.CartResponse buildResponse(Cart cart, List<CartItem> items) {
        List<CartDto.CartItemResponse> itemResponses = items.stream().map(i -> CartDto.CartItemResponse.builder()
                .id(i.getId()).productId(i.getProductId())
                .productName(i.getProductName()).price(i.getPrice())
                .quantity(i.getQuantity()).imageUrl(i.getImageUrl())
                .subtotal(i.getPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .build()).collect(Collectors.toList());
        BigDecimal total = itemResponses.stream()
                .map(CartDto.CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return CartDto.CartResponse.builder()
                .cartId(cart.getId()).userId(cart.getUserId())
                .items(itemResponses).totalPrice(total).build();
    }
}

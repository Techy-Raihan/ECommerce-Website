package com.shopnest.cart.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

public class CartDto {

    @Data
    public static class AddToCartRequest {
        private Long productId;
        private String productName;
        private BigDecimal price;
        private Integer quantity;
        private String imageUrl;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CartResponse {
        private Long cartId;
        private String userId;
        private List<CartItemResponse> items;
        private BigDecimal totalPrice;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CartItemResponse {
        private Long id;
        private Long productId;
        private String productName;
        private BigDecimal price;
        private Integer quantity;
        private String imageUrl;
        private BigDecimal subtotal;
    }
}

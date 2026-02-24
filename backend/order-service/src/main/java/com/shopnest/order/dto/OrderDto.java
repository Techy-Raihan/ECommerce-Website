package com.shopnest.order.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

public class OrderDto {

    @Data
    public static class CreateOrderRequest {
        private String shippingAddress;
        private List<OrderItemRequest> items;
    }

    @Data
    public static class OrderItemRequest {
        private Long productId;
        private String productName;
        private Integer quantity;
        private BigDecimal price;
        private String imageUrl;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderResponse {
        private String id;
        private String userId;
        private BigDecimal totalPrice;
        private String status;
        private String paymentId;
        private String shippingAddress;
        private List<OrderItemResponse> items;
        private String createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemResponse {
        private Long productId;
        private String productName;
        private Integer quantity;
        private BigDecimal price;
        private String imageUrl;
    }
}

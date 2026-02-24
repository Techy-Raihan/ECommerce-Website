package com.shopnest.order.kafka;

import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderEvent implements Serializable {
    private String orderId;
    private String userId;
    private String userEmail;
    private BigDecimal totalPrice;
    private String status;
    private List<OrderItemEvent> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemEvent implements Serializable {
        private Long productId;
        private Integer quantity;
    }
}

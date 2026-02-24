package com.shopnest.payment.kafka;

import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentEvent {
    private String paymentId;
    private String orderId;
    private String userId;
    private BigDecimal amount;
    private String status;
}

package com.shopnest.notification.kafka;

import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import java.util.Map;

@Component
@Slf4j
public class NotificationEventConsumer {

    @KafkaListener(topics = "order-events", groupId = "notification-service-group")
    public void onOrderCreated(Map<String, Object> event) {
        log.info("[NOTIFICATION] Order created event received: orderId={}, userId={}",
                event.get("orderId"), event.get("userId"));
        // In production: send email via JavaMailSender
        System.out.printf("[EMAIL] Order Confirmation%nDear Customer,%nYour order %s has been placed!%nTotal: %s%n%n",
                event.get("orderId"), event.get("totalPrice"));
    }

    @KafkaListener(topics = "payment-events", groupId = "notification-service-group")
    public void onPaymentSuccess(Map<String, Object> event) {
        if (!"SUCCESS".equals(event.get("status")))
            return;
        log.info("[NOTIFICATION] Payment success event received: orderId={}", event.get("orderId"));
        System.out.printf("[EMAIL] Payment Confirmed%nDear Customer,%nPayment of %s for order %s was successful!%n%n",
                event.get("amount"), event.get("orderId"));
    }
}

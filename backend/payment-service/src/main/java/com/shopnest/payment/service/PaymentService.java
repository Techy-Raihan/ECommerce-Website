package com.shopnest.payment.service;

import com.shopnest.payment.kafka.PaymentEvent;
import com.shopnest.payment.model.Payment;
import com.shopnest.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final KafkaTemplate<String, PaymentEvent> kafkaTemplate;

    @Transactional
    public Payment initiatePayment(String orderId, String userId, BigDecimal amount, String paymentMethod) {
        Payment payment = Payment.builder()
                .orderId(orderId).userId(userId).amount(amount)
                .paymentMethod(paymentMethod)
                .status(Payment.PaymentStatus.PENDING)
                .transactionId("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .build();
        return paymentRepository.save(payment);
    }

    @Transactional
    public Payment simulatePaymentSuccess(String orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        payment.setStatus(Payment.PaymentStatus.SUCCESS);
        Payment saved = paymentRepository.save(payment);

        // Publish Kafka event (best-effort — no Kafka broker required in dev mode)
        try {
                PaymentEvent event = PaymentEvent.builder()
                        .paymentId(saved.getId()).orderId(orderId)
                        .userId(saved.getUserId()).amount(saved.getAmount())
                        .status("SUCCESS").build();
                kafkaTemplate.send("payment-events", event);
                log.info("Payment event published for orderId={}", orderId);
        } catch (Exception e) {
                log.warn("Kafka unavailable — payment event not published (dev mode): {}", e.getMessage());
        }

        return saved;
    }

    public Payment getPaymentByOrderId(String orderId) {
        return paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
    }
}

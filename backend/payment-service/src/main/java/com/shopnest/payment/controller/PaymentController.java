package com.shopnest.payment.controller;

import com.shopnest.payment.model.Payment;
import com.shopnest.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/initiate")
    public ResponseEntity<Payment> initiate(
            @RequestHeader("X-User-Id") String userId,
            @RequestBody Map<String, Object> body) {
        String orderId = (String) body.get("orderId");
        BigDecimal amount = new BigDecimal(body.get("amount").toString());
        String method = (String) body.getOrDefault("paymentMethod", "CARD");
        return ResponseEntity.ok(paymentService.initiatePayment(orderId, userId, amount, method));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<Payment> getPayment(@PathVariable String orderId) {
        return ResponseEntity.ok(paymentService.getPaymentByOrderId(orderId));
    }

    // Simulated webhook — call this to complete a payment
    @PostMapping("/webhook")
    public ResponseEntity<Payment> webhook(@RequestBody Map<String, String> body) {
        String orderId = body.get("orderId");
        return ResponseEntity.ok(paymentService.simulatePaymentSuccess(orderId));
    }
}

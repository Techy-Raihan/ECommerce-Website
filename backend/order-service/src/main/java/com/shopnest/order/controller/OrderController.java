package com.shopnest.order.controller;

import com.shopnest.order.dto.OrderDto;
import com.shopnest.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderDto.OrderResponse> createOrder(
            @RequestHeader("X-User-Id") String userId,
            @RequestBody OrderDto.CreateOrderRequest request) {
        return ResponseEntity.ok(orderService.createOrder(userId, request));
    }

    @GetMapping
    public ResponseEntity<List<OrderDto.OrderResponse>> getOrders(@RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(orderService.getUserOrders(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDto.OrderResponse> getOrder(@PathVariable String id) {
        return ResponseEntity.ok(orderService.getOrder(id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<OrderDto.OrderResponse> updateStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            @RequestHeader(value = "X-User-Role", defaultValue = "") String role) {
        if (!"ADMIN".equals(role))
            return ResponseEntity.status(403).build();
        return ResponseEntity.ok(orderService.updateStatus(id, body.get("status")));
    }
}

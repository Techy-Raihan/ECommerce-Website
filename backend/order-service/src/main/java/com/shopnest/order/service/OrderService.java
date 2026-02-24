package com.shopnest.order.service;

import com.shopnest.order.dto.OrderDto;
import com.shopnest.order.kafka.OrderEvent;
import com.shopnest.order.model.Order;
import com.shopnest.order.model.OrderItem;
import com.shopnest.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

        private final OrderRepository orderRepository;
        private final KafkaTemplate<String, OrderEvent> kafkaTemplate;

        @Transactional
        public OrderDto.OrderResponse createOrder(String userId, OrderDto.CreateOrderRequest request) {
                List<OrderItem> items = request.getItems().stream().map(i -> OrderItem.builder()
                                .productId(i.getProductId())
                                .productName(i.getProductName())
                                .quantity(i.getQuantity())
                                .price(i.getPrice())
                                .imageUrl(i.getImageUrl())
                                .build()).collect(Collectors.toList());

                BigDecimal total = items.stream()
                                .map(i -> i.getPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                Order order = Order.builder()
                                .userId(userId)
                                .totalPrice(total)
                                .shippingAddress(request.getShippingAddress())
                                .items(items)
                                .build();
                items.forEach(i -> i.setOrder(order));
                Order saved = orderRepository.save(order);

                // Publish Kafka event (best-effort — no Kafka broker required in dev mode)
                try {
                        OrderEvent event = OrderEvent.builder()
                                        .orderId(saved.getId()).userId(userId)
                                        .totalPrice(total).status("CREATED")
                                        .items(items.stream().map(i -> OrderEvent.OrderItemEvent.builder()
                                                        .productId(i.getProductId()).quantity(i.getQuantity()).build())
                                                        .collect(Collectors.toList()))
                                        .build();
                        kafkaTemplate.send("order-events", event);
                        log.info("Order event published for orderId={}", saved.getId());
                } catch (Exception e) {
                        log.warn("Kafka unavailable — order event not published (dev mode): {}", e.getMessage());
                }

                return toDto(saved);
        }

        public List<OrderDto.OrderResponse> getUserOrders(String userId) {
                return orderRepository.findByUserIdOrderByCreatedAtDesc(userId)
                                .stream().map(this::toDto).collect(Collectors.toList());
        }

        public OrderDto.OrderResponse getOrder(String orderId) {
                return orderRepository.findById(orderId)
                                .map(this::toDto)
                                .orElseThrow(() -> new RuntimeException("Order not found"));
        }

        @Transactional
        public OrderDto.OrderResponse updateStatus(String orderId, String status) {
                Order order = orderRepository.findById(orderId)
                                .orElseThrow(() -> new RuntimeException("Order not found"));
                order.setStatus(Order.OrderStatus.valueOf(status));
                return toDto(orderRepository.save(order));
        }

        private OrderDto.OrderResponse toDto(Order o) {
                return OrderDto.OrderResponse.builder()
                                .id(o.getId()).userId(o.getUserId())
                                .totalPrice(o.getTotalPrice()).status(o.getStatus().name())
                                .paymentId(o.getPaymentId()).shippingAddress(o.getShippingAddress())
                                .createdAt(o.getCreatedAt() != null ? o.getCreatedAt().toString() : null)
                                .items(o.getItems().stream().map(i -> OrderDto.OrderItemResponse.builder()
                                                .productId(i.getProductId()).productName(i.getProductName())
                                                .quantity(i.getQuantity()).price(i.getPrice()).imageUrl(i.getImageUrl())
                                                .build()).collect(Collectors.toList()))
                                .build();
        }
}

package com.shopnest.inventory.kafka;

import com.shopnest.inventory.model.Inventory;
import com.shopnest.inventory.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentEventConsumer {

    private final InventoryRepository inventoryRepository;

    @KafkaListener(topics = "payment-events", groupId = "inventory-service-group")
    public void onPaymentSuccess(Map<String, Object> event) {
        if (!"SUCCESS".equals(event.get("status")))
            return;
        log.info("Payment success event received: {}", event);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items = (List<Map<String, Object>>) event.get("items");
        if (items == null)
            return;
        for (Map<String, Object> item : items) {
            Long productId = Long.valueOf(item.get("productId").toString());
            int qty = Integer.parseInt(item.get("quantity").toString());
            inventoryRepository.findByProductId(productId).ifPresent(inv -> {
                inv.setStockQuantity(Math.max(0, inv.getStockQuantity() - qty));
                inventoryRepository.save(inv);
                log.info("Deducted {} units from product {}", qty, productId);
            });
        }
    }
}

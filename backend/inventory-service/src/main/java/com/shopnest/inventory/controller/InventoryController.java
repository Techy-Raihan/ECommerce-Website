package com.shopnest.inventory.controller;

import com.shopnest.inventory.model.Inventory;
import com.shopnest.inventory.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryRepository inventoryRepository;

    @GetMapping("/{productId}")
    public ResponseEntity<Inventory> getInventory(@PathVariable Long productId) {
        return inventoryRepository.findByProductId(productId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Inventory> createOrUpdate(@RequestBody Inventory inventory) {
        Inventory saved = inventoryRepository.findByProductId(inventory.getProductId())
                .map(existing -> {
                    existing.setStockQuantity(inventory.getStockQuantity());
                    existing.setReservedQuantity(
                            inventory.getReservedQuantity() != null ? inventory.getReservedQuantity() : 0);
                    return inventoryRepository.save(existing);
                })
                .orElseGet(() -> inventoryRepository.save(inventory));
        return ResponseEntity.ok(saved);
    }
}

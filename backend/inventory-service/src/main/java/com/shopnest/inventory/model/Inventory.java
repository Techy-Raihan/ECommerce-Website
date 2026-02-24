package com.shopnest.inventory.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "inventory")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Inventory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id", unique = true)
    private Long productId;

    @Column(name = "stock_quantity")
    private Integer stockQuantity;

    @Column(name = "reserved_quantity")
    private Integer reservedQuantity;
}

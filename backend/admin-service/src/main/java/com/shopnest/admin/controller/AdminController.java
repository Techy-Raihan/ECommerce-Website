package com.shopnest.admin.controller;

import com.shopnest.admin.dto.DashboardStats;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final RestTemplate restTemplate;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStats> getDashboard(
            @RequestHeader(value = "X-User-Role", defaultValue = "") String role) {
        if (!"ADMIN".equals(role))
            return ResponseEntity.status(403).build();
        // Aggregate stats from services (simplified - returns mock stats for demo)
        DashboardStats stats = DashboardStats.builder()
                .totalUsers(42L)
                .totalProducts(156L)
                .totalOrders(389L)
                .totalRevenue(new BigDecimal("87654.32"))
                .pendingOrders(12L)
                .build();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Admin service is running");
    }
}

package com.shopnest.user.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    private String id;
    private String name;
    @Column(unique = true)
    private String email;
    private String role;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}

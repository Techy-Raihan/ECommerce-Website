package com.shopnest.user.controller;

import com.shopnest.user.model.Address;
import com.shopnest.user.model.User;
import com.shopnest.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import jakarta.persistence.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final com.shopnest.user.repository.AddressRepository addressRepository;

    @GetMapping("/me")
    public ResponseEntity<User> getMe(@RequestHeader("X-User-Id") String userId) {
        return userRepository.findById(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/me")
    public ResponseEntity<User> updateMe(@RequestHeader("X-User-Id") String userId,
            @RequestBody User request) {
        return userRepository.findById(userId).map(user -> {
            user.setName(request.getName());
            return ResponseEntity.ok(userRepository.save(user));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers(
            @RequestHeader(value = "X-User-Role", defaultValue = "") String role) {
        if (!"ADMIN".equals(role))
            return ResponseEntity.status(403).build();
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/address")
    public ResponseEntity<List<Address>> getAddresses(@RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(addressRepository.findByUserId(userId));
    }

    @PostMapping("/address")
    public ResponseEntity<Address> addAddress(@RequestHeader("X-User-Id") String userId,
            @RequestBody Address address) {
        address.setUserId(userId);
        return ResponseEntity.ok(addressRepository.save(address));
    }

    @DeleteMapping("/address/{id}")
    public ResponseEntity<Void> deleteAddress(@PathVariable Long id,
            @RequestHeader("X-User-Id") String userId) {
        addressRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}

package com.shopnest.auth.service;

import com.shopnest.auth.dto.AuthDto;
import com.shopnest.auth.model.User;
import com.shopnest.auth.repository.UserRepository;
import com.shopnest.auth.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    // In-memory token blacklist as fallback when Redis is unavailable
    private final Set<String> tokenBlacklist = ConcurrentHashMap.newKeySet();

    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.USER)
                .build();
        user = userRepository.save(user);
        return buildAuthResponse(user);
    }

    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        return buildAuthResponse(user);
    }

    public AuthDto.AuthResponse refreshToken(String refreshToken) {
        if (!jwtUtil.isTokenValid(refreshToken)) {
            throw new RuntimeException("Invalid refresh token");
        }
        if (tokenBlacklist.contains(refreshToken)) {
            throw new RuntimeException("Token has been revoked");
        }
        String userId = jwtUtil.extractUserId(refreshToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        tokenBlacklist.add(refreshToken);
        return buildAuthResponse(user);
    }

    public void logout(String accessToken) {
        if (jwtUtil.isTokenValid(accessToken)) {
            tokenBlacklist.add(accessToken);
            log.info("Token blacklisted (in-memory). Token count: {}", tokenBlacklist.size());
        }
    }

    private AuthDto.AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtUtil.generateAccessToken(user.getId(), user.getRole().name());
        String refreshToken = jwtUtil.generateRefreshToken(user.getId());
        return AuthDto.AuthResponse.builder()
                .accessToken(accessToken)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}

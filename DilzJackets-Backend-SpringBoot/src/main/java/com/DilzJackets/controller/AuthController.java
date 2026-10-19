package com.DilzJackets.controller;

import com.DilzJackets.model.AdminUser;
import com.DilzJackets.repository.AdminUserRepository;
import com.DilzJackets.security.JwtUtil;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AdminUserRepository adminRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(AdminUserRepository adminRepo,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil) {
        this.adminRepo = adminRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        AdminUser user = adminRepo.findByUsername(request.getUsername())
                .orElse(null);

        // Check if user exists and password matches the BCrypt hash in Supabase
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid username or password"));
        }

        // Generate the 10-hour VIP pass
        String token = jwtUtil.generateToken(user.getUsername());
        return ResponseEntity.ok(Map.of(
                "token", token,
                "type", "Bearer",
                "username", user.getUsername()));
    }

    @Data
    public static class LoginRequest {
        private String username;
        private String password;
    }
}
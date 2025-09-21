package com.dinidu.pms.controller;


import com.dinidu.pms.dto.AuthResponse;
import com.dinidu.pms.dto.LoginRequest;
import com.dinidu.pms.dto.RegisterRequest;
import com.dinidu.pms.entity.User;
import com.dinidu.pms.service.UserService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        logger.debug("[AuthController] register request: {}", request.getUsername());
        try {
            AuthResponse response = userService.register(request);
            logger.info("[AuthController] register success: {}", response.getUsername());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            logger.error("[AuthController] register failed", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        logger.debug("[AuthController] login attempt: {}", request.getUsername());
        try {
            AuthResponse response = userService.authenticate(request);
            logger.info("[AuthController] login success: {}", response.getUsername());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            logger.error("[AuthController] login failed", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> getCurrentUser(@AuthenticationPrincipal User user) {
    logger.debug("[AuthController] getCurrentUser called");
    if (user == null) {
        logger.warn("[AuthController] getCurrentUser - no authenticated user");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    logger.debug("[AuthController] getCurrentUser - returning user {}", user.getUsername());
    return ResponseEntity.ok(
        AuthResponse.builder()
            .username(user.getUsername())
            .email(user.getEmail())
            .build()
    );
    }
}
package com.dinidu.pms.controller;

import com.dinidu.pms.dto.UpdateUserRequest;
import com.dinidu.pms.entity.User;
import com.dinidu.pms.service.UserService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final Logger logger = LoggerFactory.getLogger(UserController.class);

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UpdateUserRequest request, @AuthenticationPrincipal User currentUser) {
        try {
            logger.debug("[UserController] updateUser {} by {}", id, currentUser != null ? currentUser.getUsername() : "anonymous");
            if (currentUser == null) return ResponseEntity.status(401).build();
            String oldUsername = currentUser.getUsername();
            User updated = userService.updateProfile(id, request, oldUsername);
            // sanitize password before sending
            updated.setPassword(null);

            if (request.getUsername() != null && !request.getUsername().isBlank() && !request.getUsername().equals(oldUsername)) {
                // username changed - generate new token
                var token = userService.generateTokenFor(updated);
                var resp = new com.dinidu.pms.dto.UpdateUserResponse();
                resp.setUser(updated);
                resp.setToken(token);
                return ResponseEntity.ok(resp);
            }

            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            logger.error("[UserController] updateUser failed", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/me")
    public ResponseEntity<User> me(@AuthenticationPrincipal User currentUser) {
        if (currentUser == null) return ResponseEntity.status(401).build();
        currentUser.setPassword(null);
        return ResponseEntity.ok(currentUser);
    }
}

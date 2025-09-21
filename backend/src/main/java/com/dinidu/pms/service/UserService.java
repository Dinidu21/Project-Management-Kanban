package com.dinidu.pms.service;

import com.dinidu.pms.dto.AuthResponse;
import com.dinidu.pms.dto.UpdateUserRequest;
import com.dinidu.pms.dto.LoginRequest;
import com.dinidu.pms.dto.RegisterRequest;
import com.dinidu.pms.entity.User;
import com.dinidu.pms.repo.UserRepository;
import com.dinidu.pms.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        var user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(User.Role.MEMBER)
                .build();

        userRepository.save(user);
        var jwtToken = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(jwtToken)
                .username(user.getUsername())
                .email(user.getEmail())
                .build();
    }

    public AuthResponse authenticate(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        var user = userRepository.findByUsername(request.getUsername())
                .orElseThrow();
        var jwtToken = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(jwtToken)
                .username(user.getUsername())
                .email(user.getEmail())
                .build();
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

        public User updateProfile(Long id, UpdateUserRequest request, String currentUsername) {
                var user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));

                // only allow updating own profile (or admin in future)
                if (!user.getUsername().equals(currentUsername)) {
                        throw new RuntimeException("Unauthorized");
                }

                if (request.getUsername() != null && !request.getUsername().isBlank()) {
                        user.setUsername(request.getUsername());
                }
                if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
                if (request.getLastName() != null) user.setLastName(request.getLastName());
                if (request.getPassword() != null && !request.getPassword().isBlank()) {
                        user.setPassword(passwordEncoder.encode(request.getPassword()));
                }

                userRepository.save(user);
                return user;
        }

                public String generateTokenFor(User user) {
                        return jwtService.generateToken(user);
                }
}
package com.travels.controller;

import com.travels.model.auth.AuthRequest;
import com.travels.model.auth.AuthResponse;
import com.travels.model.auth.RegisterRequest;
import com.travels.model.auth.UserProfileResponse;
import com.travels.repository.UserRepository;
import com.travels.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (request.getEmail() == null || request.getPassword() == null || request.getName() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "name, email, and password are required"));
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Email already registered"));
        }

        String role = isAdminEmail(request.getEmail()) ? "ADMIN" : "USER";
        long userId = userRepository.create(
                request.getName().trim(),
                request.getEmail().trim().toLowerCase(),
                request.getPhone(),
                passwordEncoder.encode(request.getPassword()),
                role);

        Map<String, Object> user = buildUserResponse(userRepository.findById(userId).orElseThrow());
        String token = jwtService.generateToken(Map.of(
                "uid", userId,
                "email", user.get("email"),
                "role", role,
                "name", user.get("name")
        ));
        return ResponseEntity.status(HttpStatus.CREATED).body(new AuthResponse(token, user));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        var userOpt = userRepository.findByEmail(request.getEmail() == null ? "" : request.getEmail().trim().toLowerCase());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid email or password"));
        }
        Map<String, Object> user = userOpt.get();
        String passwordHash = String.valueOf(user.get("password_hash"));
        if (!passwordEncoder.matches(request.getPassword(), passwordHash)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid email or password"));
        }

        Map<String, Object> responseUser = buildUserResponse(user);
        String token = jwtService.generateToken(Map.of(
                "uid", user.get("id"),
                "email", responseUser.get("email"),
                "role", responseUser.get("role"),
                "name", responseUser.get("name")
        ));
        return ResponseEntity.ok(new AuthResponse(token, responseUser));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestHeader(value = "Authorization", required = false) String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }
        Map<String, Object> payload = jwtService.verifyAndParse(authorization.substring(7));
        long userId = Long.parseLong(payload.get("uid").toString());
        return userRepository.findById(userId)
                .<ResponseEntity<?>>map(user -> ResponseEntity.ok(new UserProfileResponse(buildUserResponse(user))))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized")));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestHeader(value = "Authorization", required = false) String authorization,
                                           @RequestBody Map<String, Object> payload) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }
        Map<String, Object> tokenPayload = jwtService.verifyAndParse(authorization.substring(7));
        long userId = Long.parseLong(tokenPayload.get("uid").toString());
        String name = String.valueOf(payload.getOrDefault("name", "")).trim();
        String email = String.valueOf(payload.getOrDefault("email", "")).trim().toLowerCase();
        String phone = String.valueOf(payload.getOrDefault("phone", "")).trim();
        userRepository.updateProfile(userId, name, email, phone);
        return userRepository.findById(userId)
                .<ResponseEntity<?>>map(user -> ResponseEntity.ok(Map.of("user", buildUserResponse(user))))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found")));
    }

    private boolean isAdminEmail(String email) {
        return email != null && email.equalsIgnoreCase("admin@prayagraj-travels.com");
    }

    private Map<String, Object> buildUserResponse(Map<String, Object> user) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.get("id"));
        response.put("name", user.get("name"));
        response.put("email", user.get("email"));
        response.put("phone", user.get("phone"));
        response.put("role", user.get("role"));
        return response;
    }
}
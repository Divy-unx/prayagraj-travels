package com.travels.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.travels.model.auth.AuthRequest;
import com.travels.model.auth.RegisterRequest;
import com.travels.repository.UserRepository;
import com.travels.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class AuthServiceValidationTest {

    @Mock private UserRepository userRepository;
    @Mock private RedisTemplate<String, Object> redisTemplate;
    @Mock private EmailService emailService;
    @Mock private RateLimitService rateLimitService;
    @Mock private DisposableEmailService disposableEmailService;
    @Mock private JdbcTemplate jdbcTemplate;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        when(rateLimitService.isAllowed(anyString(), anyInt(), anyLong())).thenReturn(true);
        authService = new AuthService(
                userRepository, redisTemplate, emailService, rateLimitService,
                disposableEmailService, new JwtService(new ObjectMapper(), "a".repeat(32), 15),
                new BCryptPasswordEncoder(), jdbcTemplate, new ObjectMapper());
    }

    @Test
    void rejectsInvalidRegistrationInputBeforeDatabaseWrite() {
        RegisterRequest request = new RegisterRequest();
        request.setName("Test User");
        request.setEmail("not-an-email");
        request.setPassword("Weak");

        assertThrows(IllegalArgumentException.class, () -> authService.register(request));
        verifyNoInteractions(userRepository);
    }

    @Test
    void rejectsDuplicateRegistration() {
        RegisterRequest request = new RegisterRequest();
        request.setName("Test User");
        request.setEmail("user@example.com");
        request.setPassword("StrongPass1!");
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(java.util.Map.of("id", 1L)));

        assertThrows(AuthService.DuplicateEmailException.class, () -> authService.register(request));
        verify(userRepository, never()).create(anyString(), anyString(), any(), anyString(), anyString());
    }

    @Test
    void rejectsMissingLoginCredentialsWithoutPasswordLookup() {
        AuthRequest request = new AuthRequest();
        request.setEmail("user@example.com");

        assertThrows(AuthService.AuthException.class, () -> authService.login(request, "127.0.0.1"));
        verifyNoInteractions(userRepository);
    }
}

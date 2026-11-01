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
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class AuthServiceValidationTest {

    @Mock private UserRepository userRepository;
    @Mock private RedisTemplate<String, Object> redisTemplate;
    @Mock private ValueOperations<String, Object> valueOperations;
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
                new BCryptPasswordEncoder(), jdbcTemplate);
        ReflectionTestUtils.setField(authService, "adminEmails", "admin@prayagraj-travels.com");
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
        request.setPhone("9876543210");
        request.setPassword("StrongPass1!");
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(java.util.Map.of("id", 1L)));

        assertThrows(AuthService.DuplicateEmailException.class, () -> authService.register(request));
        verify(userRepository, never()).create(anyString(), anyString(), any(), anyString(), anyString());
    }

    @Test
    void rejectsDuplicatePhone() {
        RegisterRequest request = new RegisterRequest();
        request.setName("Test User");
        request.setEmail("user@example.com");
        request.setPhone("9876543210");
        request.setPassword("StrongPass1!");
        when(userRepository.findByPhone("9876543210")).thenReturn(Optional.of(java.util.Map.of("id", 1L)));

        assertThrows(AuthService.DuplicatePhoneException.class, () -> authService.register(request));
        verify(userRepository, never()).create(anyString(), anyString(), any(), anyString(), anyString());
    }

        @Test
        void registersImmediatelyWithoutSendingVerificationEmail() {
        RegisterRequest request = new RegisterRequest();
        request.setName("Test User");
        request.setEmail("user@example.com");
        request.setPhone("9876543210");
        request.setPassword("StrongPass1!");

        Map<String, Object> user = Map.of(
            "id", 7L,
            "name", "Test User",
            "email", "user@example.com",
            "phone", "9876543210",
            "role", "USER",
            "is_email_verified", 0,
            "is_active", 1,
            "auth_provider", "LOCAL");
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.empty());
        when(userRepository.findByPhone("9876543210")).thenReturn(Optional.empty());
        when(userRepository.create(eq("Test User"), eq("user@example.com"), eq("9876543210"), anyString(), eq("USER")))
            .thenReturn(7L);
        when(userRepository.findById(7L)).thenReturn(Optional.of(user));
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);

        Map<String, Object> result = authService.register(request);

        assertNotNull(result.get("accessToken"));
        assertNotNull(result.get("refreshToken"));
        verify(userRepository).create(eq("Test User"), eq("user@example.com"), eq("9876543210"),
            argThat(hash -> new BCryptPasswordEncoder().matches("StrongPass1!", hash)), eq("USER"));
        verifyNoInteractions(emailService);
        }

    @Test
    void rejectsMissingLoginCredentialsWithoutPasswordLookup() {
        AuthRequest request = new AuthRequest();
        request.setEmail("user@example.com");

        assertThrows(AuthService.AuthException.class, () -> authService.login(request, "127.0.0.1"));
        verifyNoInteractions(userRepository);
    }

    @Test
    void logsInWithBcryptPasswordAndIssuesJwt() {
        Map<String, Object> user = Map.of(
                "id", 7L,
                "name", "Test User",
                "email", "user@example.com",
                "phone", "9876543210",
                "role", "USER",
                "password_hash", new BCryptPasswordEncoder().encode("StrongPass1!"),
                "is_active", 1,
                "is_email_verified", 0,
                "auth_provider", "LOCAL");
        AuthRequest request = new AuthRequest();
        request.setEmail("user@example.com");
        request.setPassword("StrongPass1!");
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);

        Map<String, Object> result = authService.login(request, "127.0.0.1");

        assertNotNull(result.get("accessToken"));
        assertNotNull(result.get("refreshToken"));
        verify(userRepository).updateLastLogin(7L);
    }

    @Test
    void rejectsIncorrectPassword() {
        Map<String, Object> user = Map.of(
                "id", 7L,
                "email", "user@example.com",
                "password_hash", new BCryptPasswordEncoder().encode("StrongPass1!"),
                "is_active", 1);
        AuthRequest request = new AuthRequest();
        request.setEmail("user@example.com");
        request.setPassword("WrongPass1!");
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));

        assertThrows(AuthService.AuthException.class, () -> authService.login(request, "127.0.0.1"));
        verify(userRepository, never()).updateLastLogin(anyLong());
    }

    @Test
    void rejectsDisabledAccount() {
        Map<String, Object> user = Map.of(
                "id", 7L,
                "email", "user@example.com",
                "password_hash", new BCryptPasswordEncoder().encode("StrongPass1!"),
                "is_active", 0);
        AuthRequest request = new AuthRequest();
        request.setEmail("user@example.com");
        request.setPassword("StrongPass1!");
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));

        assertThrows(AuthService.AuthException.class, () -> authService.login(request, "127.0.0.1"));
        verify(userRepository, never()).updateLastLogin(anyLong());
    }
}

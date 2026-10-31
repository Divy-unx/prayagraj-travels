package com.travels.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private static final String SECRET = "a".repeat(32);

    @Test
    void roundTripsClaimsAndRejectsTampering() {
        JwtService service = new JwtService(new ObjectMapper(), SECRET, 15);
        String token = service.generateToken(Map.of("uid", 42L, "role", "USER"));

        assertEquals(42, ((Number) service.verifyAndParse(token).get("uid")).longValue());

        String tampered = token.substring(0, token.length() - 1)
                + (token.endsWith("a") ? "b" : "a");
        assertThrows(IllegalArgumentException.class, () -> service.verifyAndParse(tampered));
    }

    @Test
    void rejectsUnsupportedAlgorithmHeader() throws Exception {
        JwtService service = new JwtService(new ObjectMapper(), SECRET, 15);
        String token = service.generateToken(Map.of("uid", 42L));
        String[] parts = token.split("\\.");
        String header = java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(
                new ObjectMapper().writeValueAsBytes(Map.of("alg", "none", "typ", "JWT")));
        String forged = header + "." + parts[1] + "." + parts[2];

        assertThrows(IllegalArgumentException.class, () -> service.verifyAndParse(forged));
    }

    @Test
    void requiresStrongSecret() {
        assertThrows(IllegalArgumentException.class,
                () -> new JwtService(new ObjectMapper(), "short", 15));
    }
}

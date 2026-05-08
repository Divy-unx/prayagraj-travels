package com.travels.security;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Stateless HS256 JWT implementation.
 *
 * <p>The {@code generateToken} method uses {@code expirationSeconds} derived from
 * {@code app.jwt.access-expiry-minutes} (default 15 min).  Refresh tokens are
 * long-lived opaque strings stored in Redis — they are never passed through this class.
 */
@Service
public class JwtService {

    private static final String HMAC_SHA256 = "HmacSHA256";

    private final ObjectMapper objectMapper;
    private final byte[] secretBytes;
    private final long expirationSeconds;

    public JwtService(
            ObjectMapper objectMapper,
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.access-expiry-minutes:15}") long expirationMinutes) {
        this.objectMapper      = objectMapper;
        this.secretBytes       = secret.getBytes(StandardCharsets.UTF_8);
        this.expirationSeconds = expirationMinutes * 60L;
    }

    /**
     * Generate a signed JWT with the supplied claims.
     * Automatically adds {@code iat} and {@code exp} fields.
     */
    public String generateToken(Map<String, Object> claims) {
        long now = Instant.now().getEpochSecond();
        Map<String, Object> payload = new HashMap<>(claims);
        payload.put("iat", now);
        payload.put("exp", now + expirationSeconds);

        try {
            String header    = base64Url(objectMapper.writeValueAsBytes(Map.of("alg", "HS256", "typ", "JWT")));
            String body      = base64Url(objectMapper.writeValueAsBytes(payload));
            String signature = sign(header + "." + body);
            return header + "." + body + "." + signature;
        } catch (Exception e) {
            throw new IllegalStateException("Unable to generate JWT", e);
        }
    }

    /**
     * Verify a JWT's signature and expiry, then return the decoded claims.
     *
     * @throws IllegalArgumentException on invalid format, bad signature, or expiry
     */
    public Map<String, Object> verifyAndParse(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                throw new IllegalArgumentException("Invalid token format");
            }
            String expected = sign(parts[0] + "." + parts[1]);
            if (!expected.equals(parts[2])) {
                throw new IllegalArgumentException("Invalid token signature");
            }

            Map<String, Object> payload = objectMapper.readValue(
                    Base64.getUrlDecoder().decode(parts[1]),
                    new TypeReference<>() {});

            Number exp = (Number) payload.get("exp");
            if (exp == null || Instant.now().getEpochSecond() > exp.longValue()) {
                throw new IllegalArgumentException("Token expired");
            }
            return payload;
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid token", e);
        }
    }

    private String sign(String content) {
        try {
            Mac mac = Mac.getInstance(HMAC_SHA256);
            mac.init(new SecretKeySpec(secretBytes, HMAC_SHA256));
            return base64Url(mac.doFinal(content.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException("Unable to sign JWT", e);
        }
    }

    private String base64Url(byte[] data) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(data);
    }
}

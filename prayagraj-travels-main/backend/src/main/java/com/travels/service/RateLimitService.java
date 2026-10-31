package com.travels.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.stereotype.Service;

import java.time.Duration;

/**
 * Redis-backed sliding-window rate limiter.
 *
 * <p>Key conventions:
 * <ul>
 *   <li>{@code rate:otp:{email}}    — max 5 per 3600 s</li>
 *   <li>{@code rate:login:{ip}}     — max 10 per 900 s</li>
 *   <li>{@code rate:register:{ip}}  — max 10 per 900 s</li>
 * </ul>
 */
@Service
public class RateLimitService {

    private static final Logger log = LoggerFactory.getLogger(RateLimitService.class);

    private final RedisTemplate<String, Object> redisTemplate;

    public RateLimitService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    /**
     * Check whether the given key is within the allowed rate.
     *
     * <p>If the key does not exist it is created with TTL {@code windowSeconds}.
     * Subsequent calls within the window simply increment the counter.
     *
     * @param key           redis key (caller should use namespaced keys like {@code rate:otp:{email}})
     * @param maxAttempts   maximum allowed hits within the window
     * @param windowSeconds sliding window length in seconds
     * @return {@code true} if the request is allowed (counter is below the limit after incrementing),
     *         {@code false} when the limit is already reached
     */
    public boolean isAllowed(String key, int maxAttempts, long windowSeconds) {
        try {
            ValueOperations<String, Object> ops = redisTemplate.opsForValue();
            Long count = ops.increment(key);
            if (count == null) {
                // Redis returned null — fail open to avoid blocking legitimate traffic
                log.warn("Redis returned null for key '{}' — failing open", key);
                return true;
            }
            if (count == 1L) {
                // First hit — set the expiry for the window
                redisTemplate.expire(key, Duration.ofSeconds(windowSeconds));
            }
            boolean allowed = count <= maxAttempts;
            if (!allowed) {
                log.warn("Rate limit exceeded for key '{}': count={}, max={}", key, count, maxAttempts);
            }
            return allowed;
        } catch (Exception e) {
            // Redis failure — fail open so legitimate users are not blocked
            log.error("Rate limit check failed for key '{}': {}", key, e.getMessage());
            return true;
        }
    }

    /**
     * Reset the counter for a key (e.g. after successful action).
     */
    public void reset(String key) {
        try {
            redisTemplate.delete(key);
        } catch (Exception e) {
            log.error("Failed to reset rate limit key '{}': {}", key, e.getMessage());
        }
    }
}

package com.travels.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * Production-grade request logging filter.
 *
 * Logs method, URI, query string, status, response time, and a unique request ID
 * for every HTTP request. The request ID is also set in MDC for downstream loggers.
 */
@Component
public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RequestLoggingFilter.class);

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        // Generate unique request ID for traceability
        String requestId = UUID.randomUUID().toString().substring(0, 8);
        MDC.put("requestId", requestId);

        String method = request.getMethod();
        String uri = request.getRequestURI();
        String queryString = request.getQueryString();
        String fullPath = queryString != null ? uri + "?" + queryString : uri;
        String clientIp = getClientIp(request);

        long start = System.currentTimeMillis();

        try {
            log.info("[{}] → {} {} from {}", requestId, method, fullPath, clientIp);
            filterChain.doFilter(request, response);
        } catch (Exception e) {
            log.error("[{}] ✗ {} {} failed: {}", requestId, method, fullPath, e.getMessage());
            throw e;
        } finally {
            long duration = System.currentTimeMillis() - start;
            int status = response.getStatus();

            if (status >= 500) {
                log.error("[{}] ← {} {} → {} ({} ms)", requestId, method, fullPath, status, duration);
            } else if (status >= 400) {
                log.warn("[{}] ← {} {} → {} ({} ms)", requestId, method, fullPath, status, duration);
            } else {
                log.info("[{}] ← {} {} → {} ({} ms)", requestId, method, fullPath, status, duration);
            }

            MDC.remove("requestId");
        }
    }

    /**
     * Extract real client IP, handling reverse proxy headers.
     */
    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp;
        }
        return request.getRemoteAddr();
    }
}
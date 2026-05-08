package com.travels.security;

import com.travels.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * JWT authentication filter that resolves the bearer token from:
 * <ol>
 *   <li>The {@code access_token} httpOnly cookie (preferred for browser clients)</li>
 *   <li>The {@code Authorization: Bearer <token>} header (for API / mobile clients)</li>
 * </ol>
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // Only process if no authentication is already set in context
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = extractToken(request);
        if (token != null) {
            try {
                Map<String, Object> payload = jwtService.verifyAndParse(token);
                Long userId = Long.valueOf(payload.get("uid").toString());
                String email = String.valueOf(payload.get("email"));
                String role  = String.valueOf(payload.getOrDefault("role", "USER"));

                userRepository.findById(userId).ifPresent(user -> {
                    // Build principal with all fields the controllers need
                    Object emailVerifiedRaw = user.get("is_email_verified");
                    boolean emailVerified = emailVerifiedRaw != null && toBool(emailVerifiedRaw);

                    // Use HashMap — Map.of() throws NullPointerException on null values,
                    // and DB columns like phone / avatar_url can legitimately be SQL NULL.
                    java.util.HashMap<String, Object> principal = new java.util.HashMap<>();
                    principal.put("id",              userId);
                    principal.put("email",           email);
                    principal.put("role",            role);
                    principal.put("name",            safeStr(user.get("name")));
                    principal.put("phone",           safeStr(user.get("phone")));
                    principal.put("isEmailVerified", emailVerified);
                    principal.put("avatarUrl",       safeStr(user.get("avatar_url")));
                    principal.put("authProvider",    safeStr(user.getOrDefault("auth_provider", "LOCAL")));

                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                            principal,
                            null,
                            List.of(new SimpleGrantedAuthority("ROLE_" + role)));
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                });
            } catch (Exception ignored) {
                // Invalid / expired token — leave SecurityContext unauthenticated
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Extract the raw JWT string from the request.
     * Cookie takes precedence over the Authorization header.
     */
    private String extractToken(HttpServletRequest request) {
        // 1. Check access_token cookie
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("access_token".equals(cookie.getName())) {
                    String value = cookie.getValue();
                    if (value != null && !value.isBlank()) {
                        return value;
                    }
                }
            }
        }

        // 2. Fall back to Authorization: Bearer header
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String value = header.substring(7).trim();
            if (!value.isBlank()) {
                return value;
            }
        }

        return null;
    }

    private boolean toBool(Object v) {
        if (v instanceof Boolean b) return b;
        if (v instanceof Number n) return n.intValue() != 0;
        return Boolean.parseBoolean(v.toString());
    }

    private String safeStr(Object v) {
        return v == null ? "" : v.toString();
    }
}

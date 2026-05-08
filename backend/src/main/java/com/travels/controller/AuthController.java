package com.travels.controller;

import com.travels.model.auth.AuthRequest;
import com.travels.model.auth.ForgotPasswordRequest;
import com.travels.model.auth.GoogleAuthRequest;
import com.travels.model.auth.RegisterRequest;
import com.travels.model.auth.ResetPasswordRequest;
import com.travels.model.auth.VerifyEmailRequest;
import com.travels.repository.UserRepository;
import com.travels.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;
    private final UserRepository userRepository;

    public AuthController(AuthService authService, UserRepository userRepository) {
        this.authService    = authService;
        this.userRepository = userRepository;
    }

    // ── Registration ──────────────────────────────────────────────────────────

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request,
                                      HttpServletRequest req,
                                      HttpServletResponse res) {
        try {
            Map<String, Object> result = authService.register(request);
            setAuthCookies(res,
                    (String) result.get("accessToken"),
                    (String) result.get("refreshToken"));
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "user", result.get("user"),
                    "message", "Registration successful. Please verify your email."
            ));
        } catch (AuthService.DuplicateEmailException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        } catch (AuthService.DisposableEmailException e) {
            return ResponseEntity.status(422).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Registration error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Registration failed. Please try again."));
        }
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request,
                                   HttpServletRequest req,
                                   HttpServletResponse res) {
        try {
            String ip = extractClientIp(req);
            Map<String, Object> result = authService.login(request, ip);
            setAuthCookies(res,
                    (String) result.get("accessToken"),
                    (String) result.get("refreshToken"));
            return ResponseEntity.ok(Map.of("user", result.get("user")));
        } catch (AuthService.RateLimitException e) {
            return ResponseEntity.status(429).body(Map.of("error", e.getMessage()));
        } catch (AuthService.AuthException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Login error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Login failed. Please try again."));
        }
    }

    // ── Logout ────────────────────────────────────────────────────────────────

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest req, HttpServletResponse res) {
        String refreshToken = extractCookieValue(req, "refresh_token");
        authService.logout(refreshToken);
        clearAuthCookies(res);
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    // ── Email Verification ────────────────────────────────────────────────────

    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestBody VerifyEmailRequest request,
                                         HttpServletResponse res) {
        try {
            long userId = currentUserId();
            Map<String, Object> result = authService.verifyEmail(userId, request.getOtp());
            // Re-issue tokens so that emailVerified=true is embedded in the new access token
            setAuthCookies(res,
                    (String) result.get("accessToken"),
                    (String) result.get("refreshToken"));
            return ResponseEntity.ok(Map.of(
                    "user", result.get("user"),
                    "message", "Email verified successfully"
            ));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (AuthService.AuthException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Email verification error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Verification failed. Please try again."));
        }
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerification(HttpServletRequest req) {
        try {
            long userId = currentUserId();
            String ip   = extractClientIp(req);
            authService.resendVerificationOtp(userId, ip);
            return ResponseEntity.ok(Map.of("message", "Verification OTP sent to your email"));
        } catch (AuthService.RateLimitException e) {
            return ResponseEntity.status(429).body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (AuthService.AuthException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Resend verification error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Could not resend OTP. Please try again."));
        }
    }

    // ── Forgot / Reset Password ───────────────────────────────────────────────

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request,
                                            HttpServletRequest req) {
        try {
            String ip = extractClientIp(req);
            authService.forgotPassword(request.getEmail(), ip);
            // Always 200 to prevent user enumeration
            return ResponseEntity.ok(Map.of("message",
                    "If that email is registered, a password reset OTP has been sent."));
        } catch (AuthService.RateLimitException e) {
            return ResponseEntity.status(429).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Forgot password error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Could not process request. Please try again."));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request,
                                           HttpServletResponse res) {
        try {
            Map<String, Object> result = authService.resetPassword(
                    request.getEmail(), request.getOtp(), request.getNewPassword());
            setAuthCookies(res,
                    (String) result.get("accessToken"),
                    (String) result.get("refreshToken"));
            return ResponseEntity.ok(Map.of(
                    "user", result.get("user"),
                    "message", "Password reset successfully"
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (AuthService.AuthException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Reset password error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Could not reset password. Please try again."));
        }
    }

    // ── Google OAuth ──────────────────────────────────────────────────────────

    @PostMapping("/google")
    public ResponseEntity<?> googleAuth(@RequestBody GoogleAuthRequest request,
                                        HttpServletResponse res) {
        try {
            Map<String, Object> result = authService.googleAuth(request.getCredential());
            setAuthCookies(res,
                    (String) result.get("accessToken"),
                    (String) result.get("refreshToken"));
            return ResponseEntity.ok(Map.of("user", result.get("user")));
        } catch (AuthService.AuthException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Google auth error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Google authentication failed. Please try again."));
        }
    }

    // ── Token Refresh ─────────────────────────────────────────────────────────

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(HttpServletRequest req, HttpServletResponse res) {
        try {
            String refreshToken = extractCookieValue(req, "refresh_token");
            Map<String, Object> result = authService.refreshAccessToken(refreshToken);
            setAuthCookies(res,
                    (String) result.get("accessToken"),
                    (String) result.get("refreshToken"));
            return ResponseEntity.ok(Map.of("user", result.get("user")));
        } catch (AuthService.AuthException e) {
            clearAuthCookies(res);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Token refresh error: {}", e.getMessage(), e);
            clearAuthCookies(res);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Token refresh failed. Please log in again."));
        }
    }

    // ── User Info ─────────────────────────────────────────────────────────────

    @GetMapping("/me")
    public ResponseEntity<?> me() {
        try {
            Map<String, Object> principal = currentPrincipal();
            if (principal == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
            }
            long userId = ((Number) principal.get("id")).longValue();
            return userRepository.findById(userId)
                    .<ResponseEntity<?>>map(user ->
                            ResponseEntity.ok(Map.of("user", authService.buildUserResponse(user))))
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(Map.of("error", "Unauthorized")));
        } catch (Exception e) {
            log.error("/me error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Could not fetch profile"));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, Object> payload) {
        try {
            Map<String, Object> principal = currentPrincipal();
            if (principal == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
            }
            long userId = ((Number) principal.get("id")).longValue();

            String name  = trimOrNull(payload.get("name"));
            String email = payload.get("email") != null
                    ? payload.get("email").toString().trim().toLowerCase() : null;
            String phone = trimOrNull(payload.get("phone"));

            if (name == null || name.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Name is required"));
            }

            userRepository.updateProfile(userId, name, email, phone);
            return userRepository.findById(userId)
                    .<ResponseEntity<?>>map(u ->
                            ResponseEntity.ok(Map.of("user", authService.buildUserResponse(u))))
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(Map.of("error", "User not found")));
        } catch (Exception e) {
            log.error("Update profile error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Could not update profile. Please try again."));
        }
    }

    // ── Cookie Helpers ────────────────────────────────────────────────────────

    /**
     * Write httpOnly, SameSite=Lax auth cookies into the response.
     * <ul>
     *   <li>access_token  — 15 min, path /</li>
     *   <li>refresh_token — 7 days, path /api/auth/refresh</li>
     * </ul>
     */
    private void setAuthCookies(HttpServletResponse response, String accessToken, String refreshToken) {
        ResponseCookie accessCookie = ResponseCookie.from("access_token", accessToken)
                .httpOnly(true)
                .secure(false)         // set true when behind HTTPS
                .sameSite("Lax")
                .path("/")
                .maxAge(900)           // 15 minutes
                .build();

        ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", refreshToken)
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/api/auth/refresh")
                .maxAge(604800)        // 7 days
                .build();

        response.addHeader("Set-Cookie", accessCookie.toString());
        response.addHeader("Set-Cookie", refreshCookie.toString());
    }

    /** Expire both auth cookies (MaxAge=0). */
    private void clearAuthCookies(HttpServletResponse response) {
        ResponseCookie accessCookie = ResponseCookie.from("access_token", "")
                .httpOnly(true)
                .sameSite("Lax")
                .path("/")
                .maxAge(0)
                .build();

        ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", "")
                .httpOnly(true)
                .sameSite("Lax")
                .path("/api/auth/refresh")
                .maxAge(0)
                .build();

        response.addHeader("Set-Cookie", accessCookie.toString());
        response.addHeader("Set-Cookie", refreshCookie.toString());
    }

    // ── SecurityContext Helpers ───────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private Map<String, Object> currentPrincipal() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;
        Object principal = auth.getPrincipal();
        if (principal instanceof Map<?, ?>) {
            return (Map<String, Object>) principal;
        }
        return null;
    }

    private long currentUserId() {
        Map<String, Object> principal = currentPrincipal();
        if (principal == null) {
            throw new AuthService.AuthException("Not authenticated");
        }
        Object id = principal.get("id");
        if (id == null) {
            throw new AuthService.AuthException("Not authenticated");
        }
        return ((Number) id).longValue();
    }

    // ── Request Helpers ───────────────────────────────────────────────────────

    private String extractClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private String extractCookieValue(HttpServletRequest request, String cookieName) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return null;
        for (Cookie cookie : cookies) {
            if (cookieName.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    private String trimOrNull(Object val) {
        if (val == null) return null;
        String s = val.toString().trim();
        return s.isBlank() ? null : s;
    }
}

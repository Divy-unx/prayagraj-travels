package com.travels.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.travels.model.auth.AuthRequest;
import com.travels.model.auth.RegisterRequest;
import com.travels.repository.UserRepository;
import com.travels.security.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    private static final Pattern UPPER = Pattern.compile(".*[A-Z].*");
    private static final Pattern LOWER = Pattern.compile(".*[a-z].*");
    private static final Pattern DIGIT = Pattern.compile(".*\\d.*");
    private static final Pattern SPECIAL = Pattern.compile(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?].*");

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    // Redis TTL constants
    private static final long OTP_VERIFY_TTL_SECONDS = 600L;   // 10 minutes
    private static final long OTP_RESET_TTL_SECONDS  = 900L;   // 15 minutes

    // Rate limit constants
    private static final int  OTP_RATE_MAX      = 5;
    private static final long OTP_RATE_WINDOW   = 3600L;
    private static final int  LOGIN_RATE_MAX     = 10;
    private static final long LOGIN_RATE_WINDOW  = 900L;

    private final UserRepository userRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    private final EmailService emailService;
    private final RateLimitService rateLimitService;
    private final DisposableEmailService disposableEmailService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    @Value("${app.jwt.access-expiry-minutes:15}")
    private long accessExpiryMinutes;

    @Value("${app.jwt.refresh-expiry-days:7}")
    private long refreshExpiryDays;

    @Value("${app.google.client-id:}")
    private String googleClientId;

    @Value("${app.admin.emails:admin@prayagraj-travels.com}")
    private String adminEmails;

    public AuthService(
            UserRepository userRepository,
            RedisTemplate<String, Object> redisTemplate,
            EmailService emailService,
            RateLimitService rateLimitService,
            DisposableEmailService disposableEmailService,
            JwtService jwtService,
            PasswordEncoder passwordEncoder,
            JdbcTemplate jdbcTemplate,
            ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.redisTemplate = redisTemplate;
        this.emailService = emailService;
        this.rateLimitService = rateLimitService;
        this.disposableEmailService = disposableEmailService;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
    }

    // ── Registration ──────────────────────────────────────────────────────────

    /**
     * Register a new local user, send a verification OTP and return auth tokens.
     */
    public Map<String, Object> register(RegisterRequest req) {
        // Basic null checks
        if (req.getName() == null || req.getName().isBlank()) {
            throw new IllegalArgumentException("Name is required");
        }
        if (req.getEmail() == null || req.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (req.getPassword() == null || req.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }

        String email = req.getEmail().trim().toLowerCase();
        validateEmailFormat(email);
        validatePasswordStrength(req.getPassword());

        // Check for duplicate email
        if (userRepository.findByEmail(email).isPresent()) {
            throw new DuplicateEmailException("Email already registered");
        }

        String role = isAdminEmail(email) ? "ADMIN" : "USER";
        long userId = userRepository.create(
                req.getName().trim(),
                email,
                req.getPhone(),
                passwordEncoder.encode(req.getPassword()),
                role);

        // Send verification OTP asynchronously (errors are swallowed inside sendVerificationOtp)
        try {
            sendVerificationOtp(userId);
        } catch (Exception e) {
            log.warn("Could not send verification OTP during registration for userId={}: {}", userId, e.getMessage());
        }

        Map<String, Object> user = userRepository.findById(userId).orElseThrow();
        String accessToken  = generateAccessToken(buildUserMap(user));
        String refreshToken = generateRefreshToken(userId);

        Map<String, Object> result = new HashMap<>();
        result.put("user", buildUserResponse(user));
        result.put("accessToken", accessToken);
        result.put("refreshToken", refreshToken);
        return result;
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    /**
     * Authenticate a local user by email + password.
     */
    public Map<String, Object> login(AuthRequest req, String ipAddress) {
        if (!rateLimitService.isAllowed("rate:login:" + ipAddress, LOGIN_RATE_MAX, LOGIN_RATE_WINDOW)) {
            throw new RateLimitException("Too many login attempts. Please wait before trying again.");
        }

        String email = (req.getEmail() == null ? "" : req.getEmail().trim().toLowerCase());
        Optional<Map<String, Object>> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            throw new AuthException("Invalid email or password");
        }

        Map<String, Object> user = userOpt.get();

        // Google-only accounts have no password_hash
        String passwordHash = getString(user, "password_hash");
        if (passwordHash == null || passwordHash.isBlank()) {
            throw new AuthException("This account uses Google Sign-In. Please log in with Google.");
        }

        if (!passwordEncoder.matches(req.getPassword(), passwordHash)) {
            throw new AuthException("Invalid email or password");
        }

        // Soft-deleted / banned check
        Object isActive = user.get("is_active");
        if (isActive != null && !toBool(isActive)) {
            throw new AuthException("Account has been deactivated. Please contact support.");
        }

        userRepository.updateLastLogin(getLong(user, "id"));
        rateLimitService.reset("rate:login:" + ipAddress);

        String accessToken  = generateAccessToken(buildUserMap(user));
        String refreshToken = generateRefreshToken(getLong(user, "id"));

        Map<String, Object> result = new HashMap<>();
        result.put("user", buildUserResponse(user));
        result.put("accessToken", accessToken);
        result.put("refreshToken", refreshToken);
        return result;
    }

    // ── Email Verification ────────────────────────────────────────────────────

    /**
     * Generate + store a 6-digit OTP in Redis and insert a token row,
     * then dispatch the verification email.
     */
    public void sendVerificationOtp(long userId) {
        Map<String, Object> user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthException("User not found"));

        String otp   = generateOtp();
        String token = generateToken();

        // Store OTP in Redis with 10-minute TTL
        ValueOperations<String, Object> ops = redisTemplate.opsForValue();
        ops.set("otp:verify:" + userId, otp, Duration.ofSeconds(OTP_VERIFY_TTL_SECONDS));

        // Also persist to DB for link-based fallback
        LocalDateTime expiresAt = LocalDateTime.now(ZoneOffset.UTC).plusSeconds(OTP_VERIFY_TTL_SECONDS);
        jdbcTemplate.update(
                "INSERT INTO email_verification_tokens (user_id, token, otp, expires_at) VALUES (?, ?, ?, ?)",
                userId, token, otp, expiresAt);

        String name  = getString(user, "name");
        String email = getString(user, "email");
        emailService.sendOtpEmail(email, name, otp, "Email Verification");
    }

    /**
     * Verify an OTP entered by the user (from JWT-authenticated session).
     */
    public Map<String, Object> verifyEmail(long userId, String otp) {
        if (otp == null || otp.isBlank()) {
            throw new IllegalArgumentException("OTP is required");
        }

        Object stored = redisTemplate.opsForValue().get("otp:verify:" + userId);
        if (stored == null) {
            throw new IllegalArgumentException("OTP has expired or was never issued. Please request a new one.");
        }
        if (!stored.toString().equals(otp.trim())) {
            throw new IllegalArgumentException("Invalid OTP");
        }

        // Mark verified
        userRepository.updateEmailVerified(userId, true);
        redisTemplate.delete("otp:verify:" + userId);

        // Mark token used in DB
        jdbcTemplate.update(
                "UPDATE email_verification_tokens SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL",
                userId);

        Map<String, Object> user = userRepository.findById(userId).orElseThrow();

        // Send welcome email
        try {
            emailService.sendWelcomeEmail(getString(user, "email"), getString(user, "name"));
        } catch (Exception e) {
            log.warn("Welcome email failed for userId={}: {}", userId, e.getMessage());
        }

        String accessToken  = generateAccessToken(buildUserMap(user));
        String refreshToken = generateRefreshToken(userId);

        Map<String, Object> result = new HashMap<>();
        result.put("user", buildUserResponse(user));
        result.put("accessToken", accessToken);
        result.put("refreshToken", refreshToken);
        return result;
    }

    /**
     * Resend verification OTP with per-email rate limiting.
     */
    public void resendVerificationOtp(long userId, String ipAddress) {
        Map<String, Object> user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthException("User not found"));
        String email = getString(user, "email");

        if (!rateLimitService.isAllowed("rate:otp:" + email, OTP_RATE_MAX, OTP_RATE_WINDOW)) {
            throw new RateLimitException("Too many OTP requests. Please wait before requesting again.");
        }

        // Check already verified
        Object isVerified = user.get("is_email_verified");
        if (isVerified != null && toBool(isVerified)) {
            throw new IllegalStateException("Email is already verified");
        }

        sendVerificationOtp(userId);
    }

    // ── Forgot / Reset Password ───────────────────────────────────────────────

    /**
     * Initiate a password reset flow: generate OTP, store in Redis + DB, send email.
     * Always returns successfully (to prevent user enumeration).
     */
    public void forgotPassword(String email, String ipAddress) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        email = email.trim().toLowerCase();

        if (!rateLimitService.isAllowed("rate:otp:" + email, OTP_RATE_MAX, OTP_RATE_WINDOW)) {
            throw new RateLimitException("Too many password reset requests. Please wait before trying again.");
        }

        Optional<Map<String, Object>> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            // Silently return to prevent user enumeration
            log.info("Forgot password for non-existent email: {}", email);
            return;
        }

        Map<String, Object> user = userOpt.get();
        long userId  = getLong(user, "id");
        String otp   = generateOtp();
        String token = generateToken();

        // Store OTP in Redis with 15-minute TTL
        redisTemplate.opsForValue().set("otp:reset:" + email, otp, Duration.ofSeconds(OTP_RESET_TTL_SECONDS));

        // Persist to DB
        LocalDateTime expiresAt = LocalDateTime.now(ZoneOffset.UTC).plusSeconds(OTP_RESET_TTL_SECONDS);
        jdbcTemplate.update(
                "INSERT INTO password_reset_tokens (user_id, token, otp, expires_at) VALUES (?, ?, ?, ?)",
                userId, token, otp, expiresAt);

        emailService.sendPasswordResetEmail(getString(user, "email"), getString(user, "name"), otp);
    }

    /**
     * Complete password reset: validate OTP, enforce strength, update password hash.
     */
    public Map<String, Object> resetPassword(String email, String otp, String newPassword) {
        if (email == null || email.isBlank()) throw new IllegalArgumentException("Email is required");
        if (otp == null || otp.isBlank())     throw new IllegalArgumentException("OTP is required");
        if (newPassword == null)              throw new IllegalArgumentException("New password is required");

        email = email.trim().toLowerCase();
        validatePasswordStrength(newPassword);

        Object stored = redisTemplate.opsForValue().get("otp:reset:" + email);
        if (stored == null) {
            throw new IllegalArgumentException("OTP has expired or was never issued. Please request a new one.");
        }
        if (!stored.toString().equals(otp.trim())) {
            throw new IllegalArgumentException("Invalid OTP");
        }

        Map<String, Object> user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException("User not found"));
        long userId = getLong(user, "id");

        userRepository.updatePassword(userId, passwordEncoder.encode(newPassword));
        redisTemplate.delete("otp:reset:" + email);

        // Mark token used
        jdbcTemplate.update(
                "UPDATE password_reset_tokens SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL",
                userId);

        // Invalidate all existing refresh tokens for this user by pattern
        // (best-effort; no strict guarantee with Redis SCAN in cluster mode)
        // We simply return fresh tokens after password change
        Map<String, Object> updatedUser = userRepository.findById(userId).orElseThrow();
        String accessToken  = generateAccessToken(buildUserMap(updatedUser));
        String refreshToken = generateRefreshToken(userId);

        Map<String, Object> result = new HashMap<>();
        result.put("user", buildUserResponse(updatedUser));
        result.put("accessToken", accessToken);
        result.put("refreshToken", refreshToken);
        return result;
    }

    // ── Google OAuth ──────────────────────────────────────────────────────────

    /**
     * Authenticate or register via Google ID token.
     * Calls Google's tokeninfo endpoint to validate and extract claims.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> googleAuth(String credential) {
        if (credential == null || credential.isBlank()) {
            throw new IllegalArgumentException("Google credential is required");
        }

        // Verify with Google tokeninfo
        String url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + credential;
        Map<String, Object> googleClaims;
        try {
            RestTemplate rest = new RestTemplate();
            String json = rest.getForObject(url, String.class);
            googleClaims = objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            log.error("Google tokeninfo request failed: {}", e.getMessage());
            throw new AuthException("Failed to verify Google credential");
        }

        // email_verified must be "true"
        String emailVerified = (String) googleClaims.get("email_verified");
        if (!"true".equals(emailVerified)) {
            throw new AuthException("Google account email is not verified");
        }

        // Validate audience if client-id is configured
        if (googleClientId != null && !googleClientId.isBlank()) {
            String aud = (String) googleClaims.get("aud");
            if (!googleClientId.equals(aud)) {
                throw new AuthException("Google token audience mismatch");
            }
        }

        String googleId   = (String) googleClaims.get("sub");
        String email      = ((String) googleClaims.get("email")).trim().toLowerCase();
        String name       = (String) googleClaims.getOrDefault("name", email);
        String avatarUrl  = (String) googleClaims.get("picture");

        // Try to find by google_id first, then by email
        Optional<Map<String, Object>> userOpt = userRepository.findByGoogleId(googleId);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmail(email);
        }

        long userId;
        Map<String, Object> user;

        if (userOpt.isPresent()) {
            user   = userOpt.get();
            userId = getLong(user, "id");
            // Link google_id if not already linked
            Object existingGoogleId = user.get("google_id");
            if (existingGoogleId == null || existingGoogleId.toString().isBlank()) {
                userRepository.updateGoogleId(userId, googleId, avatarUrl);
            }
            // Ensure email is verified
            Object isVerified = user.get("is_email_verified");
            if (isVerified == null || !toBool(isVerified)) {
                userRepository.updateEmailVerified(userId, true);
            }
            userRepository.updateLastLogin(userId);
            user = userRepository.findById(userId).orElse(user);
        } else {
            // Create new Google user
            String role = isAdminEmail(email) ? "ADMIN" : "USER";
            userId = userRepository.createGoogleUser(name, email, googleId, avatarUrl, role);
            userRepository.updateLastLogin(userId);
            user = userRepository.findById(userId).orElseThrow();

            // Send welcome email for new Google signups
            try {
                emailService.sendWelcomeEmail(email, name);
            } catch (Exception e) {
                log.warn("Welcome email failed for Google user {}: {}", email, e.getMessage());
            }
        }

        String accessToken  = generateAccessToken(buildUserMap(user));
        String refreshToken = generateRefreshToken(userId);

        Map<String, Object> result = new HashMap<>();
        result.put("user", buildUserResponse(user));
        result.put("accessToken", accessToken);
        result.put("refreshToken", refreshToken);
        return result;
    }

    // ── Token Management ──────────────────────────────────────────────────────

    /**
     * Generate a short-lived access token (15 min by default).
     * Includes uid, email, role, name, emailVerified in claims.
     */
    public String generateAccessToken(Map<String, Object> user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("uid",           user.get("id"));
        claims.put("email",         user.get("email"));
        claims.put("role",          user.getOrDefault("role", "USER"));
        claims.put("name",          user.get("name"));
        claims.put("emailVerified", user.getOrDefault("emailVerified", false));
        return jwtService.generateToken(claims);
    }

    /**
     * Generate a long-lived refresh token (7 days), stored in Redis.
     */
    public String generateRefreshToken(long userId) {
        String token = generateToken();
        redisTemplate.opsForValue().set(
                "refresh:" + token,
                String.valueOf(userId),
                Duration.ofDays(refreshExpiryDays));
        return token;
    }

    /**
     * Validate a refresh token, look up the userId, find the user,
     * and issue a new access token.
     */
    public Map<String, Object> refreshAccessToken(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new AuthException("Refresh token is required");
        }
        Object storedUserId = redisTemplate.opsForValue().get("refresh:" + refreshToken);
        if (storedUserId == null) {
            throw new AuthException("Refresh token is invalid or has expired");
        }

        long userId = Long.parseLong(storedUserId.toString());
        Map<String, Object> user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthException("User not found"));

        Object isActive = user.get("is_active");
        if (isActive != null && !toBool(isActive)) {
            throw new AuthException("Account has been deactivated");
        }

        String newAccessToken = generateAccessToken(buildUserMap(user));

        Map<String, Object> result = new HashMap<>();
        result.put("user", buildUserResponse(user));
        result.put("accessToken", newAccessToken);
        result.put("refreshToken", refreshToken); // return same refresh token (sliding would delete + reissue)
        return result;
    }

    /**
     * Revoke a refresh token (logout).
     */
    public void logout(String refreshToken) {
        if (refreshToken != null && !refreshToken.isBlank()) {
            redisTemplate.delete("refresh:" + refreshToken);
        }
    }

    // ── Validation Helpers ────────────────────────────────────────────────────

    /**
     * Validate email format and reject disposable domains.
     *
     * @throws IllegalArgumentException on invalid format
     * @throws DisposableEmailException on disposable domain
     */
    public void validateEmailFormat(String email) {
        if (email == null || !EMAIL_PATTERN.matcher(email).matches()) {
            throw new IllegalArgumentException("Invalid email format");
        }
        if (disposableEmailService.isDisposable(email)) {
            throw new DisposableEmailException("Disposable email addresses are not allowed");
        }
    }

    /**
     * Enforce password complexity rules.
     *
     * @throws IllegalArgumentException when the password does not meet requirements
     */
    public void validatePasswordStrength(String password) {
        if (password == null || password.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters long");
        }
        if (!UPPER.matcher(password).matches()) {
            throw new IllegalArgumentException("Password must contain at least one uppercase letter");
        }
        if (!LOWER.matcher(password).matches()) {
            throw new IllegalArgumentException("Password must contain at least one lowercase letter");
        }
        if (!DIGIT.matcher(password).matches()) {
            throw new IllegalArgumentException("Password must contain at least one digit");
        }
        if (!SPECIAL.matcher(password).matches()) {
            throw new IllegalArgumentException(
                    "Password must contain at least one special character (!@#$%^&*()_+-=[]{};\\':\"|,.<>/?)"
            );
        }
    }

    // ── Private Utilities ─────────────────────────────────────────────────────

    private String generateOtp() {
        return String.format("%06d", SECURE_RANDOM.nextInt(1_000_000));
    }

    private String generateToken() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    private boolean isAdminEmail(String email) {
        if (email == null) return false;
        for (String admin : adminEmails.split(",")) {
            if (email.equalsIgnoreCase(admin.trim())) return true;
        }
        return false;
    }

    /** Build the minimal map that generateAccessToken() needs. */
    private Map<String, Object> buildUserMap(Map<String, Object> dbRow) {
        Map<String, Object> m = new HashMap<>();
        m.put("id",            dbRow.get("id"));
        m.put("email",         getString(dbRow, "email"));
        m.put("role",          dbRow.getOrDefault("role", "USER"));
        m.put("name",          getString(dbRow, "name"));
        Object v = dbRow.get("is_email_verified");
        m.put("emailVerified", v != null && toBool(v));
        return m;
    }

    /**
     * Build the user response object that is returned to the client.
     * Includes: id, name, email, phone, role, isEmailVerified, authProvider, avatarUrl.
     */
    public Map<String, Object> buildUserResponse(Map<String, Object> user) {
        Map<String, Object> resp = new HashMap<>();
        resp.put("id",              user.get("id"));
        resp.put("name",            getString(user, "name"));
        resp.put("email",           getString(user, "email"));
        resp.put("phone",           user.get("phone"));
        resp.put("role",            user.getOrDefault("role", "USER"));

        Object v = user.get("is_email_verified");
        resp.put("isEmailVerified", v != null && toBool(v));

        Object ap = user.get("auth_provider");
        resp.put("authProvider",    ap != null ? ap.toString() : "LOCAL");
        resp.put("avatarUrl",       user.get("avatar_url"));
        return resp;
    }

    // ── Tiny type coercions ───────────────────────────────────────────────────

    private String getString(Map<String, Object> map, String key) {
        Object v = map.get(key);
        return v == null ? null : v.toString();
    }

    private long getLong(Map<String, Object> map, String key) {
        Object v = map.get(key);
        if (v == null) throw new IllegalStateException("Missing field: " + key);
        return ((Number) v).longValue();
    }

    private boolean toBool(Object v) {
        if (v instanceof Boolean b) return b;
        if (v instanceof Number n) return n.intValue() != 0;
        return Boolean.parseBoolean(v.toString());
    }

    // ── Inner exception types ─────────────────────────────────────────────────

    public static class AuthException extends RuntimeException {
        public AuthException(String msg) { super(msg); }
    }

    public static class DuplicateEmailException extends RuntimeException {
        public DuplicateEmailException(String msg) { super(msg); }
    }

    public static class RateLimitException extends RuntimeException {
        public RateLimitException(String msg) { super(msg); }
    }

    public static class DisposableEmailException extends RuntimeException {
        public DisposableEmailException(String msg) { super(msg); }
    }
}

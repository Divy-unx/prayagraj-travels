package com.travels.repository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public class UserRepository {

    @Autowired
    private JdbcTemplate jdbc;

    // ── Existing methods (unchanged) ──────────────────────────────────────────

    public Optional<Map<String, Object>> findByEmail(String email) {
        List<Map<String, Object>> rows = jdbc.queryForList("SELECT * FROM users WHERE email = ?", email);
        return rows.isEmpty() ? Optional.empty() : Optional.of(rows.get(0));
    }

    public Optional<Map<String, Object>> findById(Long id) {
        List<Map<String, Object>> rows = jdbc.queryForList("SELECT * FROM users WHERE id = ?", id);
        return rows.isEmpty() ? Optional.empty() : Optional.of(rows.get(0));
    }

    public long create(String name, String email, String phone, String passwordHash, String role) {
        String sql = "INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbc.update(conn -> {
            PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, name);
            ps.setString(2, email);
            ps.setString(3, phone);
            ps.setString(4, passwordHash);
            ps.setString(5, role);
            return ps;
        }, keyHolder);
        return keyHolder.getKey().longValue();
    }

    public void updateProfile(long id, String name, String email, String phone) {
        jdbc.update("UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?", name, email, phone, id);
    }

    public void updatePassword(long id, String passwordHash) {
        jdbc.update("UPDATE users SET password_hash = ? WHERE id = ?", passwordHash, id);
    }

    // ── New methods ───────────────────────────────────────────────────────────

    /**
     * Find a user by their Google subject ID.
     */
    public Optional<Map<String, Object>> findByGoogleId(String googleId) {
        if (googleId == null || googleId.isBlank()) return Optional.empty();
        List<Map<String, Object>> rows =
                jdbc.queryForList("SELECT * FROM users WHERE google_id = ?", googleId);
        return rows.isEmpty() ? Optional.empty() : Optional.of(rows.get(0));
    }

    /**
     * Create a new user who authenticated via Google.
     * password_hash is set to an empty string (no local login possible until they set a password).
     */
    public long createGoogleUser(String name, String email, String googleId, String avatarUrl, String role) {
        String sql = "INSERT INTO users (name, email, phone, password_hash, role, google_id, avatar_url, auth_provider, is_email_verified) " +
                     "VALUES (?, ?, NULL, '', ?, ?, ?, 'GOOGLE', 1)";
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbc.update(conn -> {
            PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, name);
            ps.setString(2, email);
            ps.setString(3, role);
            ps.setString(4, googleId);
            ps.setString(5, avatarUrl);
            return ps;
        }, keyHolder);
        return keyHolder.getKey().longValue();
    }

    /**
     * Mark the user's email as verified (or unverified).
     */
    public void updateEmailVerified(long id, boolean verified) {
        jdbc.update("UPDATE users SET is_email_verified = ? WHERE id = ?",
                verified ? 1 : 0, id);
    }

    /**
     * Stamp last_login_at with the current UTC time.
     */
    public void updateLastLogin(long id) {
        jdbc.update("UPDATE users SET last_login_at = ? WHERE id = ?",
                Timestamp.from(Instant.now()), id);
    }

    /**
     * Link a Google account to an existing user and optionally update the avatar.
     */
    public void updateGoogleId(long id, String googleId, String avatarUrl) {
        jdbc.update("UPDATE users SET google_id = ?, avatar_url = ?, auth_provider = 'GOOGLE' WHERE id = ?",
                googleId, avatarUrl, id);
    }
}

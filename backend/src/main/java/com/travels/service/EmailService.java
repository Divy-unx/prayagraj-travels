package com.travels.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Send a 6-digit OTP email for email verification or other purposes.
     *
     * @param toEmail  recipient email address
     * @param name     recipient display name
     * @param otp      6-digit OTP code
     * @param purpose  human-readable purpose string (e.g. "Email Verification")
     */
    public void sendOtpEmail(String toEmail, String name, String otp, String purpose) {
        if (fromEmail == null || fromEmail.isBlank()) {
            log.warn("MAIL_USERNAME not configured — skipping OTP email to {}", toEmail);
            return;
        }
        String subject = "Your OTP for " + purpose + " – Prayagraj Travels";
        String html = buildOtpHtml(name, otp, purpose);
        sendHtmlEmail(toEmail, subject, html);
    }

    /**
     * Send a welcome email after successful email verification.
     */
    public void sendWelcomeEmail(String toEmail, String name) {
        if (fromEmail == null || fromEmail.isBlank()) {
            log.warn("MAIL_USERNAME not configured — skipping welcome email to {}", toEmail);
            return;
        }
        String subject = "Welcome to Prayagraj Travels!";
        String html = buildWelcomeHtml(name);
        sendHtmlEmail(toEmail, subject, html);
    }

    /**
     * Send a password reset OTP email.
     */
    public void sendPasswordResetEmail(String toEmail, String name, String otp) {
        if (fromEmail == null || fromEmail.isBlank()) {
            log.warn("MAIL_USERNAME not configured — skipping password reset email to {}", toEmail);
            return;
        }
        String subject = "Reset Your Prayagraj Travels Password";
        String html = buildPasswordResetHtml(name, otp);
        sendHtmlEmail(toEmail, subject, html);
    }

    // ── private helpers ───────────────────────────────────────────────────────

    private void sendHtmlEmail(String to, String subject, String html) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail, "Prayagraj Travels");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(message);
            log.info("Email sent to {} — subject: {}", to, subject);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage(), e);
            // Do NOT rethrow — email failure should not break the auth flow
        }
    }

    private String buildOtpHtml(String name, String otp, String purpose) {
        return "<!DOCTYPE html>" +
                "<html lang=\"en\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">" +
                "<title>OTP Verification</title></head>" +
                "<body style=\"margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,sans-serif;\">" +
                "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background-color:#f4f4f4;padding:40px 0;\">" +
                "<tr><td align=\"center\">" +
                "<table width=\"600\" cellpadding=\"0\" cellspacing=\"0\" style=\"background-color:#ffffff;border-radius:8px;" +
                "box-shadow:0 2px 8px rgba(0,0,0,0.08);overflow:hidden;max-width:600px;\">" +
                "<tr><td style=\"background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:40px 40px 30px;text-align:center;\">" +
                "<h1 style=\"color:#ffffff;margin:0;font-size:28px;font-weight:700;letter-spacing:-0.5px;\">Prayagraj Travels</h1>" +
                "<p style=\"color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;\">Your journey, our commitment</p>" +
                "</td></tr>" +
                "<tr><td style=\"padding:40px;\">" +
                "<h2 style=\"color:#1a1a2e;margin:0 0 16px;font-size:22px;\">" + purpose + "</h2>" +
                "<p style=\"color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;\">Hello <strong>" + escapeHtml(name) + "</strong>,</p>" +
                "<p style=\"color:#555;font-size:15px;line-height:1.6;margin:0 0 32px;\">Use the following OTP to complete your " +
                escapeHtml(purpose.toLowerCase()) + ". This code is valid for <strong>10 minutes</strong> and can only be used once.</p>" +
                "<div style=\"background:#f0f4ff;border:2px dashed #667eea;border-radius:8px;padding:24px;text-align:center;margin:0 0 32px;\">" +
                "<p style=\"margin:0 0 8px;color:#667eea;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;\">Your OTP Code</p>" +
                "<p style=\"margin:0;font-size:40px;font-weight:700;color:#1a1a2e;letter-spacing:10px;\">" + otp + "</p>" +
                "</div>" +
                "<p style=\"color:#888;font-size:13px;line-height:1.6;margin:0 0 8px;\">If you did not request this, please ignore this email. " +
                "Your account remains secure.</p>" +
                "</td></tr>" +
                "<tr><td style=\"background:#f8f9fa;padding:24px 40px;border-top:1px solid #eee;text-align:center;\">" +
                "<p style=\"color:#aaa;font-size:12px;margin:0;\">&copy; 2024 Prayagraj Travels. All rights reserved.</p>" +
                "</td></tr>" +
                "</table>" +
                "</td></tr></table>" +
                "</body></html>";
    }

    private String buildWelcomeHtml(String name) {
        return "<!DOCTYPE html>" +
                "<html lang=\"en\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">" +
                "<title>Welcome!</title></head>" +
                "<body style=\"margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,sans-serif;\">" +
                "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background-color:#f4f4f4;padding:40px 0;\">" +
                "<tr><td align=\"center\">" +
                "<table width=\"600\" cellpadding=\"0\" cellspacing=\"0\" style=\"background-color:#ffffff;border-radius:8px;" +
                "box-shadow:0 2px 8px rgba(0,0,0,0.08);overflow:hidden;max-width:600px;\">" +
                "<tr><td style=\"background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:40px 40px 30px;text-align:center;\">" +
                "<h1 style=\"color:#ffffff;margin:0;font-size:28px;font-weight:700;letter-spacing:-0.5px;\">Prayagraj Travels</h1>" +
                "<p style=\"color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;\">Your journey, our commitment</p>" +
                "</td></tr>" +
                "<tr><td style=\"padding:40px;\">" +
                "<h2 style=\"color:#1a1a2e;margin:0 0 16px;font-size:22px;\">Welcome aboard, " + escapeHtml(name) + "!</h2>" +
                "<p style=\"color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;\">" +
                "Your email has been verified and your account is now fully active. " +
                "We're thrilled to have you as part of the Prayagraj Travels family.</p>" +
                "<p style=\"color:#555;font-size:15px;line-height:1.6;margin:0 0 32px;\">You can now book bus tickets, " +
                "track live locations, and manage your journey all in one place.</p>" +
                "<div style=\"text-align:center;margin:32px 0;\">" +
                "<a href=\"" + frontendUrl + "\" style=\"background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);" +
                "color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:15px;font-weight:600;" +
                "display:inline-block;\">Start Booking</a>" +
                "</div>" +
                "</td></tr>" +
                "<tr><td style=\"background:#f8f9fa;padding:24px 40px;border-top:1px solid #eee;text-align:center;\">" +
                "<p style=\"color:#aaa;font-size:12px;margin:0;\">&copy; 2024 Prayagraj Travels. All rights reserved.</p>" +
                "</td></tr>" +
                "</table>" +
                "</td></tr></table>" +
                "</body></html>";
    }

    private String buildPasswordResetHtml(String name, String otp) {
        return "<!DOCTYPE html>" +
                "<html lang=\"en\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">" +
                "<title>Reset Password</title></head>" +
                "<body style=\"margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,sans-serif;\">" +
                "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background-color:#f4f4f4;padding:40px 0;\">" +
                "<tr><td align=\"center\">" +
                "<table width=\"600\" cellpadding=\"0\" cellspacing=\"0\" style=\"background-color:#ffffff;border-radius:8px;" +
                "box-shadow:0 2px 8px rgba(0,0,0,0.08);overflow:hidden;max-width:600px;\">" +
                "<tr><td style=\"background:linear-gradient(135deg,#f093fb 0%,#f5576c 100%);padding:40px 40px 30px;text-align:center;\">" +
                "<h1 style=\"color:#ffffff;margin:0;font-size:28px;font-weight:700;letter-spacing:-0.5px;\">Prayagraj Travels</h1>" +
                "<p style=\"color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;\">Password Reset Request</p>" +
                "</td></tr>" +
                "<tr><td style=\"padding:40px;\">" +
                "<h2 style=\"color:#1a1a2e;margin:0 0 16px;font-size:22px;\">Reset Your Password</h2>" +
                "<p style=\"color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;\">Hello <strong>" + escapeHtml(name) + "</strong>,</p>" +
                "<p style=\"color:#555;font-size:15px;line-height:1.6;margin:0 0 32px;\">" +
                "We received a request to reset your password. Use the OTP below. " +
                "This code is valid for <strong>15 minutes</strong>.</p>" +
                "<div style=\"background:#fff5f5;border:2px dashed #f5576c;border-radius:8px;padding:24px;text-align:center;margin:0 0 32px;\">" +
                "<p style=\"margin:0 0 8px;color:#f5576c;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;\">Password Reset OTP</p>" +
                "<p style=\"margin:0;font-size:40px;font-weight:700;color:#1a1a2e;letter-spacing:10px;\">" + otp + "</p>" +
                "</div>" +
                "<p style=\"color:#888;font-size:13px;line-height:1.6;margin:0;\">" +
                "If you did not request a password reset, please ignore this email and your password will remain unchanged. " +
                "For your security, never share this OTP with anyone.</p>" +
                "</td></tr>" +
                "<tr><td style=\"background:#f8f9fa;padding:24px 40px;border-top:1px solid #eee;text-align:center;\">" +
                "<p style=\"color:#aaa;font-size:12px;margin:0;\">&copy; 2024 Prayagraj Travels. All rights reserved.</p>" +
                "</td></tr>" +
                "</table>" +
                "</td></tr></table>" +
                "</body></html>";
    }

    private String escapeHtml(String input) {
        if (input == null) return "";
        return input
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#x27;");
    }
}

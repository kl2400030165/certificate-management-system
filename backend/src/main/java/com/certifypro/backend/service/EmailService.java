package com.certifypro.backend.service;

import com.certifypro.backend.model.Certification;
import com.certifypro.backend.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.util.List;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${email.mock:true}")
    private boolean mockEmail;

    @Value("${email.from:CertifyPro <noreply@certifypro.com>}")
    private String emailFrom;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // ── Public API ────────────────────────────────────────────────────────────

    public void sendWelcomeEmail(User user) {
        String subject = "Welcome to CertifyPro! 🎓";
        String body = buildWelcomeBody(user.getName());
        send(user.getEmail(), subject, body);
    }

    public void sendOtpEmail(User user, String otpCode) {
        String subject = "🔐 Your CertifyPro Verification Code: " + otpCode;
        String body = buildOtpBody(user.getName(), otpCode);
        send(user.getEmail(), subject, body);
    }

    public void sendCertAddedEmail(User user, Certification cert) {
        String subject = "📜 Certificate Added: " + cert.getCertName();
        String body = buildCertAddedBody(user.getName(), cert);
        send(user.getEmail(), subject, body);
    }

    public void sendReminderEmail(User user, Certification cert, long daysLeft) {
        String subject = daysLeft <= 0
                ? "⚠️ Certificate EXPIRED: " + cert.getCertName()
                : "⚠️ Certificate Expiring in " + daysLeft + " days: " + cert.getCertName();
        String body = buildReminderBody(user.getName(), cert, daysLeft);
        send(user.getEmail(), subject, body);
    }

    public void sendRenewalApprovedEmail(User user, Certification cert) {
        String subject = "✅ Renewal Approved: " + cert.getCertName();
        String body = buildRenewalApprovedBody(user.getName(), cert);
        send(user.getEmail(), subject, body);
    }

    public void sendWeeklyDigestEmail(User user, List<Certification> certs) {
        if (certs == null || certs.isEmpty()) return;
        String subject = "📊 Weekly Certification Expiry Digest";
        String body = buildWeeklyDigestBody(user.getName(), certs);
        send(user.getEmail(), subject, body);
    }

    // ── Internal sender ───────────────────────────────────────────────────────

    private void send(String to, String subject, String htmlBody) {
        if (mockEmail) {
            log.info("📧 [MOCK EMAIL] To: {} | Subject: {} | Body (truncated): {}",
                    to, subject, htmlBody.length() > 120 ? htmlBody.substring(0, 120) + "…" : htmlBody);
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(emailFrom);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("✅ Email sent to: {}", to);
        } catch (Exception e) {
            log.error("❌ Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    // ── HTML body builders ────────────────────────────────────────────────────

    private String buildWelcomeBody(String name) {
        return "<div style='font-family:Inter,sans-serif;max-width:520px;margin:auto;background:#0f1628;color:#f1f5f9;padding:36px;border-radius:14px;border:1px solid #1e2d4d'>"
                + "<div style='text-align:center;margin-bottom:28px'>"
                + "<div style='display:inline-block;width:52px;height:52px;border-radius:14px;background:linear-gradient(135deg,#4f8ef7,#8b5cf6);font-size:26px;line-height:52px'>🎓</div>"
                + "<h2 style='margin:12px 0 4px;background:linear-gradient(135deg,#4f8ef7,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent'>CertifyPro</h2>"
                + "</div>"
                + "<h3 style='color:#10b981;margin:0 0 12px'>Welcome aboard, " + name + "! 🎉</h3>"
                + "<p style='color:#94a3b8;margin:0 0 20px'>Your email has been verified and your account is all set. You can now start tracking and managing all your professional certifications in one place.</p>"
                + "<a href='http://localhost:5173/dashboard' style='display:inline-block;background:linear-gradient(135deg,#4f8ef7,#8b5cf6);color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600'>Go to Dashboard →</a>"
                + "<p style='color:#374151;font-size:12px;text-align:center;margin-top:28px;border-top:1px solid #1e2d4d;padding-top:16px'>You're receiving this because you registered at CertifyPro.</p>"
                + "</div>";
    }

    private String buildOtpBody(String name, String otpCode) {
        return "<div style='font-family:Inter,sans-serif;max-width:480px;margin:auto;background:#0f1628;color:#f1f5f9;padding:36px;border-radius:14px;border:1px solid #1e2d4d'>"
                + "<div style='text-align:center;margin-bottom:24px'>"
                + "<div style='display:inline-block;width:52px;height:52px;border-radius:14px;background:linear-gradient(135deg,#4f8ef7,#8b5cf6);font-size:26px;line-height:52px'>🎓</div>"
                + "<h2 style='margin:12px 0 4px;background:linear-gradient(135deg,#4f8ef7,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent'>CertifyPro</h2>"
                + "</div>"
                + "<h3 style='color:#e2e8f0;margin:0 0 8px'>Verification Code</h3>"
                + "<p style='color:#94a3b8;margin:0 0 24px'>Hi <strong style='color:#f1f5f9'>" + name + "</strong>, use the code below to verify your account or complete sign-in.</p>"
                + "<div style='background:#1e2d4d;border:1px solid #2d4a7a;border-radius:12px;padding:24px;text-align:center;margin-bottom:20px'>"
                + "<p style='margin:0 0 8px;font-size:13px;color:#64748b;letter-spacing:2px;text-transform:uppercase'>Your OTP Code</p>"
                + "<span style='font-size:42px;font-weight:900;letter-spacing:12px;background:linear-gradient(135deg,#4f8ef7,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent'>" + otpCode + "</span>"
                + "</div>"
                + "<p style='color:#64748b;font-size:13px;text-align:center;margin:0'>⏱ This code expires in <strong style='color:#f59e0b'>10 minutes</strong>. Do not share it with anyone.</p>"
                + "<p style='color:#374151;font-size:12px;text-align:center;margin-top:24px;border-top:1px solid #1e2d4d;padding-top:16px'>If you didn't request this, please ignore this email.</p>"
                + "</div>";
    }

    private String buildCertAddedBody(String name, Certification cert) {
        long daysLeft = java.time.temporal.ChronoUnit.DAYS.between(java.time.LocalDate.now(), cert.getExpiryDate());
        String statusColor = daysLeft > 90 ? "#10b981" : daysLeft > 30 ? "#f59e0b" : "#ef4444";
        String statusLabel = daysLeft > 90 ? "Valid" : daysLeft > 30 ? "Expiring Soon" : daysLeft > 0 ? "Expiring Very Soon" : "Expired";

        return "<div style='font-family:Inter,sans-serif;max-width:520px;margin:auto;background:#0f1628;color:#f1f5f9;padding:36px;border-radius:14px;border:1px solid #1e2d4d'>"
                + "<div style='text-align:center;margin-bottom:28px'>"
                + "<div style='display:inline-block;width:52px;height:52px;border-radius:14px;background:linear-gradient(135deg,#4f8ef7,#8b5cf6);font-size:26px;line-height:52px'>🎓</div>"
                + "<h2 style='margin:12px 0 4px;background:linear-gradient(135deg,#4f8ef7,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent'>CertifyPro</h2>"
                + "</div>"
                + "<h3 style='color:#4f8ef7;margin:0 0 16px'>📜 New Certificate Added</h3>"
                + "<p style='color:#94a3b8;margin:0 0 20px'>Hi <strong style='color:#f1f5f9'>" + name + "</strong>, a new certification has been added to your profile.</p>"
                + "<div style='background:#1e2d4d;border:1px solid #2d4a7a;border-radius:12px;padding:20px;margin-bottom:20px'>"
                + "<table style='width:100%;border-collapse:collapse'>"
                + "<tr><td style='padding:6px 0;color:#64748b;font-size:13px;width:40%'>Certificate</td><td style='padding:6px 0;color:#f1f5f9;font-weight:600'>" + cert.getCertName() + "</td></tr>"
                + "<tr><td style='padding:6px 0;color:#64748b;font-size:13px'>Issued By</td><td style='padding:6px 0;color:#f1f5f9'>" + cert.getIssuedBy() + "</td></tr>"
                + "<tr><td style='padding:6px 0;color:#64748b;font-size:13px'>Issue Date</td><td style='padding:6px 0;color:#f1f5f9'>" + cert.getIssueDate() + "</td></tr>"
                + "<tr><td style='padding:6px 0;color:#64748b;font-size:13px'>Expiry Date</td><td style='padding:6px 0;color:#f1f5f9'>" + cert.getExpiryDate() + "</td></tr>"
                + "<tr><td style='padding:6px 0;color:#64748b;font-size:13px'>Status</td><td><span style='background:" + statusColor + "22;color:" + statusColor + ";padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600'>" + statusLabel + "</span></td></tr>"
                + "</table>"
                + "</div>"
                + "<a href='http://localhost:5173/certifications' style='display:inline-block;background:linear-gradient(135deg,#4f8ef7,#8b5cf6);color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600'>View My Certifications →</a>"
                + "<p style='color:#374151;font-size:12px;text-align:center;margin-top:28px;border-top:1px solid #1e2d4d;padding-top:16px'>You'll receive expiry reminders as this certificate approaches its expiry date.</p>"
                + "</div>";
    }

    private String buildReminderBody(String name, Certification cert, long daysLeft) {
        String urgency = daysLeft <= 0 ? "has <strong style='color:#ef4444'>EXPIRED</strong>" : "expires in <strong>" + daysLeft + " days</strong>";
        return "<div style='font-family:Inter,sans-serif;max-width:520px;margin:auto;background:#0f1628;color:#f1f5f9;padding:36px;border-radius:14px;border:1px solid #1e2d4d'>"
                + "<div style='text-align:center;margin-bottom:28px'>"
                + "<div style='display:inline-block;width:52px;height:52px;border-radius:14px;background:linear-gradient(135deg,#4f8ef7,#8b5cf6);font-size:26px;line-height:52px'>🎓</div>"
                + "<h2 style='margin:12px 0 4px;background:linear-gradient(135deg,#4f8ef7,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent'>CertifyPro</h2>"
                + "</div>"
                + "<h3 style='color:#f59e0b;margin:0 0 12px'>⚠️ Certificate Renewal Reminder</h3>"
                + "<p style='color:#94a3b8;margin:0 0 16px'>Hi <strong style='color:#f1f5f9'>" + name + "</strong>,</p>"
                + "<p style='color:#94a3b8;margin:0 0 20px'>Your certification <strong style='color:#f1f5f9'>" + cert.getCertName() + "</strong> issued by <strong style='color:#f1f5f9'>" + cert.getIssuedBy() + "</strong> " + urgency + ".</p>"
                + "<div style='background:#1e2d4d;border:1px solid #2d4a7a;border-radius:10px;padding:16px;margin-bottom:20px'>"
                + "<p style='margin:0;color:#64748b;font-size:13px'>Expiry Date</p>"
                + "<p style='margin:4px 0 0;color:#f1f5f9;font-size:18px;font-weight:700'>" + cert.getExpiryDate() + "</p>"
                + "</div>"
                + "<a href='http://localhost:5173/certifications' style='display:inline-block;background:linear-gradient(135deg,#f59e0b,#ef4444);color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600'>View Certification →</a>"
                + "</div>";
    }

    private String buildRenewalApprovedBody(String name, Certification cert) {
        return "<div style='font-family:Inter,sans-serif;max-width:520px;margin:auto;background:#0f1628;color:#f1f5f9;padding:36px;border-radius:14px;border:1px solid #1e2d4d'>"
                + "<div style='text-align:center;margin-bottom:28px'>"
                + "<div style='display:inline-block;width:52px;height:52px;border-radius:14px;background:linear-gradient(135deg,#4f8ef7,#8b5cf6);font-size:26px;line-height:52px'>🎓</div>"
                + "<h2 style='margin:12px 0 4px;background:linear-gradient(135deg,#4f8ef7,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent'>CertifyPro</h2>"
                + "</div>"
                + "<h3 style='color:#10b981;margin:0 0 12px'>✅ Renewal Approved!</h3>"
                + "<p style='color:#94a3b8;margin:0 0 16px'>Hi <strong style='color:#f1f5f9'>" + name + "</strong>,</p>"
                + "<p style='color:#94a3b8;margin:0 0 16px'>Your renewal request for <strong style='color:#f1f5f9'>" + cert.getCertName() + "</strong> has been <strong style='color:#10b981'>approved</strong> by the admin.</p>"
                + "<p style='color:#94a3b8;margin:0 0 20px'>Please proceed with renewing your certification with <strong style='color:#f1f5f9'>" + cert.getIssuedBy() + "</strong>.</p>"
                + "<a href='http://localhost:5173/certifications' style='display:inline-block;background:linear-gradient(135deg,#10b981,#06b6d4);color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600'>View Certifications →</a>"
                + "</div>";
    }

    private String buildWeeklyDigestBody(String name, List<Certification> certs) {
        StringBuilder items = new StringBuilder();
        for (Certification cert : certs) {
            long daysLeft = java.time.temporal.ChronoUnit.DAYS.between(java.time.LocalDate.now(), cert.getExpiryDate());
            String color = daysLeft > 30 ? "#f59e0b" : "#ef4444";
            items.append("<li style='margin:10px 0;padding:10px;background:#1e2d4d;border-radius:8px;list-style:none'>")
                    .append("<strong style='color:#f1f5f9'>").append(cert.getCertName()).append("</strong>")
                    .append("<span style='color:#64748b'> — ").append(cert.getIssuedBy()).append("</span>")
                    .append("<br><span style='font-size:13px;color:").append(color).append("'>Expires: ").append(cert.getExpiryDate())
                    .append(" (").append(daysLeft > 0 ? daysLeft + " days left" : "EXPIRED").append(")</span>")
                    .append("</li>");
        }

        return "<div style='font-family:Inter,sans-serif;max-width:560px;margin:auto;background:#0f1628;color:#f1f5f9;padding:36px;border-radius:14px;border:1px solid #1e2d4d'>"
                + "<div style='text-align:center;margin-bottom:28px'>"
                + "<div style='display:inline-block;width:52px;height:52px;border-radius:14px;background:linear-gradient(135deg,#4f8ef7,#8b5cf6);font-size:26px;line-height:52px'>🎓</div>"
                + "<h2 style='margin:12px 0 4px;background:linear-gradient(135deg,#4f8ef7,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent'>CertifyPro</h2>"
                + "</div>"
                + "<h3 style='color:#38bdf8;margin:0 0 12px'>📊 Weekly Expiry Digest</h3>"
                + "<p style='color:#94a3b8;margin:0 0 20px'>Hi <strong style='color:#f1f5f9'>" + name + "</strong>, here are your certifications expiring within the next 30 days:</p>"
                + "<ul style='padding:0;margin:0 0 20px'>" + items + "</ul>"
                + "<a href='http://localhost:5173/certifications' style='display:inline-block;background:linear-gradient(135deg,#06b6d4,#0ea5e9);color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600'>Open Certifications →</a>"
                + "</div>";
    }
}

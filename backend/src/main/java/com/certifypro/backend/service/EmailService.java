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

    public void sendWelcomeEmail(User user) {
        String subject = "Welcome to CertifyPro! 🎓";
        String body = buildWelcomeBody(user.getName());
        send(user.getEmail(), subject, body);
    }

    public void sendOtpEmail(User user, String otp) {
        String subject = "Your CertifyPro verification code";
        String body = buildOtpBody(user.getName(), otp);
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

    private void send(String to, String subject, String htmlBody) {
        if (mockEmail) {
            log.info("📧 [MOCK EMAIL] To: {} | Subject: {} | Body: {}", to, subject, htmlBody);
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

    private String buildWelcomeBody(String name) {
        return "<div style='font-family:Inter,sans-serif;max-width:500px;margin:auto;background:#0f1628;color:#f1f5f9;padding:32px;border-radius:12px'>"
                + "<h2 style='color:#4f8ef7'>Welcome to CertifyPro! 🎓</h2>"
                + "<p>Hi <strong>" + name + "</strong>,</p>"
                + "<p>Your account has been created. Start tracking your professional certifications today!</p>"
                + "<a href='http://localhost:5173/dashboard' style='background:linear-gradient(135deg,#4f8ef7,#8b5cf6);color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600'>Go to Dashboard →</a>"
                + "</div>";
    }

    private String buildOtpBody(String name, String otp) {
        return "<div style='font-family:Inter,sans-serif;max-width:500px;margin:auto;background:#0f1628;color:#f1f5f9;padding:32px;border-radius:12px'>"
                + "<h2 style='color:#38bdf8'>Your verification code</h2>"
                + "<p>Hi <strong>" + name + "</strong>,</p>"
                + "<p>Your one-time verification code is:</p>"
                + "<div style='font-size:28px;letter-spacing:6px;font-weight:800;color:#fff;background:#111827;padding:16px 20px;border-radius:12px;display:inline-block'>"
                + otp
                + "</div>"
                + "<p style='margin-top:16px'>This code expires in 10 minutes.</p>"
                + "</div>";
    }

    private String buildReminderBody(String name, Certification cert, long daysLeft) {
        String urgency = daysLeft <= 0 ? "has EXPIRED" : "expires in <strong>" + daysLeft + " days</strong>";
        return "<div style='font-family:Inter,sans-serif;max-width:500px;margin:auto;background:#0f1628;color:#f1f5f9;padding:32px;border-radius:12px'>"
                + "<h2 style='color:#f59e0b'>⚠️ Certificate Renewal Reminder</h2>"
                + "<p>Hi <strong>" + name + "</strong>,</p>"
                + "<p>Your certification <strong>" + cert.getCertName() + "</strong> issued by <strong>" + cert.getIssuedBy() + "</strong> " + urgency + ".</p>"
                + "<p>Expiry Date: <strong>" + cert.getExpiryDate() + "</strong></p>"
                + "<p>Please take action to renew it as soon as possible.</p>"
                + "<a href='http://localhost:5173/certifications' style='background:linear-gradient(135deg,#f59e0b,#ef4444);color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600'>View Certification →</a>"
                + "</div>";
    }

    private String buildRenewalApprovedBody(String name, Certification cert) {
        return "<div style='font-family:Inter,sans-serif;max-width:500px;margin:auto;background:#0f1628;color:#f1f5f9;padding:32px;border-radius:12px'>"
                + "<h2 style='color:#10b981'>✅ Renewal Approved!</h2>"
                + "<p>Hi <strong>" + name + "</strong>,</p>"
                + "<p>Your renewal request for <strong>" + cert.getCertName() + "</strong> has been <strong style='color:#10b981'>approved</strong> by the admin.</p>"
                + "<p>Please proceed with renewing your certification with <strong>" + cert.getIssuedBy() + "</strong>.</p>"
                + "</div>";
    }

    private String buildWeeklyDigestBody(String name, List<Certification> certs) {
        StringBuilder items = new StringBuilder();
        for (Certification cert : certs) {
            items.append("<li style='margin:8px 0'>")
                    .append("<strong>").append(cert.getCertName()).append("</strong>")
                    .append(" - ").append(cert.getIssuedBy())
                    .append(" (expires on ").append(cert.getExpiryDate()).append(")")
                    .append("</li>");
        }

        return "<div style='font-family:Inter,sans-serif;max-width:560px;margin:auto;background:#0f1628;color:#f1f5f9;padding:28px;border-radius:12px'>"
                + "<h2 style='color:#38bdf8'>📊 Weekly Expiry Digest</h2>"
                + "<p>Hi <strong>" + name + "</strong>,</p>"
                + "<p>Here are your certifications expiring within the next 30 days:</p>"
                + "<ul style='padding-left:18px'>" + items + "</ul>"
                + "<a href='http://localhost:5173/certifications' style='display:inline-block;margin-top:12px;background:linear-gradient(135deg,#06b6d4,#0ea5e9);color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600'>Open Certifications</a>"
                + "</div>";
    }
}

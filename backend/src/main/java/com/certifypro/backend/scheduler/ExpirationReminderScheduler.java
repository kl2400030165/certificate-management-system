package com.certifypro.backend.scheduler;

import com.certifypro.backend.model.Certification;
import com.certifypro.backend.model.User;
import com.certifypro.backend.repository.CertificationRepository;
import com.certifypro.backend.repository.UserRepository;
import com.certifypro.backend.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ExpirationReminderScheduler {

    private static final Logger log = LoggerFactory.getLogger(ExpirationReminderScheduler.class);

    private final CertificationRepository certRepository;
    private final EmailService emailService;
    private final UserRepository userRepository;

    public ExpirationReminderScheduler(CertificationRepository certRepository, EmailService emailService, UserRepository userRepository) {
        this.certRepository = certRepository;
        this.emailService = emailService;
        this.userRepository = userRepository;
    }

    // Run every day at 9 AM to send reminders
    @Scheduled(cron = "0 0 9 * * *", zone = "UTC")
    public void sendExpirationReminders() {
        log.info("🔔 Starting expiration reminder scheduler...");

        checkAndSendReminders(1);   // 1 day reminder
        checkAndSendReminders(7);   // 1 week reminder
        checkAndSendReminders(14);  // 2 weeks reminder
        checkAndSendReminders(30);  // 30 days reminder
        
        log.info("✅ Expiration reminder scheduler completed");
    }

    private void checkAndSendReminders(int daysUntilExpiry) {
        LocalDate targetDate = LocalDate.now().plusDays(daysUntilExpiry);
        LocalDate prevDate = targetDate.minusDays(1);

        List<Certification> expiringCerts = certRepository.findByExpiryDateBetween(prevDate, targetDate).stream()
                .filter(c -> !c.isExpired() && !c.isRemindersDisabled())
                .toList();
        Map<String, User> users = getUsersById(expiringCerts);

        for (Certification cert : expiringCerts) {
            try {
                var user = users.get(cert.getUserId());
                if (user == null) {
                    log.warn("User not found for certification: {}", cert.getId());
                    continue;
                }

                if (!user.isNotificationsEnabled() || user.getNotificationFrequency() != User.NotificationFrequency.SINGLE) {
                    continue;
                }

                emailService.sendReminderEmail(user, cert, daysUntilExpiry);
                log.info("📧 Sent {} day reminder for: {}", daysUntilExpiry, cert.getName());
            } catch (Exception e) {
                log.error("Failed to send reminder: {}", e.getMessage());
            }
        }
    }

    // Weekly summary (Mondays at 8 AM)
    @Scheduled(cron = "0 0 8 ? * MON", zone = "UTC")
    public void sendWeeklySummary() {
        log.info("📊 Sending weekly expiration summary...");
        LocalDate soon = LocalDate.now().plusDays(30);

        List<Certification> soonToExpire = certRepository.findByExpiryDateBefore(soon).stream()
                .filter(c -> !c.isExpired() && !c.isRemindersDisabled())
                .toList();
        Map<String, User> users = getUsersById(soonToExpire);

        Map<String, List<Certification>> certsByUser = new HashMap<>();
        for (Certification cert : soonToExpire) {
            var user = users.get(cert.getUserId());
            if (user == null) continue;
            if (!user.isNotificationsEnabled() || user.getNotificationFrequency() != User.NotificationFrequency.WEEKLY) {
                continue;
            }
            certsByUser.computeIfAbsent(user.getId(), k -> new ArrayList<>()).add(cert);
        }

        int sent = 0;
        for (Map.Entry<String, List<Certification>> entry : certsByUser.entrySet()) {
            var user = users.get(entry.getKey());
            if (user == null || entry.getValue().isEmpty()) continue;
            emailService.sendWeeklyDigestEmail(user, entry.getValue());
            sent++;
        }

        log.info("✅ Weekly summary: {} digest email(s) sent", sent);
    }

    private Map<String, User> getUsersById(List<Certification> certs) {
        Set<String> userIds = certs.stream()
                .map(Certification::getUserId)
                .collect(Collectors.toSet());

        return userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, user -> user, (first, second) -> first));
    }
}

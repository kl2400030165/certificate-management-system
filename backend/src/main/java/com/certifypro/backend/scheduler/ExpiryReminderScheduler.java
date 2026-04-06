package com.certifypro.backend.scheduler;

import com.certifypro.backend.model.Certification;
import com.certifypro.backend.model.User;
import com.certifypro.backend.repository.CertificationRepository;
import com.certifypro.backend.repository.UserRepository;
import com.certifypro.backend.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Deprecated
public class ExpiryReminderScheduler {

    private static final Logger log = LoggerFactory.getLogger(ExpiryReminderScheduler.class);

    private final CertificationRepository certRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public ExpiryReminderScheduler(CertificationRepository certRepository,
                                    UserRepository userRepository,
                                    EmailService emailService) {
        this.certRepository = certRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    // Runs every day at 8:00 AM
    @Scheduled(cron = "0 0 8 * * *")
    public void sendExpiryReminders() {
        log.info("⏰ Running daily expiry reminder job...");

        LocalDate today = LocalDate.now();
        LocalDate in30Days = today.plusDays(30);

        // Get all certs expiring within 30 days (including already expired)
        List<Certification> expiringCerts = certRepository.findByExpiryDateBefore(in30Days);

        int sent = 0;
        for (Certification cert : expiringCerts) {
            // Skip if already notified within 7 days
            if (cert.getNotifiedAt() != null &&
                cert.getNotifiedAt().isAfter(LocalDateTime.now().minusDays(7))) {
                continue;
            }

            Optional<User> userOpt = userRepository.findById(cert.getUserId());
            if (userOpt.isEmpty()) {
                continue;
            }

            User user = userOpt.get();
            long daysLeft = ChronoUnit.DAYS.between(today, cert.getExpiryDate());
            emailService.sendReminderEmail(user, cert, daysLeft);
            cert.setNotifiedAt(LocalDateTime.now());
            certRepository.save(cert);
            sent++;
        }

        log.info("✅ Expiry reminder job complete. Notifications sent: {}", sent);
    }
}

package com.certifypro.backend.config;

import com.certifypro.backend.model.Certification;
import com.certifypro.backend.model.User;
import com.certifypro.backend.repository.CertificationRepository;
import com.certifypro.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final CertificationRepository certificationRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.email}")
    private String adminEmail;

    @Value("${admin.password}")
    private String adminPassword;

    @Value("${admin.name}")
    private String adminName;

    @Value("${admin.seed-enabled:false}")
    private boolean seedEnabled;

    public DataSeeder(UserRepository userRepository,
                      CertificationRepository certificationRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.certificationRepository = certificationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!seedEnabled) {
            log.info("Admin seed is disabled. Skipping admin bootstrap.");
            return;
        }

        // ── Seed admin account ───────────────────────────────────────
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = User.builder()
                    .name(adminName)
                    .email(adminEmail)
                    .passwordHash(passwordEncoder.encode(adminPassword))
                    .role(User.Role.ADMIN)
                    .emailVerified(true)
                    .build();
            userRepository.save(admin);
            log.info("✅ Admin account seeded: {}", adminEmail);
        } else {
            log.info("ℹ️ Admin account already exists, skipping seed.");
        }

        // ── Seed demo user accounts ──────────────────────────────────
        String[][] demoAccounts = {
                {"rahul@example.com",  "Rahul Kumar",   "rahul123"},
                {"priya@example.com",  "Priya Sharma",  "priya123"},
                {"demo@example.com",   "Demo User",     "demo123"},
        };

        for (String[] acc : demoAccounts) {
            String email    = acc[0];
            String name     = acc[1];
            String password = acc[2];

            if (!userRepository.existsByEmail(email)) {
                User user = User.builder()
                        .name(name)
                        .email(email)
                        .passwordHash(passwordEncoder.encode(password))
                        .role(User.Role.USER)
                        .emailVerified(true)
                        .build();
                userRepository.save(user);
                log.info("✅ Demo user seeded: {} ({})", email, name);
            }
        }

        // ── Seed demo certifications for Rahul ───────────────────────
        // AWS cloud + security focus, 1 expiring soon, 1 expired
        userRepository.findByEmail("rahul@example.com").ifPresent(rahul -> {
            if (certificationRepository.findByUserId(rahul.getId()).isEmpty()) {
                List<Certification> certs = new ArrayList<>();

                certs.add(Certification.builder()
                    .userId(rahul.getId())
                    .certName("AWS Cloud Practitioner")
                    .issuedBy("Amazon Web Services")
                    .issueDate(LocalDate.of(2023, 6, 15))
                    .expiryDate(LocalDate.of(2026, 6, 15))
                    .build());

                certs.add(Certification.builder()
                    .userId(rahul.getId())
                    .certName("AWS Solutions Architect Associate")
                    .issuedBy("Amazon Web Services")
                    .issueDate(LocalDate.of(2023, 11, 20))
                    .expiryDate(LocalDate.of(2026, 11, 20))
                    .build());

                certs.add(Certification.builder()
                    .userId(rahul.getId())
                    .certName("HashiCorp Terraform Associate")
                    .issuedBy("HashiCorp")
                    .issueDate(LocalDate.of(2024, 2, 10))
                    .expiryDate(LocalDate.now().plusDays(20))   // expiring soon
                    .build());

                certs.add(Certification.builder()
                    .userId(rahul.getId())
                    .certName("CompTIA Security+")
                    .issuedBy("CompTIA")
                    .issueDate(LocalDate.of(2022, 3, 5))
                    .expiryDate(LocalDate.of(2025, 3, 5))       // already expired
                    .build());

                certificationRepository.saveAll(certs);
                log.info("✅ Seeded {} demo certs for {}", certs.size(), rahul.getEmail());
            }
        });

        // ── Seed demo certifications for Priya ───────────────────────
        // Data engineering focus, 1 expiring soon
        userRepository.findByEmail("priya@example.com").ifPresent(priya -> {
            if (certificationRepository.findByUserId(priya.getId()).isEmpty()) {
                List<Certification> certs = new ArrayList<>();

                certs.add(Certification.builder()
                    .userId(priya.getId())
                    .certName("Google Professional Data Engineer")
                    .issuedBy("Google Cloud")
                    .issueDate(LocalDate.of(2024, 1, 8))
                    .expiryDate(LocalDate.of(2026, 1, 8))
                    .build());

                certs.add(Certification.builder()
                    .userId(priya.getId())
                    .certName("Databricks Certified Data Engineer")
                    .issuedBy("Databricks")
                    .issueDate(LocalDate.of(2024, 4, 22))
                    .expiryDate(LocalDate.of(2026, 4, 22))
                    .build());

                certs.add(Certification.builder()
                    .userId(priya.getId())
                    .certName("IBM Data Science Professional Certificate")
                    .issuedBy("IBM")
                    .issueDate(LocalDate.of(2023, 8, 30))
                    .expiryDate(LocalDate.of(2026, 8, 30))
                    .build());

                certs.add(Certification.builder()
                    .userId(priya.getId())
                    .certName("SnowPro Core Certification")
                    .issuedBy("Snowflake")
                    .issueDate(LocalDate.of(2024, 7, 14))
                    .expiryDate(LocalDate.now().plusDays(15))    // expiring soon
                    .build());

                certificationRepository.saveAll(certs);
                log.info("✅ Seeded {} demo certs for {}", certs.size(), priya.getEmail());
            }
        });

        // ── Seed demo certifications for Demo User ───────────────────
        // Cloud / DevOps beginner profile
        userRepository.findByEmail("demo@example.com").ifPresent(demo -> {
            if (certificationRepository.findByUserId(demo.getId()).isEmpty()) {
                List<Certification> certs = new ArrayList<>();

                certs.add(Certification.builder()
                    .userId(demo.getId())
                    .certName("Azure Fundamentals (AZ-900)")
                    .issuedBy("Microsoft")
                    .issueDate(LocalDate.of(2024, 5, 18))
                    .expiryDate(LocalDate.of(2026, 5, 18))
                    .build());

                certs.add(Certification.builder()
                    .userId(demo.getId())
                    .certName("Certified Kubernetes Administrator")
                    .issuedBy("CNCF / Linux Foundation")
                    .issueDate(LocalDate.of(2024, 9, 3))
                    .expiryDate(LocalDate.of(2027, 9, 3))
                    .build());

                certificationRepository.saveAll(certs);
                log.info("✅ Seeded {} demo certs for {}", certs.size(), demo.getEmail());
            }
        });
    }
}

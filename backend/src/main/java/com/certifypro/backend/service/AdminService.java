package com.certifypro.backend.service;

import com.certifypro.backend.dto.CertResponse;
import com.certifypro.backend.model.Certification;
import com.certifypro.backend.model.User;
import com.certifypro.backend.repository.CertificationRepository;
import com.certifypro.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AdminService {

    private final CertificationRepository certRepository;
    private final UserRepository userRepository;
    private final CertificationService certificationService;
    private final EmailService emailService;

    public AdminService(CertificationRepository certRepository, UserRepository userRepository,
                        CertificationService certificationService, EmailService emailService) {
        this.certRepository = certRepository;
        this.userRepository = userRepository;
        this.certificationService = certificationService;
        this.emailService = emailService;
    }

    public List<CertResponse> getAllCerts() {
        List<Certification> certs = certRepository.findAll();
        Map<String, String> userNames = getUserNames(certs);

        return certs.stream()
                .map(cert -> certificationService.toResponse(cert, userNames.getOrDefault(cert.getUserId(), "Unknown")))
                .collect(Collectors.toList());
    }

    public List<CertResponse> getExpiringCerts(String filter) {
        LocalDate today = LocalDate.now();
        List<Certification> certs;

        if ("expired".equals(filter)) {
            certs = certRepository.findByExpiryDateBefore(today);
        } else if ("30days".equals(filter)) {
            certs = certRepository.findByExpiryDateBetween(today, today.plusDays(30));
        } else {
            // All non-active (expired + expiring soon)
            certs = certRepository.findByExpiryDateBeforeOrExpiryDateBetween(
                    today, today, today.plusDays(30));
        }

        Map<String, String> userNames = getUserNames(certs);

        return certs.stream()
                .map(cert -> certificationService.toResponse(cert, userNames.getOrDefault(cert.getUserId(), "Unknown")))
                .collect(Collectors.toList());
    }

    public Map<String, Object> getStats() {
        LocalDate today = LocalDate.now();

        long total = certRepository.count();
        long active = certRepository.countByExpiryDateAfter(today.plusDays(30));
        long expiringSoon = certRepository.countByExpiryDateBetween(today, today.plusDays(30));
        long expired = certRepository.countByExpiryDateBefore(today);
        long totalUsers = userRepository.countByRole(User.Role.USER);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCerts", total);
        stats.put("activeCerts", active);
        stats.put("expiringSoon", expiringSoon);
        stats.put("expired", expired);
        stats.put("totalUsers", totalUsers);
        return stats;
    }

    @Transactional
    public CertResponse approveRenewal(String certId) {
        Certification cert = certRepository.findById(certId)
                .orElseThrow(() -> new IllegalArgumentException("Certification not found"));

        cert.setRenewalStatus(Certification.RenewalStatus.APPROVED);
        certRepository.save(cert);

        // Send approval email to the user
        User user = userRepository.findById(cert.getUserId()).orElse(null);
        if (user != null) {
            emailService.sendRenewalApprovedEmail(user, cert);
        }

        String userName = user != null ? user.getName() : "Unknown";
        return certificationService.toResponse(cert, userName);
    }

    @Transactional
    public void notifyUser(String certId) {
        Certification cert = certRepository.findById(certId)
                .orElseThrow(() -> new IllegalArgumentException("Certification not found"));

        User user = userRepository.findById(cert.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        long daysLeft = java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), cert.getExpiryDate());
        emailService.sendReminderEmail(user, cert, daysLeft);

        cert.setNotifiedAt(LocalDateTime.now());
        certRepository.save(cert);
    }

    public List<Map<String, String>> getAllUsers() {
        return userRepository.findByRole(User.Role.USER).stream()
                .map(u -> {
                    Map<String, String> map = new HashMap<>();
                    map.put("userId", u.getId());
                    map.put("name", u.getName());
                    map.put("email", u.getEmail());
                    return map;
                })
                .collect(Collectors.toList());
    }

    public CertResponse getCertById(String certId) {
        Certification cert = certRepository.findById(certId)
                .orElseThrow(() -> new IllegalArgumentException("Certification not found"));

        String userName = userRepository.findById(cert.getUserId())
                .map(User::getName).orElse("Unknown");
        return certificationService.toResponse(cert, userName);
    }

    private Map<String, String> getUserNames(List<Certification> certs) {
        Set<String> userIds = certs.stream()
                .map(Certification::getUserId)
                .collect(Collectors.toSet());

        return userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, User::getName, (first, second) -> first));
    }
}

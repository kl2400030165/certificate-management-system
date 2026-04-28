package com.certifypro.backend.service;

import com.certifypro.backend.dto.CertResponse;
import com.certifypro.backend.model.Certification;
import com.certifypro.backend.model.User;
import com.certifypro.backend.repository.CertificationRepository;
import com.certifypro.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
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
        return certRepository.findAll()
                .stream()
                .map(cert -> {
                    String userName = userRepository.findById(cert.getUserId())
                            .map(User::getName).orElse("Unknown");
                    return certificationService.toResponse(cert, userName);
                })
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

        return certs.stream()
                .map(cert -> {
                    String userName = userRepository.findById(cert.getUserId())
                            .map(User::getName).orElse("Unknown");
                    return certificationService.toResponse(cert, userName);
                })
                .collect(Collectors.toList());
    }

    public Map<String, Object> getStats() {
        List<Certification> allCerts = certRepository.findAll();
        LocalDate today = LocalDate.now();

        long total = allCerts.size();
        long active = allCerts.stream().filter(c -> c.getExpiryDate().isAfter(today.plusDays(30))).count();
        long expiringSoon = allCerts.stream()
                .filter(c -> !c.getExpiryDate().isBefore(today) && c.getExpiryDate().isBefore(today.plusDays(31)))
                .count();
        long expired = allCerts.stream().filter(c -> c.getExpiryDate().isBefore(today)).count();
        long totalUsers = userRepository.findAll().stream().filter(u -> u.getRole() == User.Role.USER).count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCerts", total);
        stats.put("activeCerts", active);
        stats.put("expiringSoon", expiringSoon);
        stats.put("expired", expired);
        stats.put("totalUsers", totalUsers);
        return stats;
    }

    public CertResponse approveRenewal(String certId) {
        Certification cert = certRepository.findById(certId)
                .orElseThrow(() -> new IllegalArgumentException("Certification not found"));

        cert.setRenewalStatus(Certification.RenewalStatus.APPROVED);
        certRepository.save(cert);

        // Send approval email to the user
        userRepository.findById(cert.getUserId())
                .ifPresent(user -> emailService.sendRenewalApprovedEmail(user, cert));

        String userName = userRepository.findById(cert.getUserId())
                .map(User::getName).orElse("Unknown");
        return certificationService.toResponse(cert, userName);
    }

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
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.USER)
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
}

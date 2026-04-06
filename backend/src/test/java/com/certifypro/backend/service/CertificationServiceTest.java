package com.certifypro.backend.service;

import com.certifypro.backend.dto.CertRequest;
import com.certifypro.backend.dto.CertResponse;
import com.certifypro.backend.model.Certification;
import com.certifypro.backend.repository.CertificationRepository;
import com.certifypro.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class CertificationServiceTest {

    @Mock CertificationRepository certRepository;
    @Mock UserRepository userRepository;
    @Mock EmailService emailService;

    @InjectMocks CertificationService certificationService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        // Inject a default upload dir
        org.springframework.test.util.ReflectionTestUtils.setField(certificationService, "uploadDir", "uploads");
    }

    // ── Get My Certs ──────────────────────────────────────────────────────

    @Test
    void testGetMyCertsReturnsUserCerts() {
        String userId = "user1";
        Certification cert = Certification.builder()
                .id("cert1")
                .userId(userId)
                .certName("AWS Certified")
                .issuedBy("Amazon")
                .issueDate(LocalDate.now().minusMonths(6))
                .expiryDate(LocalDate.now().plusMonths(6))
                .build();

        when(certRepository.findByUserId(userId)).thenReturn(List.of(cert));

        List<CertResponse> result = certificationService.getMyCerts(userId);

        assertEquals(1, result.size());
        assertEquals("AWS Certified", result.get(0).getCertName());
        assertEquals("ACTIVE", result.get(0).getStatus());
    }

    @Test
    void testGetMyCertsEmptyForNewUser() {
        when(certRepository.findByUserId("new-user")).thenReturn(List.of());
        List<CertResponse> result = certificationService.getMyCerts("new-user");
        assertTrue(result.isEmpty());
    }

    // ── Add Cert ──────────────────────────────────────────────────────────

    @Test
    void testAddCertSuccess() {
        CertRequest req = new CertRequest();
        req.setCertName("Azure Fundamentals");
        req.setIssuedBy("Microsoft");
        req.setIssueDate(LocalDate.now().minusMonths(3));
        req.setExpiryDate(LocalDate.now().plusMonths(9));

        Certification saved = Certification.builder()
                .id("cert-new")
                .userId("user1")
                .certName("Azure Fundamentals")
                .issuedBy("Microsoft")
                .issueDate(req.getIssueDate())
                .expiryDate(req.getExpiryDate())
                .build();

        when(certRepository.save(any(Certification.class))).thenReturn(saved);
        when(userRepository.findById("user1")).thenReturn(Optional.empty());

        CertResponse res = certificationService.addCert("user1", req, null);

        assertNotNull(res);
        assertEquals("Azure Fundamentals", res.getCertName());
        assertEquals("ACTIVE", res.getStatus());
        verify(certRepository, times(1)).save(any(Certification.class));
    }

    @Test
    void testAddCertExpiryBeforeIssueThrows() {
        CertRequest req = new CertRequest();
        req.setCertName("Bad Cert");
        req.setIssuedBy("Issuer");
        req.setIssueDate(LocalDate.now());
        req.setExpiryDate(LocalDate.now().minusDays(1)); // expiry BEFORE issue

        assertThrows(IllegalArgumentException.class,
                () -> certificationService.addCert("user1", req, null));

        verify(certRepository, never()).save(any());
    }

    @Test
    void testAddCertSameDateThrows() {
        CertRequest req = new CertRequest();
        req.setCertName("Bad Cert");
        req.setIssuedBy("Issuer");
        LocalDate today = LocalDate.now();
        req.setIssueDate(today);
        req.setExpiryDate(today); // same day

        assertThrows(IllegalArgumentException.class,
                () -> certificationService.addCert("user1", req, null));
    }

    // ── Delete Cert ───────────────────────────────────────────────────────

    @Test
    void testDeleteCertSuccess() {
        Certification cert = Certification.builder()
                .id("cert1")
                .userId("owner1")
                .certName("GCP Pro")
                .issuedBy("Google")
                .issueDate(LocalDate.now().minusYears(1))
                .expiryDate(LocalDate.now().plusYears(1))
                .build();

        when(certRepository.findById("cert1")).thenReturn(Optional.of(cert));

        assertDoesNotThrow(() -> certificationService.deleteCert("cert1", "owner1"));
        verify(certRepository, times(1)).delete(cert);
    }

    @Test
    void testDeleteCertAccessDeniedForWrongUser() {
        Certification cert = Certification.builder()
                .id("cert1")
                .userId("owner1")
                .certName("GCP Pro")
                .issuedBy("Google")
                .issueDate(LocalDate.now().minusYears(1))
                .expiryDate(LocalDate.now().plusYears(1))
                .build();

        when(certRepository.findById("cert1")).thenReturn(Optional.of(cert));

        SecurityException ex = assertThrows(SecurityException.class,
                () -> certificationService.deleteCert("cert1", "intruder"));
        assertEquals("Access denied", ex.getMessage());
        verify(certRepository, never()).delete(any());
    }

    @Test
    void testDeleteCertNotFound() {
        when(certRepository.findById("nonexistent")).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class,
                () -> certificationService.deleteCert("nonexistent", "user1"));
    }

    // ── Update Reminder Preference ────────────────────────────────────────

    @Test
    void testUpdateReminderPreferenceDisable() {
        Certification cert = Certification.builder()
                .id("cert1")
                .userId("user1")
                .certName("GCP Pro")
                .issuedBy("Google")
                .issueDate(LocalDate.now().minusYears(1))
                .expiryDate(LocalDate.now().plusYears(1))
                .remindersDisabled(false)
                .build();

        when(certRepository.findById("cert1")).thenReturn(Optional.of(cert));
        when(certRepository.save(any())).thenReturn(cert);

        CertResponse res = certificationService.updateReminderPreference("cert1", "user1", true);
        assertTrue(cert.isRemindersDisabled());
    }
}

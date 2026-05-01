package com.certifypro.backend.controller;

import com.certifypro.backend.dto.CertRequest;
import com.certifypro.backend.dto.CertResponse;
import com.certifypro.backend.service.CertificationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/certs")
public class CertificationController {

    private final CertificationService certificationService;

    public CertificationController(CertificationService certificationService) {
        this.certificationService = certificationService;
    }

    @GetMapping
    public ResponseEntity<List<CertResponse>> getMyCerts(@AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(certificationService.getMyCerts(userId));
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<?> addCert(
            @AuthenticationPrincipal String userId,
            @RequestPart("certName") String certName,
            @RequestPart("issuedBy") String issuedBy,
            @RequestPart("issueDate") String issueDate,
            @RequestPart("expiryDate") String expiryDate,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        try {
            CertRequest request = new CertRequest();
            request.setCertName(certName);
            request.setIssuedBy(issuedBy);
            request.setIssueDate(java.time.LocalDate.parse(issueDate));
            request.setExpiryDate(java.time.LocalDate.parse(expiryDate));

            CertResponse response = certificationService.addCert(userId, request, file);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (DateTimeParseException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid date format. Use YYYY-MM-DD"));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCertById(@PathVariable String id,
                                         @AuthenticationPrincipal String userId) {
        try {
            CertResponse response = certificationService.getCertById(id, userId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCert(@PathVariable String id,
                                         @Valid @RequestBody CertRequest request,
                                         @AuthenticationPrincipal String userId) {
        try {
            CertResponse response = certificationService.updateCert(id, userId, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
        }
    }

    @PutMapping("/{id}/reminders")
    public ResponseEntity<?> updateReminderPreference(@PathVariable String id,
                                                      @RequestParam boolean disabled,
                                                      @AuthenticationPrincipal String userId) {
        try {
            CertResponse response = certificationService.updateReminderPreference(id, userId, disabled);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCert(@PathVariable String id,
                                         @AuthenticationPrincipal String userId) {
        try {
            certificationService.deleteCert(id, userId);
            return ResponseEntity.ok(Map.of("message", "Certification deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
        }
    }
}

package com.certifypro.backend.controller;

import com.certifypro.backend.dto.CertRequest;
import com.certifypro.backend.dto.CertResponse;
import com.certifypro.backend.service.CertificationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
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
    public ResponseEntity<List<CertResponse>> getMyCerts(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(certificationService.getMyCerts(userDetails.getUsername()));
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<?> addCert(
            @AuthenticationPrincipal UserDetails userDetails,
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

            CertResponse response = certificationService.addCert(userDetails.getUsername(), request, file);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (DateTimeParseException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid date format. Use YYYY-MM-DD"));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCertById(@PathVariable String id,
                                         @AuthenticationPrincipal UserDetails userDetails) {
        try {
            CertResponse response = certificationService.getCertById(id, userDetails.getUsername());
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
                                         @AuthenticationPrincipal UserDetails userDetails) {
        try {
            CertResponse response = certificationService.updateCert(id, userDetails.getUsername(), request);
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
                                                      @AuthenticationPrincipal UserDetails userDetails) {
        try {
            CertResponse response = certificationService.updateReminderPreference(id, userDetails.getUsername(), disabled);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCert(@PathVariable String id,
                                         @AuthenticationPrincipal UserDetails userDetails) {
        try {
            certificationService.deleteCert(id, userDetails.getUsername());
            return ResponseEntity.ok(Map.of("message", "Certification deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
        }
    }
}

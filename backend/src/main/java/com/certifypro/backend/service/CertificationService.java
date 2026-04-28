package com.certifypro.backend.service;

import com.certifypro.backend.dto.CertRequest;
import com.certifypro.backend.dto.CertResponse;
import com.certifypro.backend.model.Certification;
import com.certifypro.backend.repository.CertificationRepository;
import com.certifypro.backend.util.CertUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Locale;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CertificationService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".pdf", ".png", ".jpg", ".jpeg");
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "application/pdf",
            "image/png",
            "image/jpeg"
    );

    private final CertificationRepository certRepository;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    public CertificationService(CertificationRepository certRepository) {
        this.certRepository = certRepository;
    }

    public List<CertResponse> getMyCerts(String userId) {
        return certRepository.findByUserId(userId)
                .stream()
                .map(c -> toResponse(c, null))
                .collect(Collectors.toList());
    }

    public CertResponse addCert(String userId, CertRequest request, MultipartFile file) {
        if (request.getExpiryDate().isBefore(request.getIssueDate()) ||
            request.getExpiryDate().isEqual(request.getIssueDate())) {
            throw new IllegalArgumentException("Expiry date must be after issue date");
        }

        String fileUrl = null;
        String fileName = null;
        if (file != null && !file.isEmpty()) {
            String[] uploaded = saveFile(file);
            fileUrl = uploaded[0];
            fileName = uploaded[1];
        }

        Certification cert = Certification.builder()
                .userId(userId)
                .certName(request.getCertName())
                .issuedBy(request.getIssuedBy())
                .issueDate(request.getIssueDate())
                .expiryDate(request.getExpiryDate())
                .fileUrl(fileUrl)
                .fileName(fileName)
                .build();

        certRepository.save(cert);
        return toResponse(cert, null);
    }

    public CertResponse updateCert(String certId, String userId, CertRequest request) {
        Certification cert = certRepository.findById(certId)
                .orElseThrow(() -> new IllegalArgumentException("Certification not found"));

        if (!cert.getUserId().equals(userId)) {
            throw new SecurityException("Access denied");
        }

        cert.setCertName(request.getCertName());
        cert.setIssuedBy(request.getIssuedBy());
        cert.setIssueDate(request.getIssueDate());
        cert.setExpiryDate(request.getExpiryDate());

        certRepository.save(cert);
        return toResponse(cert, null);
    }

    public void deleteCert(String certId, String userId) {
        Certification cert = certRepository.findById(certId)
                .orElseThrow(() -> new IllegalArgumentException("Certification not found"));

        if (!cert.getUserId().equals(userId)) {
            throw new SecurityException("Access denied");
        }

        // Delete local file if it exists
        if (cert.getFileUrl() != null) {
            try {
                Path filePath = Paths.get(cert.getFileUrl().replace("/uploads/", uploadDir + "/"));
                Files.deleteIfExists(filePath);
            } catch (IOException ignored) {}
        }

        certRepository.delete(cert);
    }

    public CertResponse getCertById(String certId, String userId) {
        Certification cert = certRepository.findById(certId)
                .orElseThrow(() -> new IllegalArgumentException("Certification not found"));

        if (!cert.getUserId().equals(userId)) {
            throw new SecurityException("Access denied");
        }

        return toResponse(cert, null);
    }

    public CertResponse updateReminderPreference(String certId, String userId, boolean disabled) {
        Certification cert = certRepository.findById(certId)
                .orElseThrow(() -> new IllegalArgumentException("Certification not found"));

        if (!cert.getUserId().equals(userId)) {
            throw new SecurityException("Access denied");
        }

        cert.setRemindersDisabled(disabled);
        certRepository.save(cert);
        return toResponse(cert, null);
    }

    public CertResponse toResponse(Certification cert, String userName) {
        long daysLeft = CertUtils.getDaysUntilExpiry(cert.getExpiryDate());
        return CertResponse.builder()
                .id(cert.getId())
                .userId(cert.getUserId())
                .userName(userName)
                .certName(cert.getCertName())
                .issuedBy(cert.getIssuedBy())
                .issueDate(cert.getIssueDate())
                .expiryDate(cert.getExpiryDate())
                .fileUrl(cert.getFileUrl())
                .fileName(cert.getFileName())
                .renewalStatus(cert.getRenewalStatus().name())
                .status(CertUtils.getCertStatus(cert.getExpiryDate()))
                .daysLeft(daysLeft)
                .remindersDisabled(cert.isRemindersDisabled())
                .createdAt(cert.getCreatedAt())
                .notifiedAt(cert.getNotifiedAt())
                .build();
    }

    private String[] saveFile(MultipartFile file) {
        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalName = file.getOriginalFilename();
            if (originalName == null || originalName.isBlank()) {
                throw new IllegalArgumentException("Uploaded file must have a valid name");
            }

            String cleanedName = Paths.get(originalName).getFileName().toString();
            String extension = originalName != null && originalName.contains(".")
                    ? originalName.substring(originalName.lastIndexOf(".")).toLowerCase(Locale.ROOT)
                    : "";

            String contentType = file.getContentType();
            if (!ALLOWED_EXTENSIONS.contains(extension) || contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
                throw new IllegalArgumentException("Only PDF, PNG, JPG, and JPEG files are allowed");
            }

            String uniqueName = UUID.randomUUID() + extension;
            Path destination = uploadPath.resolve(uniqueName);
            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
            return new String[]{"/uploads/" + uniqueName, cleanedName};
        } catch (IOException e) {
            throw new RuntimeException("Failed to save file: " + e.getMessage());
        }
    }
}

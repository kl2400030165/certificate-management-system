package com.certifypro.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "certifications", indexes = {
        @Index(name = "idx_certifications_user_id", columnList = "userId"),
        @Index(name = "idx_certifications_expiry_date", columnList = "expiryDate")
})
public class Certification {

    @Id
    @Column(length = 36, nullable = false, updatable = false)
    private String id;

    @Column(nullable = false, length = 36)
    private String userId;

    @Column(nullable = false)
    private String certName;

    @Column(nullable = false)
    private String issuedBy;

    @Column(nullable = false)
    private LocalDate issueDate;

    @Column(nullable = false)
    private LocalDate expiryDate;

    private String fileUrl;       // local path or URL

    private String fileName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private RenewalStatus renewalStatus = RenewalStatus.NONE;

    private LocalDateTime notifiedAt;  // last email notification sent

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private boolean remindersDisabled = false; // user can disable notifications

    public Certification() {
    }

    public Certification(String id,
                         String userId,
                         String certName,
                         String issuedBy,
                         LocalDate issueDate,
                         LocalDate expiryDate,
                         String fileUrl,
                         String fileName,
                         RenewalStatus renewalStatus,
                         LocalDateTime notifiedAt,
                         LocalDateTime createdAt,
                         boolean remindersDisabled) {
        this.id = id;
        this.userId = userId;
        this.certName = certName;
        this.issuedBy = issuedBy;
        this.issueDate = issueDate;
        this.expiryDate = expiryDate;
        this.fileUrl = fileUrl;
        this.fileName = fileName;
        this.renewalStatus = renewalStatus;
        this.notifiedAt = notifiedAt;
        this.createdAt = createdAt;
        this.remindersDisabled = remindersDisabled;
    }

    @PrePersist
    public void prePersist() {
        if (id == null || id.isBlank()) {
            id = UUID.randomUUID().toString();
        }
        if (renewalStatus == null) {
            renewalStatus = RenewalStatus.NONE;
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public boolean isExpired() {
        return LocalDate.now().isAfter(expiryDate);
    }

    public String getName() {
        return certName;
    }

    public enum RenewalStatus {
        NONE, PENDING, APPROVED, REJECTED
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String id;
        private String userId;
        private String certName;
        private String issuedBy;
        private LocalDate issueDate;
        private LocalDate expiryDate;
        private String fileUrl;
        private String fileName;
        private RenewalStatus renewalStatus;
        private LocalDateTime notifiedAt;
        private LocalDateTime createdAt;
        private Boolean remindersDisabled;

        public Builder id(String id) {
            this.id = id;
            return this;
        }

        public Builder userId(String userId) {
            this.userId = userId;
            return this;
        }

        public Builder certName(String certName) {
            this.certName = certName;
            return this;
        }

        public Builder issuedBy(String issuedBy) {
            this.issuedBy = issuedBy;
            return this;
        }

        public Builder issueDate(LocalDate issueDate) {
            this.issueDate = issueDate;
            return this;
        }

        public Builder expiryDate(LocalDate expiryDate) {
            this.expiryDate = expiryDate;
            return this;
        }

        public Builder fileUrl(String fileUrl) {
            this.fileUrl = fileUrl;
            return this;
        }

        public Builder fileName(String fileName) {
            this.fileName = fileName;
            return this;
        }

        public Builder renewalStatus(RenewalStatus renewalStatus) {
            this.renewalStatus = renewalStatus;
            return this;
        }

        public Builder notifiedAt(LocalDateTime notifiedAt) {
            this.notifiedAt = notifiedAt;
            return this;
        }

        public Builder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public Builder remindersDisabled(boolean remindersDisabled) {
            this.remindersDisabled = remindersDisabled;
            return this;
        }

        public Certification build() {
            Certification certification = new Certification();
            certification.id = this.id;
            certification.userId = this.userId;
            certification.certName = this.certName;
            certification.issuedBy = this.issuedBy;
            certification.issueDate = this.issueDate;
            certification.expiryDate = this.expiryDate;
            certification.fileUrl = this.fileUrl;
            certification.fileName = this.fileName;
            certification.renewalStatus = this.renewalStatus != null ? this.renewalStatus : RenewalStatus.NONE;
            certification.notifiedAt = this.notifiedAt;
            certification.createdAt = this.createdAt != null ? this.createdAt : LocalDateTime.now();
            certification.remindersDisabled = this.remindersDisabled != null && this.remindersDisabled;
            return certification;
        }
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getCertName() {
        return certName;
    }

    public void setCertName(String certName) {
        this.certName = certName;
    }

    public String getIssuedBy() {
        return issuedBy;
    }

    public void setIssuedBy(String issuedBy) {
        this.issuedBy = issuedBy;
    }

    public LocalDate getIssueDate() {
        return issueDate;
    }

    public void setIssueDate(LocalDate issueDate) {
        this.issueDate = issueDate;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public RenewalStatus getRenewalStatus() {
        return renewalStatus;
    }

    public void setRenewalStatus(RenewalStatus renewalStatus) {
        this.renewalStatus = renewalStatus;
    }

    public LocalDateTime getNotifiedAt() {
        return notifiedAt;
    }

    public void setNotifiedAt(LocalDateTime notifiedAt) {
        this.notifiedAt = notifiedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isRemindersDisabled() {
        return remindersDisabled;
    }

    public void setRemindersDisabled(boolean remindersDisabled) {
        this.remindersDisabled = remindersDisabled;
    }
}

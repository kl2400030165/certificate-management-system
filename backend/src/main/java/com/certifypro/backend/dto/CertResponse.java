package com.certifypro.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class CertResponse {
    private String id;
    private String userId;
    private String userName;     // populated for admin views
    private String certName;
    private String issuedBy;
    private LocalDate issueDate;
    private LocalDate expiryDate;
    private String fileUrl;
    private String fileName;
    private String renewalStatus;
    private String status;       // computed: ACTIVE / EXPIRING SOON / EXPIRED
    private long daysLeft;       // computed
    private boolean remindersDisabled;
    private LocalDateTime createdAt;
    private LocalDateTime notifiedAt;

    public CertResponse() {
    }

    public CertResponse(String id,
                        String userId,
                        String userName,
                        String certName,
                        String issuedBy,
                        LocalDate issueDate,
                        LocalDate expiryDate,
                        String fileUrl,
                        String fileName,
                        String renewalStatus,
                        String status,
                        long daysLeft,
                        boolean remindersDisabled,
                        LocalDateTime createdAt,
                        LocalDateTime notifiedAt) {
        this.id = id;
        this.userId = userId;
        this.userName = userName;
        this.certName = certName;
        this.issuedBy = issuedBy;
        this.issueDate = issueDate;
        this.expiryDate = expiryDate;
        this.fileUrl = fileUrl;
        this.fileName = fileName;
        this.renewalStatus = renewalStatus;
        this.status = status;
        this.daysLeft = daysLeft;
        this.remindersDisabled = remindersDisabled;
        this.createdAt = createdAt;
        this.notifiedAt = notifiedAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String id;
        private String userId;
        private String userName;
        private String certName;
        private String issuedBy;
        private LocalDate issueDate;
        private LocalDate expiryDate;
        private String fileUrl;
        private String fileName;
        private String renewalStatus;
        private String status;
        private long daysLeft;
        private boolean remindersDisabled;
        private LocalDateTime createdAt;
        private LocalDateTime notifiedAt;

        public Builder id(String id) {
            this.id = id;
            return this;
        }

        public Builder userId(String userId) {
            this.userId = userId;
            return this;
        }

        public Builder userName(String userName) {
            this.userName = userName;
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

        public Builder renewalStatus(String renewalStatus) {
            this.renewalStatus = renewalStatus;
            return this;
        }

        public Builder status(String status) {
            this.status = status;
            return this;
        }

        public Builder daysLeft(long daysLeft) {
            this.daysLeft = daysLeft;
            return this;
        }

        public Builder remindersDisabled(boolean remindersDisabled) {
            this.remindersDisabled = remindersDisabled;
            return this;
        }

        public Builder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public Builder notifiedAt(LocalDateTime notifiedAt) {
            this.notifiedAt = notifiedAt;
            return this;
        }

        public CertResponse build() {
            return new CertResponse(
                    id,
                    userId,
                    userName,
                    certName,
                    issuedBy,
                    issueDate,
                    expiryDate,
                    fileUrl,
                    fileName,
                    renewalStatus,
                    status,
                    daysLeft,
                    remindersDisabled,
                    createdAt,
                    notifiedAt
            );
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

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
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

    public String getRenewalStatus() {
        return renewalStatus;
    }

    public void setRenewalStatus(String renewalStatus) {
        this.renewalStatus = renewalStatus;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public long getDaysLeft() {
        return daysLeft;
    }

    public void setDaysLeft(long daysLeft) {
        this.daysLeft = daysLeft;
    }

    public boolean isRemindersDisabled() {
        return remindersDisabled;
    }

    public void setRemindersDisabled(boolean remindersDisabled) {
        this.remindersDisabled = remindersDisabled;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getNotifiedAt() {
        return notifiedAt;
    }

    public void setNotifiedAt(LocalDateTime notifiedAt) {
        this.notifiedAt = notifiedAt;
    }
}

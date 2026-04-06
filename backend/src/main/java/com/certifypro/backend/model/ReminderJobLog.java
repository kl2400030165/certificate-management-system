package com.certifypro.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "reminder_job_logs", indexes = {
    @Index(name = "idx_reminder_job_logs_created_at", columnList = "createdAt")
})
public class ReminderJobLog {

    @Id
    @Column(length = 36, nullable = false, updatable = false)
    private String id;

    @Column(nullable = false, length = 16)
    private String jobType; // DAILY | WEEKLY

    @Column(nullable = false, length = 16)
    private String status; // SUCCESS | FAILED

    @Column(nullable = false)
    private String message;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public ReminderJobLog() {
    }

    public ReminderJobLog(String id,
                          String jobType,
                          String status,
                          String message,
                          LocalDateTime createdAt) {
        this.id = id;
        this.jobType = jobType;
        this.status = status;
        this.message = message;
        this.createdAt = createdAt;
    }

    @PrePersist
    public void prePersist() {
        if (id == null || id.isBlank()) {
            id = UUID.randomUUID().toString();
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String id;
        private String jobType;
        private String status;
        private String message;
        private LocalDateTime createdAt;

        public Builder id(String id) {
            this.id = id;
            return this;
        }

        public Builder jobType(String jobType) {
            this.jobType = jobType;
            return this;
        }

        public Builder status(String status) {
            this.status = status;
            return this;
        }

        public Builder message(String message) {
            this.message = message;
            return this;
        }

        public Builder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public ReminderJobLog build() {
            ReminderJobLog log = new ReminderJobLog();
            log.id = this.id;
            log.jobType = this.jobType;
            log.status = this.status;
            log.message = this.message;
            log.createdAt = this.createdAt != null ? this.createdAt : LocalDateTime.now();
            return log;
        }
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getJobType() {
        return jobType;
    }

    public void setJobType(String jobType) {
        this.jobType = jobType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

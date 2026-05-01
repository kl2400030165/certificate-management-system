package com.certifypro.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_users_role", columnList = "role")
})
public class User {

    @Id
    @Column(length = 36, nullable = false, updatable = false)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private boolean emailVerified = false;

    private String otpCode;

    private LocalDateTime otpExpiresAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private Role role = Role.USER;

    @Column(nullable = false)
    private boolean notificationsEnabled = true;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private NotificationFrequency notificationFrequency = NotificationFrequency.SINGLE;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public User() {
    }

    public User(String id,
                String name,
                String email,
                String passwordHash,
                boolean emailVerified,
                String otpCode,
                LocalDateTime otpExpiresAt,
                Role role,
                boolean notificationsEnabled,
                NotificationFrequency notificationFrequency,
                LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.emailVerified = emailVerified;
        this.otpCode = otpCode;
        this.otpExpiresAt = otpExpiresAt;
        this.role = role;
        this.notificationsEnabled = notificationsEnabled;
        this.notificationFrequency = notificationFrequency;
        this.createdAt = createdAt;
    }

    @PrePersist
    public void prePersist() {
        if (id == null || id.isBlank()) {
            id = UUID.randomUUID().toString();
        }
        if (role == null) {
            role = Role.USER;
        }
        if (notificationFrequency == null) {
            notificationFrequency = NotificationFrequency.SINGLE;
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public enum Role {
        USER, ADMIN
    }

    public enum NotificationFrequency {
        SINGLE, WEEKLY
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String id;
        private String name;
        private String email;
        private String passwordHash;
        private Boolean emailVerified;
        private String otpCode;
        private LocalDateTime otpExpiresAt;
        private Role role;
        private Boolean notificationsEnabled;
        private NotificationFrequency notificationFrequency;
        private LocalDateTime createdAt;

        public Builder id(String id) {
            this.id = id;
            return this;
        }

        public Builder name(String name) {
            this.name = name;
            return this;
        }

        public Builder email(String email) {
            this.email = email;
            return this;
        }

        public Builder passwordHash(String passwordHash) {
            this.passwordHash = passwordHash;
            return this;
        }

        public Builder emailVerified(boolean emailVerified) {
            this.emailVerified = emailVerified;
            return this;
        }

        public Builder otpCode(String otpCode) {
            this.otpCode = otpCode;
            return this;
        }

        public Builder otpExpiresAt(LocalDateTime otpExpiresAt) {
            this.otpExpiresAt = otpExpiresAt;
            return this;
        }

        public Builder role(Role role) {
            this.role = role;
            return this;
        }

        public Builder notificationsEnabled(boolean notificationsEnabled) {
            this.notificationsEnabled = notificationsEnabled;
            return this;
        }

        public Builder notificationFrequency(NotificationFrequency notificationFrequency) {
            this.notificationFrequency = notificationFrequency;
            return this;
        }

        public Builder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public User build() {
            User user = new User();
            user.id = this.id;
            user.name = this.name;
            user.email = this.email;
            user.passwordHash = this.passwordHash;
            user.emailVerified = this.emailVerified != null && this.emailVerified;
            user.otpCode = this.otpCode;
            user.otpExpiresAt = this.otpExpiresAt;
            user.role = this.role != null ? this.role : Role.USER;
            user.notificationsEnabled = this.notificationsEnabled != null ? this.notificationsEnabled : true;
            user.notificationFrequency = this.notificationFrequency != null
                    ? this.notificationFrequency
                    : NotificationFrequency.SINGLE;
            user.createdAt = this.createdAt != null ? this.createdAt : LocalDateTime.now();
            return user;
        }
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public String getOtpCode() {
        return otpCode;
    }

    public void setOtpCode(String otpCode) {
        this.otpCode = otpCode;
    }

    public LocalDateTime getOtpExpiresAt() {
        return otpExpiresAt;
    }

    public void setOtpExpiresAt(LocalDateTime otpExpiresAt) {
        this.otpExpiresAt = otpExpiresAt;
    }

    public boolean isOtpValid(String code) {
        return otpCode != null
                && otpExpiresAt != null
                && otpCode.equals(code)
                && otpExpiresAt.isAfter(LocalDateTime.now());
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public boolean isNotificationsEnabled() {
        return notificationsEnabled;
    }

    public void setNotificationsEnabled(boolean notificationsEnabled) {
        this.notificationsEnabled = notificationsEnabled;
    }

    public NotificationFrequency getNotificationFrequency() {
        return notificationFrequency;
    }

    public void setNotificationFrequency(NotificationFrequency notificationFrequency) {
        this.notificationFrequency = notificationFrequency;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

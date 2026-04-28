package com.certifypro.backend.dto;

public class AuthResponse {
    private String token;
    private String userId;
    private String name;
    private String email;
    private String role;
    private boolean emailVerified;
    private boolean notificationsEnabled;
    private String notificationFrequency;

    public AuthResponse() {
    }

    public AuthResponse(String token,
                        String userId,
                        String name,
                        String email,
                        String role,
                        boolean emailVerified,
                        boolean notificationsEnabled,
                        String notificationFrequency) {
        this.token = token;
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.role = role;
        this.emailVerified = emailVerified;
        this.notificationsEnabled = notificationsEnabled;
        this.notificationFrequency = notificationFrequency;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String token;
        private String userId;
        private String name;
        private String email;
        private String role;
        private boolean emailVerified;
        private boolean notificationsEnabled;
        private String notificationFrequency;

        public Builder token(String token) {
            this.token = token;
            return this;
        }

        public Builder userId(String userId) {
            this.userId = userId;
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

        public Builder role(String role) {
            this.role = role;
            return this;
        }

        public Builder emailVerified(boolean emailVerified) {
            this.emailVerified = emailVerified;
            return this;
        }

        public Builder notificationsEnabled(boolean notificationsEnabled) {
            this.notificationsEnabled = notificationsEnabled;
            return this;
        }

        public Builder notificationFrequency(String notificationFrequency) {
            this.notificationFrequency = notificationFrequency;
            return this;
        }

        public AuthResponse build() {
            return new AuthResponse(token, userId, name, email, role, emailVerified, notificationsEnabled, notificationFrequency);
        }
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
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

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public boolean isNotificationsEnabled() {
        return notificationsEnabled;
    }

    public void setNotificationsEnabled(boolean notificationsEnabled) {
        this.notificationsEnabled = notificationsEnabled;
    }

    public String getNotificationFrequency() {
        return notificationFrequency;
    }

    public void setNotificationFrequency(String notificationFrequency) {
        this.notificationFrequency = notificationFrequency;
    }
}

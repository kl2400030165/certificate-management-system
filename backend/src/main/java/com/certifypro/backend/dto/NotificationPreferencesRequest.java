package com.certifypro.backend.dto;

public class NotificationPreferencesRequest {
    private Boolean notificationsEnabled;
    private String notificationFrequency; // single | weekly

    public NotificationPreferencesRequest() {
    }

    public Boolean getNotificationsEnabled() {
        return notificationsEnabled;
    }

    public void setNotificationsEnabled(Boolean notificationsEnabled) {
        this.notificationsEnabled = notificationsEnabled;
    }

    public String getNotificationFrequency() {
        return notificationFrequency;
    }

    public void setNotificationFrequency(String notificationFrequency) {
        this.notificationFrequency = notificationFrequency;
    }
}

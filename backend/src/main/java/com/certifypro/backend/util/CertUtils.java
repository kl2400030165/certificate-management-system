package com.certifypro.backend.util;

import com.certifypro.backend.model.Certification;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

public class CertUtils {

    public static String getCertStatus(LocalDate expiryDate) {
        if (expiryDate == null) return "UNKNOWN";
        long daysLeft = getDaysUntilExpiry(expiryDate);
        if (daysLeft < 0) return "EXPIRED";
        if (daysLeft <= 30) return "EXPIRING SOON";
        return "ACTIVE";
    }

    public static long getDaysUntilExpiry(LocalDate expiryDate) {
        return ChronoUnit.DAYS.between(LocalDate.now(), expiryDate);
    }
}

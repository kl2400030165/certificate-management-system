package com.certifypro.backend.util;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

class CertUtilsTest {

    @Test
    void getCertStatus_expired() {
        assertEquals("EXPIRED", CertUtils.getCertStatus(LocalDate.now().minusDays(1)));
    }

    @Test
    void getCertStatus_expiringSoon() {
        assertEquals("EXPIRING SOON", CertUtils.getCertStatus(LocalDate.now().plusDays(15)));
    }

    @Test
    void getCertStatus_active() {
        assertEquals("ACTIVE", CertUtils.getCertStatus(LocalDate.now().plusDays(60)));
    }

    @Test
    void getCertStatus_null_unknown() {
        assertEquals("UNKNOWN", CertUtils.getCertStatus(null));
    }
}

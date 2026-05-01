package com.certifypro.backend.service;

import org.junit.jupiter.api.Test;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;

class EmailServiceTest {

    @Test
    void resolveFromAddress_usesConfiguredFromWhenPresent() {
        EmailService service = new EmailService(mock(JavaMailSender.class));
        ReflectionTestUtils.setField(service, "emailFrom", "CertifyPro <sender@example.com>");
        ReflectionTestUtils.setField(service, "mailUsername", "account@gmail.com");

        assertEquals("CertifyPro <sender@example.com>", service.resolveFromAddress());
    }

    @Test
    void resolveFromAddress_fallsBackToMailUsernameForPlaceholderFrom() {
        EmailService service = new EmailService(mock(JavaMailSender.class));
        ReflectionTestUtils.setField(service, "emailFrom", "CertifyPro <noreply@certifypro.com>");
        ReflectionTestUtils.setField(service, "mailUsername", "account@gmail.com");

        assertEquals("account@gmail.com", service.resolveFromAddress());
    }

    @Test
    void resolveFromAddress_failsClearlyWhenSenderIsMissing() {
        EmailService service = new EmailService(mock(JavaMailSender.class));
        ReflectionTestUtils.setField(service, "emailFrom", "");
        ReflectionTestUtils.setField(service, "mailUsername", "");

        IllegalStateException ex = assertThrows(IllegalStateException.class, service::resolveFromAddress);
        assertEquals("Email sender is not configured. Set EMAIL_USER and EMAIL_PASS.", ex.getMessage());
    }
}

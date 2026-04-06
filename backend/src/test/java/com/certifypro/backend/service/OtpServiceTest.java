package com.certifypro.backend.service;

import com.certifypro.backend.model.User;
import com.certifypro.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class OtpServiceTest {

    @Mock UserRepository userRepository;
    @Mock EmailService emailService;

    @InjectMocks OtpService otpService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void verifyRegistrationOrLoginOtp_unverifiedUser_marksVerifiedAndWelcomes() {
        User user = User.builder()
                .id("u1")
                .name("Pat")
                .email("pat@example.com")
                .passwordHash("h")
                .role(User.Role.USER)
                .emailVerified(false)
                .build();
        user.setOtpCode("654321");
        user.setOtpExpiresAt(LocalDateTime.now().plusMinutes(5));

        when(userRepository.findByEmail("pat@example.com")).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        User out = otpService.verifyRegistrationOrLoginOtp("pat@example.com", "654321");

        assertTrue(out.isEmailVerified());
        assertNull(out.getOtpCode());
        verify(emailService, times(1)).sendWelcomeEmail(out);
    }

    @Test
    void verifyRegistrationOrLoginOtp_verifiedUser_acceptsLoginOtp() {
        User user = User.builder()
                .id("u2")
                .name("Sam")
                .email("sam@example.com")
                .passwordHash("h")
                .role(User.Role.USER)
                .emailVerified(true)
                .build();
        user.setOtpCode("111222");
        user.setOtpExpiresAt(LocalDateTime.now().plusMinutes(5));

        when(userRepository.findByEmail("sam@example.com")).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        User out = otpService.verifyRegistrationOrLoginOtp("sam@example.com", "111222");

        assertTrue(out.isEmailVerified());
        assertNull(out.getOtpCode());
        verify(emailService, never()).sendWelcomeEmail(any());
    }

    @Test
    void resendOtpSmart_unverified_callsRegistrationResend() {
        User user = User.builder()
                .id("u3")
                .email("a@b.com")
                .name("A")
                .passwordHash("h")
                .role(User.Role.USER)
                .emailVerified(false)
                .build();

        when(userRepository.findByEmail("a@b.com")).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        otpService.resendOtpSmart("a@b.com");

        ArgumentCaptor<String> otpCap = ArgumentCaptor.forClass(String.class);
        verify(emailService, times(1)).sendOtpEmail(eq(user), otpCap.capture());
        assertEquals(6, otpCap.getValue().length());
    }

    @Test
    void resendOtpSmart_verified_sendsLoginOtp() {
        User user = User.builder()
                .id("u4")
                .email("admin@example.com")
                .name("Admin")
                .passwordHash("h")
                .role(User.Role.USER)
                .emailVerified(true)
                .build();

        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        otpService.resendOtpSmart("admin@example.com");

        verify(emailService, times(1)).sendOtpEmail(eq(user), anyString());
    }
}

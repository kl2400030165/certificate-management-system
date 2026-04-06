package com.certifypro.backend.service;

import com.certifypro.backend.dto.AuthResponse;
import com.certifypro.backend.dto.LoginRequest;
import com.certifypro.backend.dto.RegisterRequest;
import com.certifypro.backend.model.User;
import com.certifypro.backend.repository.UserRepository;
import com.certifypro.backend.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class AuthServiceTest {

    @Mock UserRepository userRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtUtil jwtUtil;
    @Mock EmailService emailService;
    @Mock OtpService otpService;

    @InjectMocks AuthService authService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testRegisterSuccess_sendsOtp_noJwt() {
        RegisterRequest req = new RegisterRequest();
        req.setName("Alice");
        req.setEmail("alice@example.com");
        req.setPassword("password123");

        when(userRepository.existsByEmail("alice@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId("user-id-1");
            return u;
        });

        AuthResponse res = authService.register(req);

        assertNotNull(res);
        assertNull(res.getToken());
        assertEquals("alice@example.com", res.getEmail());
        assertEquals("user", res.getRole());
        assertFalse(res.isEmailVerified());
        verify(otpService, times(1)).generateAndSend(any(User.class));
        verify(emailService, never()).sendWelcomeEmail(any(User.class));
    }

    @Test
    void testRegisterDuplicateEmail() {
        RegisterRequest req = new RegisterRequest();
        req.setName("Bob");
        req.setEmail("duplicate@example.com");
        req.setPassword("pass");

        when(userRepository.existsByEmail("duplicate@example.com")).thenReturn(true);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> authService.register(req));
        assertEquals("Email already registered", ex.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    void testLoginInitiateVerified_sendsLoginOtp_noJwt() {
        LoginRequest req = new LoginRequest();
        req.setEmail("alice@example.com");
        req.setPassword("password123");

        User user = User.builder()
                .id("user-id-1")
                .name("Alice")
                .email("alice@example.com")
                .passwordHash("hashed")
                .role(User.Role.USER)
                .notificationsEnabled(true)
                .notificationFrequency(User.NotificationFrequency.SINGLE)
                .emailVerified(true)
                .build();

        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "hashed")).thenReturn(true);

        AuthResponse res = authService.loginInitiate(req);

        assertNotNull(res);
        assertNull(res.getToken());
        assertEquals("Alice", res.getName());
        assertTrue(res.isEmailVerified());
        verify(otpService, times(1)).sendLoginOtp(user);
        verify(otpService, never()).generateAndSend(any());
    }

    @Test
    void testLoginInitiateUnverified_resendsRegistrationOtp() {
        LoginRequest req = new LoginRequest();
        req.setEmail("bob@example.com");
        req.setPassword("password123");

        User user = User.builder()
                .id("uid")
                .email("bob@example.com")
                .passwordHash("hashed")
                .role(User.Role.USER)
                .emailVerified(false)
                .build();

        when(userRepository.findByEmail("bob@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "hashed")).thenReturn(true);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> authService.loginInitiate(req));
        assertEquals("EMAIL_NOT_VERIFIED", ex.getMessage());
        verify(otpService, times(1)).generateAndSend(user);
        verify(otpService, never()).sendLoginOtp(any());
    }

    @Test
    void testLoginComplete_returnsJwt() {
        User user = User.builder()
                .id("uid")
                .email("alice@example.com")
                .name("Alice")
                .passwordHash("h")
                .role(User.Role.USER)
                .emailVerified(true)
                .notificationsEnabled(true)
                .notificationFrequency(User.NotificationFrequency.SINGLE)
                .build();

        when(otpService.verifyLoginOtp("alice@example.com", "123456")).thenReturn(user);
        when(jwtUtil.generateToken("uid", "USER")).thenReturn("jwt-token");

        AuthResponse res = authService.loginComplete("alice@example.com", "123456");

        assertEquals("jwt-token", res.getToken());
        assertEquals("user", res.getRole());
        assertEquals("Alice", res.getName());
    }

    @Test
    void testLoginWrongPassword() {
        LoginRequest req = new LoginRequest();
        req.setEmail("alice@example.com");
        req.setPassword("wrong");

        User user = User.builder()
                .id("uid")
                .email("alice@example.com")
                .passwordHash("hashed")
                .role(User.Role.USER)
                .emailVerified(true)
                .build();

        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "hashed")).thenReturn(false);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> authService.loginInitiate(req));
        assertEquals("Invalid email or password", ex.getMessage());
    }

    @Test
    void testLoginUserNotFound() {
        LoginRequest req = new LoginRequest();
        req.setEmail("ghost@example.com");
        req.setPassword("pass");

        when(userRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> authService.loginInitiate(req));
    }

    @Test
    void testUpdateNotificationPreferencesInvalidFrequency() {
        User user = User.builder()
                .id("uid1")
                .email("test@example.com")
                .role(User.Role.USER)
                .notificationsEnabled(true)
                .notificationFrequency(User.NotificationFrequency.SINGLE)
                .build();

        when(userRepository.findById("uid1")).thenReturn(Optional.of(user));

        assertThrows(IllegalArgumentException.class,
                () -> authService.updateNotificationPreferences("uid1", true, "INVALID_FREQ"));
    }
}

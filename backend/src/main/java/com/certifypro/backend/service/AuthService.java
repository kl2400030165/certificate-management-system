package com.certifypro.backend.service;

import com.certifypro.backend.dto.AuthResponse;
import com.certifypro.backend.dto.LoginRequest;
import com.certifypro.backend.dto.RegisterRequest;
import com.certifypro.backend.model.User;
import com.certifypro.backend.repository.UserRepository;
import com.certifypro.backend.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Locale;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;
    private final OtpService otpService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil, EmailService emailService, OtpService otpService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.emailService = emailService;
        this.otpService = otpService;
    }

    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException("Email already registered");
        }

        User user = User.builder()
                .name(request.getName())
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.USER)
                .emailVerified(false)
                .build();

        userRepository.save(user);
        otpService.generateAndSend(user);

        return buildAuthResponse(null, user);
    }

    public AuthResponse login(LoginRequest request) {
        return loginInitiate(request);
    }

    public AuthResponse loginInitiate(LoginRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordMatchesOrLegacyUpgrade(user, request.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        if (user.isEmailVerified()) {
            otpService.sendLoginOtp(user);
            return buildAuthResponse(null, user);
        }

        otpService.generateAndSend(user);
        throw new IllegalArgumentException("EMAIL_NOT_VERIFIED");
    }

    public AuthResponse loginComplete(String email, String code) {
        User user = otpService.verifyLoginOtp(normalizeEmail(email), code);
        String token = jwtUtil.generateToken(user.getId(), user.getRole().name());
        return buildAuthResponse(token, user);
    }

    public AuthResponse verifyOtp(String email, String code) {
        User user = otpService.verifyRegistrationOrLoginOtp(normalizeEmail(email), code);
        String token = jwtUtil.generateToken(user.getId(), user.getRole().name());
        return buildAuthResponse(token, user);
    }

    public void resendOtp(String email) {
        otpService.resendOtpSmart(normalizeEmail(email));
    }

    public AuthResponse getMe(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        String token = jwtUtil.generateToken(user.getId(), user.getRole().name());
        return buildAuthResponse(token, user);
    }

    public AuthResponse updateNotificationPreferences(String userId, Boolean enabled, String frequency) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (enabled != null) {
            user.setNotificationsEnabled(enabled);
        }

        if (frequency != null && !frequency.isBlank()) {
            try {
                User.NotificationFrequency parsed = User.NotificationFrequency.valueOf(frequency.trim().toUpperCase());
                user.setNotificationFrequency(parsed);
            } catch (IllegalArgumentException ex) {
                throw new IllegalArgumentException("Invalid notification frequency. Use 'single' or 'weekly'.");
            }
        }

        userRepository.save(user);
        String token = jwtUtil.generateToken(user.getId(), user.getRole().name());
        return buildAuthResponse(token, user);
    }

    private AuthResponse buildAuthResponse(String token, User user) {
        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name().toLowerCase())
            .emailVerified(user.isEmailVerified())
                .notificationsEnabled(user.isNotificationsEnabled())
                .notificationFrequency(user.getNotificationFrequency().name().toLowerCase())
                .build();
    }

    private String normalizeEmail(String email) {
        if (email == null) {
            return null;
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private boolean passwordMatchesOrLegacyUpgrade(User user, String rawPassword) {
        String stored = user.getPasswordHash();
        if (stored == null || stored.isBlank() || rawPassword == null) {
            return false;
        }

        if (passwordEncoder.matches(rawPassword, stored)) {
            return true;
        }

        // Backward compatibility: migrate any legacy plain-text password on first successful login.
        boolean looksBcrypt = stored.startsWith("$2a$") || stored.startsWith("$2b$") || stored.startsWith("$2y$");
        if (!looksBcrypt && stored.equals(rawPassword)) {
            user.setPasswordHash(passwordEncoder.encode(rawPassword));
            userRepository.save(user);
            return true;
        }

        return false;
    }
}

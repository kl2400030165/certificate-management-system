package com.certifypro.backend.service;

import com.certifypro.backend.dto.AuthResponse;
import com.certifypro.backend.dto.LoginRequest;
import com.certifypro.backend.dto.RegisterRequest;
import com.certifypro.backend.model.User;
import com.certifypro.backend.repository.UserRepository;
import com.certifypro.backend.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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

    /** Step 1 of register — creates user, sends verification OTP. No JWT returned yet. */
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.USER)
                .emailVerified(false)
                .build();

        userRepository.save(user);
        otpService.generateAndSend(user);

        return AuthResponse.builder()
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name().toLowerCase())
                .emailVerified(false)
                .notificationsEnabled(user.isNotificationsEnabled())
                .notificationFrequency(user.getNotificationFrequency().name().toLowerCase())
                .build();
    }

    /**
     * Step 1 of login — validates credentials, sends login OTP to verified users.
     * Returns { step="otp_sent" } — no JWT yet.
     */
    public AuthResponse loginInitiate(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        if (!user.isEmailVerified()) {
            // Resend email verification OTP and tell frontend
            otpService.generateAndSend(user);
            throw new IllegalArgumentException("EMAIL_NOT_VERIFIED");
        }

        // Credentials OK — send login OTP
        otpService.sendLoginOtp(user);

        return AuthResponse.builder()
                .email(user.getEmail())
                .name(user.getName())
                .emailVerified(true)
                .build();
    }

    /**
     * Step 2 of login — verifies login OTP, returns JWT.
     */
    public AuthResponse loginComplete(String email, String otp) {
        User user = otpService.verifyLoginOtp(email, otp);
        String token = jwtUtil.generateToken(user.getId(), user.getRole().name());
        return buildAuthResponse(token, user);
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

        if (enabled != null) user.setNotificationsEnabled(enabled);

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
}

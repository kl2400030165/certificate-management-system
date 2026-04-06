package com.certifypro.backend.service;

import com.certifypro.backend.model.User;
import com.certifypro.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
public class OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpService.class);
    private static final int OTP_LENGTH = 6;
    private static final int OTP_EXPIRY_MINUTES = 10;

    private final UserRepository userRepository;
    private final EmailService emailService;

    public OtpService(UserRepository userRepository, EmailService emailService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    /**
     * Generates a new 6-digit OTP, persists it on the user, and sends an email.
     */
    public void generateAndSend(User user) {
        String otp = generateOtp();
        user.setOtpCode(otp);
        user.setOtpExpiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));
        userRepository.save(user);
        emailService.sendOtpEmail(user, otp);
        log.info("🔑 OTP generated for {} (expires in {} min)", user.getEmail(), OTP_EXPIRY_MINUTES);
    }

    /**
     * Verifies OTP for either flow: registration (unverified email) or login 2FA (verified email).
     * Avoids "Email is already verified" when the client uses the registration verify endpoint
     * after sign-in (e.g. lost {@code mode=login} query param).
     */
    public User verifyRegistrationOrLoginOtp(String email, String code) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (user.isEmailVerified()) {
            return verifyLoginOtp(email, code);
        }
        return verifyOtp(email, code);
    }

    /**
     * Resend OTP: registration OTP if email not verified, otherwise login 2FA OTP.
     */
    public void resendOtpSmart(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (user.isEmailVerified()) {
            resendLoginOtp(email);
        } else {
            resendOtp(email);
        }
    }

    /**
     * Validates the OTP for the given email (registration verification).
     * On success, marks emailVerified=true and clears OTP fields.
     *
     * @return the verified User on success
     * @throws IllegalArgumentException on invalid/expired OTP
     */
    public User verifyOtp(String email, String code) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.isEmailVerified()) {
            throw new IllegalArgumentException("Email is already verified");
        }

        if (!user.isOtpValid(code)) {
            throw new IllegalArgumentException("Invalid or expired OTP. Please request a new one.");
        }

        user.setEmailVerified(true);
        user.setOtpCode(null);
        user.setOtpExpiresAt(null);
        userRepository.save(user);

        // Send welcome email after successful registration verification
        emailService.sendWelcomeEmail(user);

        log.info("✅ Email verified for {}", email);
        return user;
    }

    /**
     * Resends OTP — only allowed for unverified users.
     */
    public void resendOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.isEmailVerified()) {
            throw new IllegalArgumentException("Email is already verified");
        }

        generateAndSend(user);
    }

    /**
     * Sends a 2FA OTP to a verified user for login.
     */
    public void sendLoginOtp(User user) {
        generateAndSend(user);
    }

    /**
     * Resends a login 2FA OTP to a verified user.
     * Unlike resendOtp(), this does NOT require the user to be unverified.
     */
    public void resendLoginOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!user.isEmailVerified()) {
            throw new IllegalArgumentException("Email not verified. Please complete registration first.");
        }

        generateAndSend(user);
        log.info("🔄 Login OTP resent for {}", email);
    }

    /**
     * Verifies a login 2FA OTP — does NOT touch emailVerified flag.
     *
     * @return verified User
     */
    public User verifyLoginOtp(String email, String code) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!user.isOtpValid(code)) {
            throw new IllegalArgumentException("Invalid or expired OTP. Please request a new one.");
        }

        user.setOtpCode(null);
        user.setOtpExpiresAt(null);
        userRepository.save(user);

        log.info("✅ Login OTP verified for {}", email);
        return user;
    }

    // ── helpers ─────────────────────────────────────────────────────────────

    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        int num = random.nextInt(900000) + 100000; // always 6 digits
        return String.valueOf(num);
    }
}

package com.certifypro.backend.controller;

import com.certifypro.backend.dto.AuthResponse;
import com.certifypro.backend.dto.LoginRequest;
import com.certifypro.backend.dto.NotificationPreferencesRequest;
import com.certifypro.backend.dto.RegisterRequest;
import com.certifypro.backend.model.User;
import com.certifypro.backend.security.JwtUtil;
import com.certifypro.backend.service.AuthService;
import com.certifypro.backend.service.OtpService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final OtpService otpService;
    private final JwtUtil jwtUtil;

    public AuthController(AuthService authService, OtpService otpService, JwtUtil jwtUtil) {
        this.authService = authService;
        this.otpService = otpService;
        this.jwtUtil = jwtUtil;
    }

    // ── Register ─────────────────────────────────────────────────────────────

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── Email OTP verification (after register) ───────────────────────────────

    /** POST /api/auth/verify-otp  body: { email, otp } */
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String otp   = body.get("otp");
        if (email == null || otp == null)
            return ResponseEntity.badRequest().body(Map.of("message", "email and otp are required"));
        try {
            User user = otpService.verifyRegistrationOrLoginOtp(email, otp);
            String token = jwtUtil.generateToken(user.getId(), user.getRole().name());
            AuthResponse response = AuthResponse.builder()
                    .token(token)
                    .userId(user.getId())
                    .name(user.getName())
                    .email(user.getEmail())
                    .role(user.getRole().name().toLowerCase())
                    .emailVerified(true)
                    .notificationsEnabled(user.isNotificationsEnabled())
                    .notificationFrequency(user.getNotificationFrequency().name().toLowerCase())
                    .build();
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /** POST /api/auth/resend-otp  body: { email } */
    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "email is required"));
        try {
            otpService.resendOtpSmart(email);
            return ResponseEntity.ok(Map.of("message", "OTP resent successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── Login — 2-step ────────────────────────────────────────────────────────

    /**
     * Step 1: validate credentials → sends login OTP to email.
     * Returns 202 Accepted with { step, email, message } — no JWT yet.
     */
    @PostMapping("/login")
    public ResponseEntity<?> loginInitiate(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.loginInitiate(request);
            return ResponseEntity.accepted().body(
                    Map.of("step", "otp_sent",
                           "email", response.getEmail(),
                           "message", "OTP sent to your email")
            );
        } catch (IllegalArgumentException e) {
            if ("EMAIL_NOT_VERIFIED".equals(e.getMessage())) {
                return ResponseEntity.status(403).body(
                        Map.of("message", "EMAIL_NOT_VERIFIED",
                               "detail", "Please verify your email. A new OTP has been sent."));
            }
            return ResponseEntity.status(401).body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Step 2: verify login OTP → returns JWT.
     * Body: { email, otp }
     */
    @PostMapping("/verify-login-otp")
    public ResponseEntity<?> verifyLoginOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String otp   = body.get("otp");
        if (email == null || otp == null)
            return ResponseEntity.badRequest().body(Map.of("message", "email and otp are required"));
        try {
            AuthResponse response = authService.loginComplete(email, otp);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Resend login OTP for already-verified users (2FA re-send).
     * Body: { email }
     */
    @PostMapping("/resend-login-otp")
    public ResponseEntity<?> resendLoginOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "email is required"));
        try {
            otpService.resendLoginOtp(email);
            return ResponseEntity.ok(Map.of("message", "Login OTP resent successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── Me + Preferences ─────────────────────────────────────────────────────

    @GetMapping("/me")
    public ResponseEntity<?> getMe(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null)
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        return ResponseEntity.ok(authService.getMe(userDetails.getUsername()));
    }

    @PutMapping("/preferences/notifications")
    public ResponseEntity<?> updateNotificationPreferences(@AuthenticationPrincipal UserDetails userDetails,
                                                           @RequestBody NotificationPreferencesRequest request) {
        if (userDetails == null)
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        try {
            AuthResponse response = authService.updateNotificationPreferences(
                    userDetails.getUsername(),
                    request.getNotificationsEnabled(),
                    request.getNotificationFrequency()
            );
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}

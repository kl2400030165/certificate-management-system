package com.certifypro.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.util.Map;

@Service
public class RecaptchaService {

    private static final Logger log = LoggerFactory.getLogger(RecaptchaService.class);
    private static final String VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

    @Value("${recaptcha.secret:6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WiLNAA}")
    private String secretKey;

    @Value("${recaptcha.enabled:true}")
    private boolean enabled;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Validates a reCAPTCHA v2 token from the frontend.
     * Throws IllegalArgumentException if invalid.
     */
    public void validate(String token) {
        if (!enabled) {
            log.debug("🤖 reCAPTCHA disabled — skipping validation");
            return;
        }

        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("reCAPTCHA token is missing. Please complete the CAPTCHA.");
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("secret", secretKey);
            params.add("response", token);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(VERIFY_URL, request, Map.class);

            Map<?, ?> body = response.getBody();
            Boolean success = body != null && Boolean.TRUE.equals(body.get("success"));

            if (!success) {
                log.warn("⚠️ reCAPTCHA verification failed: {}", body);
                throw new IllegalArgumentException("CAPTCHA verification failed. Please try again.");
            }

            log.debug("✅ reCAPTCHA passed");
        } catch (IllegalArgumentException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("❌ reCAPTCHA service error: {}", ex.getMessage());
            // Fail open — don't block legitimate users on network errors
            log.warn("⚠️ Allowing request despite reCAPTCHA service error");
        }
    }
}

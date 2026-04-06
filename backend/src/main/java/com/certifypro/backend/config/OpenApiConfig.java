package com.certifypro.backend.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI certifyProOpenAPI() {
        final String bearer = "bearer-jwt";
        return new OpenAPI()
                .info(new Info()
                        .title("CertifyPro API")
                        .description("""
                                REST API for certification lifecycle management: secure OTP auth, \
                                certificate CRUD with file uploads, expiry tracking, and admin workflows. \
                                Use **Authorize** below with `Bearer <token>` after login or OTP verification.
                                """)
                        .version("1.0.0")
                        .contact(new Contact().name("CertifyPro")))
                .addSecurityItem(new SecurityRequirement().addList(bearer))
                .components(new Components()
                        .addSecuritySchemes(bearer,
                                new SecurityScheme()
                                        .name(bearer)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("JWT from POST /api/auth/verify-otp or /api/auth/verify-login-otp")));
    }
}

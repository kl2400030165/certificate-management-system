# CertifyPro Backend

Spring Boot REST API for CertifyPro certificate management.

## Prerequisites
- Java 17+
- Maven 3.8+
- MySQL 8+ (database: `certifypro`)

## Quick Start
1. From the `backend` folder, copy env file:
   - Windows PowerShell: `Copy-Item .env.example .env`
   - macOS/Linux: `cp .env.example .env`
2. Update `.env` with your MySQL password and a strong `JWT_SECRET`.
3. Run API:
   - `mvn spring-boot:run`

API runs on `http://localhost:8080`.

## Useful URLs
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- Health: `http://localhost:8080/actuator/health`

## Auth Flow
- `POST /api/auth/register`: Create account, sends OTP email.
- `POST /api/auth/login`: Validates password, sends OTP email.
- `POST /api/auth/verify-otp`: Verifies OTP and returns JWT.
- `POST /api/auth/resend-otp`: Resend OTP.
- `GET /api/auth/me`: Current user from JWT.

## Main Endpoints
- User certs: `/api/certs` (CRUD)
- Admin certs/stats/renewals: `/api/admin/*`
- Reminder jobs: `/api/admin/reminders/*`

## Environment Variables
See `.env.example`.

Important:
- Set `EMAIL_MOCK=true` for local dev if you do not want real SMTP sends.
- Set `ADMIN_SEED_ENABLED=true` to auto-seed admin and sample data.

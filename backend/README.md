# CertifyPro Backend — Spring Boot + MySQL

REST API backend for the CertifyPro Certificate Management System.

## ⚡ Quick Start

### Prerequisites
- Java 21+
- Maven 3.9+
- MySQL running locally (default: `localhost:3306`, database: `certifypro`)

**Secrets:** Do not put real passwords in `application.properties`. Set `MYSQL_PASSWORD`, `JWT_SECRET`, and mail variables in your environment (see `.env.example`). For local dev, use `EMAIL_MOCK=true` so OTPs appear in the server log.

**API docs:** With the server running, open [Swagger UI](http://localhost:8080/swagger-ui.html) (JWT: Authorize with `Bearer <token>` after OTP verification).

### 1. Clone & Setup

```bash
cd backend
cp .env.example .env
```

### 2. Run the Backend

```bash
mvn spring-boot:run
```

Server starts on `http://localhost:8080`

Admin and demo users are **not** created unless you enable seeding:

```bash
export ADMIN_SEED_ENABLED=true
```

Defaults are `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env.example` (change them before enabling in production).

### 3. Run the Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## 📁 Project Structure

```
backend/src/main/java/com/certifypro/backend/
├── CertifyProApplication.java     # Entry point (@EnableScheduling)
├── config/
│   ├── SecurityConfig.java        # Spring Security + CORS + JWT
│   ├── DataSeeder.java            # Seeds admin account on startup
│   └── WebConfig.java             # Serves /uploads/** as static files
├── controller/
│   ├── AuthController.java        # POST /api/auth/login, register, GET /me
│   ├── CertificationController.java  # CRUD /api/certs
│   └── AdminController.java       # /api/admin/** (admin only)
├── dto/
│   ├── RegisterRequest.java
│   ├── LoginRequest.java
│   ├── AuthResponse.java          # { token, userId, name, email, role }
│   ├── CertRequest.java
│   └── CertResponse.java          # Includes computed status, daysLeft
├── exception/
│   └── GlobalExceptionHandler.java  # Clean JSON error responses
├── model/
│   ├── User.java                  # JPA entity
│   └── Certification.java         # JPA entity
├── repository/
│   ├── UserRepository.java
│   └── CertificationRepository.java
├── scheduler/
│   └── ExpiryReminderScheduler.java  # Daily 8AM cron job
├── security/
│   ├── JwtUtil.java               # Generate + validate JWT
│   ├── JwtFilter.java             # Reads Bearer token on each request
│   └── UserDetailsServiceImpl.java
├── service/
│   ├── AuthService.java           # register, login, getMe
│   ├── CertificationService.java  # CRUD + file upload
│   ├── AdminService.java          # Admin operations
│   └── EmailService.java          # Mock (logs) or real SMTP emails
└── util/
    └── CertUtils.java             # getCertStatus, getDaysUntilExpiry
```

---

## 🔗 API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user (protected) |

### Certifications (`/api/certs`) — User
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/certs` | Get my certifications |
| POST | `/api/certs` | Add certification (multipart) |
| GET | `/api/certs/{id}` | Get single cert |
| PUT | `/api/certs/{id}` | Update certification |
| DELETE | `/api/certs/{id}` | Delete certification |

### Admin (`/api/admin`) — Admin only
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/certs` | All certifications |
| GET | `/api/admin/certs/expiring?filter=expired\|30days` | Expiring/expired |
| GET | `/api/admin/stats` | Dashboard statistics |
| PUT | `/api/admin/certs/{id}/renew` | Approve renewal |
| POST | `/api/admin/certs/{id}/notify` | Send email notification |
| GET | `/api/admin/users` | All registered users |

---

## 🔧 Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `MYSQL_URL` | `jdbc:mysql://localhost:3306/certifypro?...` | MySQL JDBC URL |
| `MYSQL_USER` | `root` | MySQL username |
| `MYSQL_PASSWORD` | (empty) | MySQL password |
| `JWT_SECRET` | (placeholder) | Change in production! |
| `JWT_EXPIRATION` | `604800000` (7 days in ms) | Token expiry |
| `EMAIL_MOCK` | `true` | Set to `false` for real emails |
| `EMAIL_USER` | `your@gmail.com` | Gmail address |
| `EMAIL_PASS` | `your-app-password` | Gmail App Password |
| `CLIENT_URL` | `http://localhost:5173` | Frontend URL for CORS |
| `ADMIN_EMAIL` | `admin@certify.com` | Seeded admin email |
| `ADMIN_PASSWORD` | `admin123` | Seeded admin password |

---

## 🚀 Deployment (Render.com)

1. Push this `backend/` folder to a separate GitHub repo (`certifypro-backend`)
2. Create a new **Web Service** on [Render.com](https://render.com)
3. Set **Build Command:** `mvn clean package -DskipTests`
4. Set **Start Command:** `java -jar target/certifypro-backend-1.0.0.jar`
5. Add all environment variables from `.env.example` in the Render dashboard
6. Set `MYSQL_URL`, `MYSQL_USER`, and `MYSQL_PASSWORD` to your production MySQL values

---

## 📧 Enabling Real Emails

1. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Generate an App Password for "Mail"
3. In `.env`, set:
   ```
   EMAIL_MOCK=false
   EMAIL_USER=your@gmail.com
   EMAIL_PASS=your-16-char-app-password
   ```

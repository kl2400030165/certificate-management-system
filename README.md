# CertifyPro

A full-stack **certification management** platform: track expiries, upload proof files, email OTP authentication, role-based admin tools, career roadmap insights, and a polished light/dark UI.

| Layer | Stack |
|--------|--------|
| **Frontend** | React 18, Vite, React Router, Axios |
| **Backend** | Spring Boot 3, Spring Security + JWT, JPA, MySQL |
| **Docs** | OpenAPI 3 — Swagger UI at [`/swagger-ui.html`](http://localhost:8080/swagger-ui.html) when the API is running |

## Features

- **Security**: Email OTP for registration and login; JWT sessions; bcrypt passwords; no secrets committed in `application.properties`.
- **User**: Dashboard, certifications CRUD, PDF/image uploads, calendar view, notification preferences, profile, AI-style certification roadmap.
- **Admin**: All certs, expiring list, renewal workflow, user list, reminder jobs.
- **UX**: Dark mode, responsive layout, skip link, focus styles, React error boundary, branded favicon.

## Quick start

### 1. Database

Create a MySQL database named `certifypro` (or set `MYSQL_URL`).

### 2. Backend

```bash
cd backend
# Set at least MYSQL_PASSWORD and JWT_SECRET in your environment (see backend/.env.example)
export MYSQL_PASSWORD=yourpassword
export JWT_SECRET=your-very-long-random-secret-at-least-32-chars
export EMAIL_MOCK=true
mvn spring-boot:run
```

- API: **http://localhost:8080**
- Health: **http://localhost:8080/actuator/health**
- Swagger: **http://localhost:8080/swagger-ui.html**

Optional demo data (admin + sample users and certificates):

```bash
export ADMIN_SEED_ENABLED=true
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

App: **http://localhost:5173** (Vite may use port 3000 if configured).

Set `VITE_API_URL` in `.env` if the API is not on `http://localhost:8080`.

## Scripts

| Location | Command | Purpose |
|----------|---------|---------|
| `frontend/` | `npm run dev` | Dev server |
| `frontend/` | `npm run build` | Production bundle |
| `frontend/` | `npm run lint` | ESLint |
| `backend/` | `mvn test` | JUnit tests |
| `backend/` | `mvn spring-boot:run` | Run API |

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs backend `mvn verify` and frontend lint, tests, and build on push/PR.

## Repository layout

```
backend/    Spring Boot API, OpenAPI, tests
frontend/   Vite + React SPA
```

More detail: `backend/README.md`, `frontend/README.md`.

## License

Use and modify for learning and portfolio projects; add a license file if you open-source the repo.

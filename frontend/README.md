# CertifyPro Frontend

React + Vite frontend for CertifyPro.

## Prerequisites
- Node.js 18+
- npm 9+

## Quick Start
1. From the `frontend` folder, copy env file:
   - Windows PowerShell: `Copy-Item .env.example .env`
   - macOS/Linux: `cp .env.example .env`
2. Ensure `VITE_API_URL` points to backend API (default `http://localhost:8080`).
3. Install and run:
   - `npm install`
   - `npm run dev`

Frontend runs on `http://localhost:5173` by default.

## Scripts
- `npm run dev`: Start dev server
- `npm run build`: Production build
- `npm run preview`: Preview production build
- `npm run lint`: ESLint

## Features
- User dashboard and certification CRUD
- Certificate file upload and detail view
- Expiry calendar and notification preferences
- Admin dashboard, expiring certs, renewal management
- OTP-based authentication flow

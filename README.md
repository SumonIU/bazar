# Bazar.com

Local bazar marketplace with a Next.js frontend and AdonisJS backend.

## Tech Stack

- Frontend: Next.js (React + TypeScript + Tailwind)
- Backend: AdonisJS (TypeScript)
- Database: MySQL
- Auth: Session-based email + password / phone + password
- Payments: bKash, Nagad, Rocket, Card (planned integration)

## Project Structure

- frontend/ - Next.js app
- backend/ - AdonisJS API

## Run Locally

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
node ace migration:run
npm run dev
```

## Environment Variables

Backend values are in backend/.env and backend/.env.example. Update MySQL credentials and database name before running migrations.

## Notes

- Auth is session-based; no JWT or OTP.
- The backend exposes REST endpoints under /api.
- Frontend pages are scaffolded for landing, auth, seller dashboard, search, cart, product, seller, admin, and order history.

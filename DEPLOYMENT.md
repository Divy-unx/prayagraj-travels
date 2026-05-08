# Prayagraj Travels — Deployment Guide

Everything needed to run this project in development (Docker Compose) and deploy it to production (Render + Vercel / any cloud).

---

## Table of Contents

1. [Environment Files Overview](#1-environment-files-overview)
2. [Local Development (Docker Compose)](#2-local-development-docker-compose)
3. [Google OAuth Setup](#3-google-oauth-setup)
4. [Gmail SMTP Setup](#4-gmail-smtp-setup)
5. [Generating a Secure JWT Secret](#5-generating-a-secure-jwt-secret)
6. [Production — Backend (Render)](#6-production--backend-render)
7. [Production — Frontend (Vercel)](#7-production--frontend-vercel)
8. [Production — Database & Redis](#8-production--database--redis)
9. [Security Checklist](#9-security-checklist)

---

## 1. Environment Files Overview

| File | Purpose | Committed? |
|------|---------|-----------|
| `.env` | Docker Compose vars (MySQL, Vite build args) | **No** |
| `.env.example` | Safe template for root `.env` | **Yes** |
| `backend/.env` | Backend runtime secrets | **No** |
| `backend/.env.example` | Safe template for backend `.env` | **Yes** |
| `frontend-react/.env` | Frontend dev vars | **No** |
| `frontend-react/.env.example` | Safe template for frontend `.env` | **Yes** |
| `frontend-react/.env.production` | Frontend prod vars (use platform env vars instead) | **No** |

**Rule:** Only `*.env.example` files are committed. All others are git-ignored.

---

## 2. Local Development (Docker Compose)

### Step 1 — Copy env templates

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend-react/.env.example frontend-react/.env
```

### Step 2 — Fill in `backend/.env`

Required values you must set:

```env
JWT_SECRET=<run: openssl rand -hex 32>
MAIL_USERNAME=your_gmail@gmail.com
MAIL_PASSWORD=your_16char_app_password
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
```

Leave DB/Redis as-is for Docker — the `docker-compose.yml` overrides `DB_HOST` and `REDIS_HOST` to the container service names.

### Step 3 — Fill in root `.env`

```env
MYSQL_ROOT_PASSWORD=choose_a_strong_password
MYSQL_DATABASE=prayagraj_bus
VITE_API_BASE_URL=http://localhost:8081
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

> The `MYSQL_ROOT_PASSWORD` in root `.env` and `DB_PASSWORD` in `backend/.env` must match.

### Step 4 — Start everything

```bash
# First run or after schema changes — wipe volumes for clean DB:
docker compose down -v && docker compose up --build

# Normal restart (keeps data):
docker compose up --build
```

### Step 5 — Verify

- Frontend: http://localhost:3000
- Backend health: http://localhost:8081/api/travels/health

---

## 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
2. Create or select an OAuth 2.0 Client ID (Web application type)
3. Add **Authorized JavaScript origins**:
   - `http://localhost:3000` (local dev)
   - `https://your-app.vercel.app` (production)
4. Add **Authorized redirect URIs**:
   - `http://localhost:3000` (local dev)
   - `https://your-app.vercel.app` (production)
5. Copy the **Client ID** → set as `GOOGLE_CLIENT_ID` (backend + frontend)
6. Copy the **Client Secret** → set as `GOOGLE_CLIENT_SECRET` (backend only)

> The backend validates the Google ID token audience against `GOOGLE_CLIENT_ID`. If this mismatches, Google login will return a 401.

---

## 4. Gmail SMTP Setup

App Passwords are required (not your account password):

1. Enable 2-Step Verification on the Gmail account
2. Go to: Google Account → Security → 2-Step Verification → App Passwords
3. Create a new App Password (choose "Mail" + "Other")
4. Copy the 16-character password → set as `MAIL_PASSWORD` in `backend/.env`
5. Set `MAIL_USERNAME` to the Gmail address

> If you see `535-5.7.8 Username and Password not accepted`, the password has quotes or spaces — remove them from the `.env` value.

---

## 5. Generating a Secure JWT Secret

```bash
# Linux / macOS / Git Bash on Windows:
openssl rand -hex 32

# PowerShell alternative:
[System.Convert]::ToBase64String((1..32 | % { [byte](Get-Random -Max 256) }))
```

The output (64 hex chars) is your `JWT_SECRET`. The app will **refuse to start** if this variable is missing — by design.

---

## 6. Production — Backend (Render)

### Build & Start commands

| Setting | Value |
|---------|-------|
| Runtime | Docker |
| Dockerfile path | `backend/Dockerfile` |
| Port | `8081` |

### Environment Variables (set in Render dashboard)

```
PORT=8081
DB_HOST=<Render internal hostname or external MySQL URL>
DB_PORT=3306
DB_NAME=prayagraj_bus
DB_USERNAME=<prod db user>
DB_PASSWORD=<prod db password>
REDIS_HOST=<Upstash or Redis Cloud hostname>
REDIS_PORT=6379
REDIS_USERNAME=<redis username if required>
REDIS_PASSWORD=<redis password>
ALLOWED_ORIGINS=https://your-app.vercel.app
JWT_SECRET=<64-char hex from openssl rand -hex 32>
JWT_ACCESS_EXPIRY_MINUTES=15
JWT_REFRESH_EXPIRY_DAYS=7
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_gmail@gmail.com
MAIL_PASSWORD=your_app_password
FRONTEND_URL=https://your-app.vercel.app
APP_BASE_URL=https://your-backend.onrender.com
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
ADMIN_EMAILS=admin@your-domain.com
```

> **CORS**: `ALLOWED_ORIGINS` must exactly match your Vercel frontend URL (no trailing slash). Multiple origins: `https://app.vercel.app,https://custom-domain.com`

---

## 7. Production — Frontend (Vercel)

### Automatic (Vercel Git Integration)

1. Connect your GitHub repo to Vercel
2. Set **Framework Preset** to Vite
3. Set **Root Directory** to `frontend-react`
4. Add environment variables in Vercel dashboard:

```
VITE_API_BASE_URL=https://your-backend.onrender.com
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

> Vercel environment variables are baked into the Vite bundle at build time — set them in the Vercel dashboard, not in files.

### Manual Docker build for production

```bash
docker build \
  --build-arg VITE_API_BASE_URL=https://your-backend.onrender.com \
  --build-arg VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com \
  -t prayagraj-frontend \
  ./frontend-react
```

---

## 8. Production — Database & Redis

### MySQL

Recommended: **PlanetScale** (serverless MySQL) or **Aiven for MySQL**
- Use the provided connection string parts for `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`
- Enable SSL: add `?useSSL=true&requireSSL=true` to `spring.datasource.url` in `application.properties` (override `useSSL=false`)

### Redis

Recommended: **Upstash** (serverless Redis with free tier)
- Copy the Redis host, port, username, password from the Upstash dashboard
- Set `REDIS_USERNAME` and `REDIS_PASSWORD` accordingly

---

## 9. Security Checklist

Before going live, verify each item:

- [ ] `JWT_SECRET` is 32+ random characters — not the dev placeholder
- [ ] `DB_PASSWORD` is strong — not `root`
- [ ] Gmail App Password is used — not your account password
- [ ] `ALLOWED_ORIGINS` lists only your actual frontend domain — no wildcards
- [ ] Google OAuth has your production domain in Authorized JavaScript origins
- [ ] Backend is behind HTTPS in production (Render provides this automatically)
- [ ] Frontend is behind HTTPS (Vercel provides this automatically)
- [ ] No `.env` files are committed to git (`git status` should not show them)
- [ ] `MYSQL_ROOT_PASSWORD` in root `.env` matches `DB_PASSWORD` in `backend/.env`
- [ ] `FRONTEND_URL` in `backend/.env` matches actual deployed frontend URL (used in email "Start Booking" button)
- [ ] `VITE_API_BASE_URL` in frontend env matches actual deployed backend URL
- [ ] `APP_BASE_URL` in `backend/.env` matches actual deployed backend URL

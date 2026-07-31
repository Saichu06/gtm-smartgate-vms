# GTM Smart Gate — System Architecture

## Platform Architecture Overview

GTM Smart Gate is a **multi-tenant SaaS Visitor Management System (VMS)** with a strict 3-tier architecture:

```
┌────────────────────────────────────────────────────────┐
│               FRONTEND (React 19 + Vite)               │
│    Super Admin Portal  │  Customer Corp Admin Portal    │
└─────────────────────────┬──────────────────────────────┘
                          │ REST API (Axios + Interceptors)
┌─────────────────────────▼──────────────────────────────┐
│            BACKEND API GATEWAY (Node + Express)         │
│   Auth Middleware  │  RBAC  │  Route Handlers           │
│   Services (Business Logic)  │  Repositories (DB Layer) │
└─────────────────────────┬──────────────────────────────┘
                          │ PostgreSQL pg Pool
┌─────────────────────────▼──────────────────────────────┐
│              DATABASE  (PostgreSQL 15+)                 │
│    Row-Level Multi-Tenancy  │  UUID PKs                 │
│    Audit Log  │  Sessions  │  Visitors  │  OTP Tokens   │
└────────────────────────────────────────────────────────┘
```

## Folder Structure Principle

Each service layer is intentionally separated:
- `controllers/` — HTTP request parsing, parameter extraction, response formatting
- `services/`    — Business logic, validations, cross-entity operations
- `repositories/` — Raw database queries only, no business rules

## Security Architecture

| Concern             | Implementation (Planned)            |
|---------------------|-------------------------------------|
| Authentication      | JWT Access Token + Refresh Token   |
| Multi-Factor Auth   | TOTP (Google Authenticator)        |
| API Security        | Helmet.js + CORS per-origin policy |
| Password Hashing    | bcrypt with salt rounds: 12        |
| Secrets Management  | Environment Variables via .env     |
| Audit Trail         | Immutable `audit_logs` table       |
| Rate Limiting       | express-rate-limit per IP          |

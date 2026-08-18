# GTM Smart Gate — Project Setup & Execution Guide

This document provides a complete guide on how to configure, run, test, and build the **GTM Smart Gate / Visitor Management System (VMS)** project, including the dual API architecture (`/api/v1/*` and `/master/*`) connected to a PostgreSQL database.

---

## 1. Architecture Overview

```
                                  +-----------------------------+
                                  |     Client / Frontend       |
                                  |     (Vite + React, :3000)   |
                                  +--------------+--------------+
                                                 |
                                                 v
                                  +-----------------------------+
                                  |   Express Server (app.js)   |
                                  |     (Node.js, :5000)        |
                                  +--------------+--------------+
                                                 |
                       +-------------------------+-------------------------+
                       |                                                   |
                       v                                                   v
            +-----------------------+                           +-----------------------+
            |    /api/v1/*          |                           |    /master/*          |
            | Enterprise VMS API    |                           | Master Routes         |
            | Controllers/Services  |                           | Master SQL via req.db |
            +-----------+-----------+                           +-----------+-----------+
                        |                                                   |
                        +-------------------------+-------------------------+
                                                  |
                                                  v
                                  +-----------------------------+
                                  | req.db (pg.Pool middleware) |
                                  +--------------+--------------+
                                                 |
                                                 v
                                  +-----------------------------+
                                  |   PostgreSQL Database Pool  |
                                  | (backend/src/config/db.js)  |
                                  +-----------------------------+
```

### Key Architectural Highlights:
- **Centralized Database Connection**: A single `pg.Pool` instance ([`backend/src/config/database.js`](file:///d:/PROJECTS/Gtm%20Smart%20Gate/gtm-smartgate/backend/src/config/database.js)) manages database connections for both `/api/v1/*` and `/master/*` routes.
- **Master API Compatibility**: Legacy PostgreSQL endpoints in [`backend/expressRoutes/masterRoutes.js`](file:///d:/PROJECTS/Gtm%20Smart%20Gate/gtm-smartgate/backend/expressRoutes/masterRoutes.js) are mounted at `/master/*`.
- **Frontend Service Layer**: Centralized GET read requests flow through [`frontend/src/services/masterApi.service.js`](file:///d:/PROJECTS/Gtm%20Smart%20Gate/gtm-smartgate/frontend/src/services/masterApi.service.js).

---

## 2. Prerequisites

Ensure the following tools are installed on your machine:

1. **Node.js**: v18.0.0 or higher (`node -v`)
2. **npm**: v9.0.0 or higher (`npm -v`)
3. **PostgreSQL**: v14.0 or higher running locally or on a remote server

---

## 3. Environment Variables Configuration

The backend reads database credentials and server settings from `backend/.env`.

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Create or edit the `.env` file (refer to `.env.example`):
   ```ini
   PORT=5000
   NODE_ENV=development

   # PostgreSQL Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=gtm_smartgate
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password

   # JWT Configuration
   JWT_ACCESS_SECRET=gtm_access_secret_key_2026_super_secure
   JWT_REFRESH_SECRET=gtm_refresh_secret_key_2026_super_secure
   JWT_KIOSK_SECRET=gtm_kiosk_secret_key_2026_super_secure
   JWT_ACCESS_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   JWT_KIOSK_EXPIRES_IN=12h
   ```

---

## 4. How to Run the Project

### Step 1: Install Backend Dependencies & Start Server

Open a terminal window:

```bash
# Navigate to backend directory
cd backend

# Install dependencies (express, pg, cors, dotenv, multer, request, etc.)
npm install

# Start backend server in development mode (using nodemon)
npm run dev
```

The server will start on **`http://localhost:5000`**.

Expected console output:
```text
GTM Smart Gate Enterprise Backend listening on port 5000
```

---

### Step 2: Install Frontend Dependencies & Start App

Open a second terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install frontend dependencies (react, react-router-dom, axios, lucide-react, etc.)
npm install

# Start Vite development server
npm run dev
```

The frontend application will start on **`http://localhost:3000`** (or `http://localhost:5173`).

---

## 5. Testing & Health Verification

You can verify the backend server and database connection using `curl` or PowerShell:

### 1. Server Healthcheck
```bash
curl http://localhost:5000/health
```
**Response**:
```json
{
  "status": "UP",
  "service": "gtm-smartgate-backend",
  "timestamp": "2026-08-18T15:17:47.486Z"
}
```

### 2. PostgreSQL Database Connection Check
```bash
curl http://localhost:5000/api/health/db
```
**Response**:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-08-18T15:17:52.440Z"
}
```

### 3. Master Route Smoke Test
```bash
curl http://localhost:5000/master/test
```
**Response**:
```text
Master route working!
```

---

## 6. Integrated Master GET Endpoints Reference

The following **GET endpoints** are integrated into the `/master` API layer and connected to real frontend components:

| Endpoint | Target PostgreSQL Table(s) | Description | Connected Component |
|---|---|---|---|
| `GET /master/test` | None | Master Route Smoke Test | Backend Verification |
| `GET /master/getCompanyReport` | `company_details` | List all companies | `OrganizationContext.jsx` / `CustomersPage.jsx` |
| `GET /master/getCompanyCode` | `company_details`, `auto_prefixs` | Get auto-prefix unassigned companies | `CorporatePortalSettingsPage.jsx` |
| `GET /master/getAutoPrefixReport` | `auto_prefixs`, `company_details` | List company auto-prefixes | `CorporatePortalSettingsPage.jsx` |
| `GET /master/getCompanyList` | `company_details` | Get registered company list | `OrganizationContext.jsx` |
| `GET /master/getSiteReport` | `store_details`, `company_details` | List all sites/gate locations | `CorporateSitesPage.jsx` |
| `GET /master/getUserReport` | `user_details`, `company_details`, `roleinfos` | List portal users | `CorporateUsersPage.jsx` |
| `GET /master/getRoleList` | `roleinfos` | List system roles | `RolesPage.jsx` |
| `GET /master/getPassCategory` | `passcategory_details` | List visitor pass categories | `CorporateVisitorTypesPage.jsx` |
| `GET /master/getGatePreviliges` | `gate_privileges` | List gate privileges matrix | `RolesPage.jsx` |

---

## 7. Production Build Instructions

To build the production bundle for deployment:

```bash
# Navigate to frontend directory
cd frontend

# Run production build script
npm run build
```

Output:
```text
✓ 1665 modules transformed.
dist/index.html                   1.04 kB
dist/assets/index-DeJyb-eY.css   57.47 kB
dist/assets/index-Cnq70TLf.js   657.32 kB
✓ built in 24.39s
```

The production assets will be generated in `frontend/dist`.

---

## 8. Directory Structure Overview

```text
gtm-smartgate/
├── PROJECT_SETUP_GUIDE.md      <-- Setup and execution guide
├── backend/
│   ├── .env                    <-- Environment variables (database credentials)
│   ├── .env.example            <-- Environment template
│   ├── package.json            <-- Backend scripts and dependencies
│   ├── expressRoutes/
│   │   ├── masterRoutes.js     <-- PostgreSQL Master API implementation
│   │   └── loginRoutes.js      <-- Authentication & privilege routes
│   └── src/
│       ├── app.js              <-- Express setup, middleware, and route mounts
│       ├── server.js           <-- HTTP listener entrypoint
│       └── config/
│           └── database.js     <-- Centralized PostgreSQL Pool
└── frontend/
    ├── vite.config.js          <-- Vite config with /master & /api proxies
    ├── package.json            <-- Frontend dependencies
    └── src/
        ├── constants/
        │   └── api.js          <-- API endpoint definitions
        ├── services/
        │   └── masterApi.service.js <-- Centralized Master GET API client
        ├── contexts/
        │   └── OrganizationContext.jsx
        └── pages/
            ├── CorporateVisitorTypesPage.jsx
            ├── CorporateUsersPage.jsx
            ├── CorporateSitesPage.jsx
            ├── CorporatePortalSettingsPage.jsx
            └── RolesPage.jsx
```

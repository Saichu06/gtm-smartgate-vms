# GTM Smart Gate — System Integration Documentation

**Date**: August 18, 2026  
**System**: GTM Smart Gate / Visitor Management System (VMS)  
**Document Version**: 2.0  
**Target Repository**: `gtm-smartgate`  

---

## 1. Executive System Architecture

```
                                  +-----------------------------+
                                  |     Client / Frontend       |
                                  |   (React + Vite, Port 3000) |
                                  +--------------+--------------+
                                                 |
                                                 v
                                  +-----------------------------+
                                  |   Express Server (app.js)   |
                                  |     (Node.js, Port 5000)    |
                                  +--------------+--------------+
                                                 |
                       +-------------------------+-------------------------+
                       |                                                   |
                       v                                                   v
            +-----------------------+                           +-----------------------+
            |    /api/v1/*          |                           |    /master/*          |
            | Enterprise VMS API    |                           | Master Compatibility  |
            | Controllers/Services  |                           | Express Master Routes |
            | Repositories / Sqids  |                           | Directly via req.db   |
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
                                  |   PostgreSQL Connection     |
                                  | (backend/src/config/db.js)  |
                                  +-----------------------------+
```

---

## 2. Integrated Screens & Authentication Modules

### A. Authentication & Corporate Login
- **Component**: `CorporateLoginPage.jsx` / `AuthContext.jsx`
- **Backend Endpoints**:
  - `POST /master/getLoginInfo`
    - **Tables Used**: `user_details`, `roleinfos`
    - **Parameters**: `{ user_name, password }`
    - **Function**: Validates user credentials and role codes (`rolecode`).
  - `POST /master/getLoginPreviliges`
    - **Tables Used**: `user_details`, `roleinfos`, `company_details`
    - **Parameters**: `{ usercode, role, schema }`
    - **Function**: Returns active user permissions, role details, and multi-tenant company context (`comp_type`).

---

### B. Kiosk 4-Step Self-Service Flow
- **Service Layer**: [`frontend/src/modules/kiosk/services/kioskApi.js`](file:///d:/PROJECTS/Gtm%20Smart%20Gate/gtm-smartgate/frontend/src/modules/kiosk/services/kioskApi.js)
- **Screens Integrated**:

#### 1. Screen 1 — Mobile & Returning Visitor Lookup
- **Endpoint**: `POST /master/visitordetails` / `POST /master/GetPhoneDetails`
- **Tables Used**: `visitor_details`, `visitor_masters`, `user_details`, `gateuser_details`
- **Payload**: `{ mobiledata, siteid, comp, usercode }`
- **Function**: Performs phone number query against PostgreSQL to populate returning visitor details (`visitor_name`, `coming_from`, `vehicle_no`, `imageAsDataUrl`).

#### 2. Screen 2 — Visitor Information & Host Employee Search
- **Endpoints**:
  - `POST /master/getEmployeeReport` (Table: `employee_details`)
  - `GET /master/getPassCategory` (Table: `passcategory_details`)
- **Payload**: `{ comp_id, site_id }`
- **Function**: Queries active host employees by department/designation and lists available visitor categories.

#### 3. Screen 3 — Face Capture & ID Metadata
- **Endpoint**: Express Static Uploads (`/uploads`)
- **Function**: Uploads captured face photograph and ID card images, storing asset paths for database reference.

#### 4. Screen 4 — Gate Pass Allocation & Digital QR Generation
- **Endpoints**:
  - `POST /master/getpassdetails`
    - **Table**: `pass_details`, `visitor_trans`
    - **Query**:
      ```sql
      SELECT id, pass_code FROM pass_details
      WHERE site_id = $1 AND comp_id = $2 AND passcategory_id = $3
      AND id NOT IN (
          SELECT pass_id FROM visitor_trans
          WHERE site_id = $1 AND comp_id = $2 AND pass_id IS NOT NULL AND status = 'CheckedIn'
      )
      ```
    - **Function**: Retrieves physical gate passes that are currently **not** checked in.
  - `POST /master/CheckInStatus` & `POST /master/CheckoutStatus`
    - **Table**: `visitor_trans`, `permanent_employee`
    - **Function**: Updates check-in / check-out timestamps and status.

---

### C. Corporate Admin Management Modules

#### 1. Organization & Multi-Tenant Management
- **Screen**: [`OrganizationContext.jsx`](file:///d:/PROJECTS/Gtm%20Smart%20Gate/gtm-smartgate/frontend/src/contexts/OrganizationContext.jsx) & [`CustomersPage.jsx`](file:///d:/PROJECTS/Gtm%20Smart%20Gate/gtm-smartgate/frontend/src/pages/CustomersPage.jsx)
- **Endpoints**: `GET /master/getCompanyReport`, `GET /master/getCompanyList`
- **Table Used**: `company_details`
- **Function**: Renders live organization directory directly from PostgreSQL database.

#### 2. Site & Gate Terminal Management
- **Screen**: [`CorporateSitesPage.jsx`](file:///d:/PROJECTS/Gtm%20Smart%20Gate/gtm-smartgate/frontend/src/pages/CorporateSitesPage.jsx)
- **Endpoints**: `GET /master/getSiteReport`, `POST /master/getAdminSiteReport`
- **Tables Used**: `store_details`, `company_details`
- **Function**: Lists deployed site locations, gate terminals, and contact details.

#### 3. Employee Directory
- **Screen**: [`CorporateEmployeesPage.jsx`](file:///d:/PROJECTS/Gtm%20Smart%20Gate/gtm-smartgate/frontend/src/pages/CorporateEmployeesPage.jsx)
- **Endpoint**: `POST /master/getEmployeeReport`
- **Table Used**: `employee_details`
- **Function**: Displays Active Directory-synced employee records filtered by company and site context.

#### 4. Visitor Category & Pass Types
- **Screen**: [`CorporateVisitorTypesPage.jsx`](file:///d:/PROJECTS/Gtm%20Smart%20Gate/gtm-smartgate/frontend/src/pages/CorporateVisitorTypesPage.jsx)
- **Endpoint**: `GET /master/getPassCategory`
- **Table Used**: `passcategory_details`
- **Function**: Displays visitor categories and access policies with loading and empty state indicators.

#### 5. Portal Users & Access Control
- **Screen**: [`CorporateUsersPage.jsx`](file:///d:/PROJECTS/Gtm%20Smart%20Gate/gtm-smartgate/frontend/src/pages/CorporateUsersPage.jsx)
- **Endpoints**: `GET /master/getUserReport`, `POST /master/getAdminUserReport`
- **Tables Used**: `user_details`, `company_details`, `roleinfos`
- **Function**: Manages portal user accounts, assigned roles (`rolename`), and site scopes.

#### 6. Roles & Privileges Matrix
- **Screen**: [`RolesPage.jsx`](file:///d:/PROJECTS/Gtm%20Smart%20Gate/gtm-smartgate/frontend/src/pages/RolesPage.jsx)
- **Endpoints**: `GET /master/getRoleList`, `GET /master/getGatePreviliges`
- **Tables Used**: `roleinfos`, `gate_privileges`
- **Function**: Renders permission matrix and role definitions.

#### 7. System Auto-Prefix & Settings
- **Screen**: [`CorporatePortalSettingsPage.jsx`](file:///d:/PROJECTS/Gtm%20Smart%20Gate/gtm-smartgate/frontend/src/pages/CorporatePortalSettingsPage.jsx)
- **Endpoints**: `GET /master/getCompanyCode`, `GET /master/getAutoPrefixReport`
- **Tables Used**: `auto_prefixs`, `company_details`
- **Function**: Reads system auto-prefix configurations for gate pass and visitor numbering.

---

## 3. Database Table Reference

The integrated backend operates directly against the 24 PostgreSQL schema tables:

| Table Name | Primary Purpose | Integrated Endpoints |
| :--- | :--- | :--- |
| `company_details` | Multi-tenant organization records | `/getCompanyReport`, `/getCompanyCode`, `/getCompanyList`, `/getLoginPreviliges` |
| `store_details` | Site and gate location records | `/getSiteReport`, `/getAdminSiteReport`, `/updateStoreDetails` |
| `employee_details` | Employee master data | `/getEmployeeReport`, `/GetSingleVechileDetails`, `/GetEmployeevechileDetails` |
| `user_details` | System user credentials and profiles | `/getUserReport`, `/getAdminUserReport`, `/getLoginInfo`, `/getLoginPreviliges` |
| `roleinfos` | Role names and code definitions | `/getRoleList`, `/getLoginInfo`, `/getLoginPreviliges` |
| `passcategory_details` | Pass category classification | `/getPassCategory` |
| `pass_details` | Gate pass inventory | `/getpassdetails`, `/setPassDetails`, `/EditPass` |
| `visitor_masters` | Visitor master registry | `/getVisitorMasterList` |
| `visitor_details` | Detailed visitor records | `/visitordetails` |
| `visitor_trans` | Active visitor check-in/out logs | `/getpassdetails`, `/getPendinPassDetails` |
| `gate_privileges` | Privilege rules matrix | `/getGatePreviliges` |
| `auto_prefixs` | Code prefix configuration | `/getAutoPrefixReport`, `/getCompanyCode` |

---

## 4. Verification Log

As of **August 18, 2026**:

1. **Backend Listeners**: Node.js Express listener running on `http://localhost:5000`.
2. **PostgreSQL Health**: `GET http://localhost:5000/api/health/db` -> `status: ok`, `database: connected`.
3. **Frontend Production Build**: `npm run build` executed cleanly in 5.72s with **0 errors**.

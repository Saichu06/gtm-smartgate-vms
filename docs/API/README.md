# GTM Smart Gate — REST API Reference

## Base URL

```
Development:  http://localhost:5000/api/v1
Production:   https://api.smartgate.gtm.com/api/v1
```

## Authentication

All protected routes require:
```
Authorization: Bearer <JWT_ACCESS_TOKEN>
```

---

## Customer Endpoints

| Method | Route                  | Description                        | Auth |
|--------|------------------------|------------------------------------|------|
| GET    | `/customers`           | List all customers (paginated)     | ✅   |
| GET    | `/customers/:id`       | Get single customer details        | ✅   |
| POST   | `/customers`           | Create new customer tenant         | ✅   |
| PUT    | `/customers/:id`       | Update customer details            | ✅   |
| DELETE | `/customers/:id`       | Suspend / deactivate customer      | ✅   |

## Platform User Endpoints

| Method | Route                  | Description                        |
|--------|------------------------|------------------------------------|
| GET    | `/users`               | List all platform users            |
| POST   | `/users/invite`        | Send platform user invitation      |

## Audit Log Endpoints

| Method | Route                  | Description                        |
|--------|------------------------|------------------------------------|
| GET    | `/audit-logs`          | Query audit events (filterable)    |

---

## Standard Response Envelope

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 147
  }
}
```

## Standard Error Envelope

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Customer with id abc123 was not found."
  },
  "timestamp": "2026-07-31T09:42:15.000Z"
}
```

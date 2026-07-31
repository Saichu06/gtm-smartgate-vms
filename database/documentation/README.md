# GTM Smart Gate — Database Architecture

## Engine: PostgreSQL 15+

## Core Schemas & Tables

| Table               | Description                                       |
|---------------------|---------------------------------------------------|
| `customers`         | Enterprise tenant organisations                   |
| `customer_sites`    | Individual gates/plants per customer              |
| `customer_admins`   | Corporate-level admin users per tenant            |
| `platform_users`    | Internal GTM Super Admin staff accounts           |
| `roles`             | Platform RBAC role definitions                    |
| `role_permissions`  | Granular module-action permission matrix          |
| `subscriptions`     | SaaS plan & billing data per customer             |
| `visitors`          | Visitor logs per tenant (multi-tenant partitioned) |
| `audit_logs`        | Immutable platform activity log                   |
| `otp_tokens`        | Time-limited OTP verification tokens              |
| `settings`          | Global platform configuration values             |

## Multi-Tenancy Strategy

All tenant data is **row-level isolated** using a `tenant_id (UUID)` foreign key column present on every tenant-specific table.

Future migration may explore **PostgreSQL Schema-per-Tenant** model for larger enterprise customers requiring database-level isolation.

## Indexing Strategy

- All `tenant_id` columns: B-tree index
- `visitors.check_in_time`: B-tree index for date range queries
- `audit_logs.created_at`: Partial index for last 90 days
- `customers.subdomain`: Unique index
- `otp_tokens.token`: Hash index + TTL managed via cron job

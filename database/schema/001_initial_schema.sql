-- ============================================================
-- GTM Smart Gate — PostgreSQL Schema Placeholder
-- Full implementation by database engineering team
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for LIKE search indexing

-- Platform Users (Internal GTM Staff)
CREATE TABLE IF NOT EXISTS platform_users (
  id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name     VARCHAR(255)  NOT NULL,
  email         VARCHAR(255)  UNIQUE NOT NULL,
  password_hash VARCHAR(255)  NOT NULL,
  role_id       UUID          REFERENCES roles(id),
  status        VARCHAR(20)   DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  created_at    TIMESTAMPTZ   DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   DEFAULT NOW()
);

-- Customers (Enterprise Tenants)
CREATE TABLE IF NOT EXISTS customers (
  id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(255)  NOT NULL,
  code          VARCHAR(50)   UNIQUE NOT NULL,
  email         VARCHAR(255)  UNIQUE NOT NULL,
  phone         VARCHAR(30),
  address       TEXT,
  subdomain     VARCHAR(100)  UNIQUE NOT NULL,
  plan_tier     VARCHAR(30)   NOT NULL DEFAULT 'Starter'
                              CHECK (plan_tier IN ('Starter', 'Professional', 'Enterprise')),
  status        VARCHAR(30)   NOT NULL DEFAULT 'Trial'
                              CHECK (status IN ('Active', 'Trial', 'Suspended', 'Expired')),
  created_at    TIMESTAMPTZ   DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   DEFAULT NOW()
);

-- Placeholder: Full schema to be implemented by database team

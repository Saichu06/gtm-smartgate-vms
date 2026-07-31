/**
 * Customer Model Placeholder
 * Schema definition for the Customer entity.
 * To be implemented with chosen ORM (Knex / Prisma / Sequelize / raw pg).
 */

/**
 * Customer Table Schema (Reference)
 *
 * TABLE: customers
 * ─────────────────────────────────────────────
 * id              UUID         PRIMARY KEY
 * name            VARCHAR(255) NOT NULL
 * code            VARCHAR(50)  UNIQUE NOT NULL
 * email           VARCHAR(255) UNIQUE NOT NULL
 * phone           VARCHAR(30)
 * address         TEXT
 * subdomain       VARCHAR(100) UNIQUE NOT NULL
 * plan_tier       ENUM('Starter', 'Professional', 'Enterprise')
 * status          ENUM('Active', 'Trial', 'Suspended', 'Expired')
 * created_at      TIMESTAMPTZ  DEFAULT NOW()
 * updated_at      TIMESTAMPTZ  DEFAULT NOW()
 */

module.exports = {}; // ORM model to be wired here

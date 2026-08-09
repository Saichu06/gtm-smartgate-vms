require('dotenv').config();
const path = require('path');
const { Client } = require('pg');

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'gtm_smartgate_demo',
});

const seedSql = `
SET search_path TO smartgate, public;

-- Seed Roles
INSERT INTO roleinfos (id, code, name, is_deleted)
OVERRIDING SYSTEM VALUE VALUES
  (1, 'SUPER_ADMIN', 'GTM Super Admin', false),
  (2, 'CORP_ADMIN', 'Corporate Admin', false),
  (3, 'SECURITY_DESK', 'Security Desk Officer', false),
  (4, 'GATE_USER', 'Gate User', false)
ON CONFLICT (id) DO NOTHING;

SELECT setval(pg_get_serial_sequence('roleinfos', 'id'), (SELECT MAX(id) FROM roleinfos));

-- Seed Pass Categories & Passes
INSERT INTO passcategory_details (id, category, status)
OVERRIDING SYSTEM VALUE VALUES
  (1, 'Standard Visitor Pass', 'Active'),
  (2, 'Contractor Pass', 'Active'),
  (3, 'VIP Visitor Pass', 'Active')
ON CONFLICT (id) DO NOTHING;

SELECT setval(pg_get_serial_sequence('passcategory_details', 'id'), (SELECT MAX(id) FROM passcategory_details));

INSERT INTO pass_details (id, pass_code, pass_desc, passcategory_id, info1, active, site_id, comp_id)
OVERRIDING SYSTEM VALUE VALUES
  (1, 'Gate Pass 1', 'Physical Pass #001', 1, 'Gate A', true, 1, 1),
  (2, 'Gate Pass 2', 'Physical Pass #002', 1, 'Gate A', true, 1, 1),
  (3, 'Gate Pass 3', 'Physical Pass #003', 1, 'Gate B', true, 1, 1),
  (4, 'Gate Pass 4', 'Physical Pass #004', 1, 'Gate B', true, 1, 1),
  (5, 'Gate Pass 5', 'Physical Pass #005', 1, 'Gate C', true, 1, 1),
  (6, 'TVS Gate Pass 1', 'Physical Pass #101', 1, 'Main Gate', true, 3, 2)
ON CONFLICT (id) DO NOTHING;

SELECT setval(pg_get_serial_sequence('pass_details', 'id'), (SELECT MAX(id) FROM pass_details));

-- Seed Visitor Types (visitor_masters)
INSERT INTO visitor_masters (id, visitor_code, visitor_desc, active, site_id, comp_id)
OVERRIDING SYSTEM VALUE VALUES
  (1, 'BUS', 'Business Visitor', true, 1, 1),
  (2, 'VEN', 'Vendor / Supplier', true, 1, 1),
  (3, 'INT', 'Job Candidate', true, 1, 1),
  (4, 'CON', 'Contractor', true, 1, 1),
  (5, 'GST', 'Guest', true, 1, 1)
ON CONFLICT (id) DO NOTHING;

SELECT setval(pg_get_serial_sequence('visitor_masters', 'id'), (SELECT MAX(id) FROM visitor_masters));
`;

client.connect()
  .then(async () => {
    console.log('Seeding initial data into gtm_smartgate DB...');
    await client.query(seedSql);
    console.log('SEED DATA INSERTED SUCCESSFULLY!');
    await client.end();
    process.exit(0);
  })
  .catch(err => {
    console.error('SEED_ERROR:', err.message);
    process.exit(1);
  });

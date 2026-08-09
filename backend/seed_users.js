/**
 * seed_users.js — Seeds the initial platform SUPER_ADMIN user.
 * Run from: backend/   →   node seed_users.js
 *
 * Default credentials:
 *   Email:    superadmin@gtm.com
 *   Password: Admin@1234
 *
 * The first_login flag is set to TRUE so the user is forced to change
 * their password on first sign-in.
 */

require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'gtm_smartgate_demo',
});

async function main() {
  await client.connect();
  console.log('Connected to gtm_smartgate DB...');

  // Ensure the required tables exist via schema check
  await client.query('SET search_path TO smartgate, public;');

  // Hash the default password
  const passwordHash = await bcrypt.hash('Admin@1234', 10);
  console.log('Password hashed.');

  // Ensure refresh_tokens table exists (referenced by auth service)
  await client.query(`
    CREATE TABLE IF NOT EXISTS smartgate.refresh_tokens (
      id          SERIAL PRIMARY KEY,
      user_id     INTEGER NOT NULL,
      token_hash  TEXT NOT NULL,
      expires_at  TIMESTAMPTZ NOT NULL,
      revoked     BOOLEAN NOT NULL DEFAULT FALSE,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  console.log('refresh_tokens table ensured.');

  // Ensure first_login column exists on user_details
  await client.query(`
    ALTER TABLE smartgate.user_details
    ADD COLUMN IF NOT EXISTS first_login BOOLEAN NOT NULL DEFAULT TRUE;
  `);
  console.log('first_login column ensured on user_details.');

  // Get SUPER_ADMIN role ID
  const roleRes = await client.query(
    `SELECT id FROM smartgate.roleinfos WHERE code = 'SUPER_ADMIN' LIMIT 1`
  );
  if (roleRes.rows.length === 0) {
    throw new Error(
      "SUPER_ADMIN role not found in smartgate.roleinfos. Run seed_db.js first."
    );
  }
  const superAdminRoleId = roleRes.rows[0].id;
  console.log(`Found SUPER_ADMIN role id: ${superAdminRoleId}`);

  // Check if superadmin exists
  const existingUser = await client.query(
    `SELECT id FROM smartgate.user_details WHERE LOWER(email) = LOWER($1) LIMIT 1`,
    ['superadmin@gtm.com']
  );

  if (existingUser.rows.length > 0) {
    await client.query(
      `UPDATE smartgate.user_details
       SET user_name = $1, password = $2, role_id = $3, active = true, first_login = true
       WHERE id = $4`,
      ['GTM Super Admin', passwordHash, superAdminRoleId, existingUser.rows[0].id]
    );
    console.log('Super admin user updated.');
  } else {
    await client.query(
      `INSERT INTO smartgate.user_details
        (user_code, user_name, email, password, role_id, active, first_login)
       VALUES
        ($1, $2, $3, $4, $5, true, true)`,
      ['USR-000', 'GTM Super Admin', 'superadmin@gtm.com', passwordHash, superAdminRoleId]
    );
    console.log('Super admin user inserted.');
  }

  console.log('');
  console.log('=============================================');
  console.log('  SUPER_ADMIN user seeded successfully!');
  console.log('  Email:    superadmin@gtm.com');
  console.log('  Password: Admin@1234');
  console.log('  NOTE: First login will redirect to /first-login');
  console.log('=============================================');
  console.log('');

  await client.end();
}

main().catch((err) => {
  console.error('SEED_USERS ERROR:', err.message);
  process.exit(1);
});

require('dotenv').config();
const pool = require('../config/database');
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    const hash = await bcrypt.hash('admin123', 10);
    
    // Clear existing test users if any
    await pool.query('DELETE FROM smartgate.user_details');

    // 1. Super Admin
    await pool.query(
      `INSERT INTO smartgate.user_details (user_code, user_name, password, email, role_id, active, first_login)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      ['USR-001', 'GTM Super Admin', hash, 'superadmin@smartgate.gtm.com', 1, true, false]
    );

    // 2. Apollo Corporate Admin
    await pool.query(
      `INSERT INTO smartgate.user_details (user_code, user_name, password, email, role_id, comp_id, active, first_login)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      ['USR-002', 'Apollo Admin', hash, 'admin@apollotyres.com', 2, 1, true, true]
    );

    // 3. Apollo Security Desk
    await pool.query(
      `INSERT INTO smartgate.user_details (user_code, user_name, password, email, role_id, comp_id, site_id, active, first_login)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      ['USR-003', 'Gate Security Desk', hash, 'security@apollotyres.com', 3, 1, 1, true, false]
    );

    // 4. Apollo Gate User
    await pool.query(
      `INSERT INTO smartgate.user_details (user_code, user_name, password, email, role_id, comp_id, site_id, active, first_login)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      ['USR-004', 'Gate Guard User', hash, 'gateuser@apollotyres.com', 4, 1, 1, true, false]
    );

    console.log('Seeded users cleanly!');
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    process.exit();
  }
}

seed();

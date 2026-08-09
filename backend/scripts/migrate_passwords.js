const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'gtm_smartgate_demo',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin'
});

async function main() {
  console.log('=== ONE-TIME PASSWORD MIGRATION TO BCRYPT ===');
  const res = await pool.query('SELECT id, user_code, user_name, password FROM smartgate.user_details');
  console.log(`Found ${res.rows.length} records in smartgate.user_details`);

  let updatedCount = 0;
  for (const row of res.rows) {
    const pwd = row.password || '';
    // Check if already bcrypt hash ($2a$, $2b$, $2y$)
    if (pwd.startsWith('$2a$') || pwd.startsWith('$2b$') || pwd.startsWith('$2y$')) {
      console.log(`User ID ${row.id} (${row.user_code} / ${row.user_name}) is already bcrypt hashed.`);
    } else {
      const hashedPassword = await bcrypt.hash(pwd, 10);
      await pool.query('UPDATE smartgate.user_details SET password = $1 WHERE id = $2', [hashedPassword, row.id]);
      console.log(`Migrated user ID ${row.id} (${row.user_code} / ${row.user_name}) to bcrypt hash.`);
      updatedCount++;
    }
  }

  console.log(`\nPassword migration complete. Total updated: ${updatedCount}`);
  await pool.end();
}

main().catch(err => {
  console.error('Migration Error:', err);
  process.exit(1);
});

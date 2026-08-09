const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'gtm_smartgate_demo',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin'
});

async function main() {
  const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'smartgate' ORDER BY table_name");
  console.log('Total Tables:', tables.rows.length);
  console.log('TABLES:', tables.rows.map(r => r.table_name));
  
  for (let r of tables.rows) {
    const cols = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'smartgate' AND table_name = $1 ORDER BY ordinal_position", [r.table_name]);
    const count = await pool.query(`SELECT count(*) FROM smartgate."${r.table_name}"`);
    console.log(`\n=== Table: smartgate.${r.table_name} (${count.rows[0].count} rows) ===`);
    console.log(cols.rows.map(c => `${c.column_name} (${c.data_type})`).join(', '));
  }

  // Also inspect user_details records sample
  const userDetails = await pool.query(`SELECT * FROM smartgate.user_details LIMIT 5`);
  console.log('\n=== Sample user_details ===');
  console.log(JSON.stringify(userDetails.rows, null, 2));

  // Also inspect company_details records sample
  const companyDetails = await pool.query(`SELECT * FROM smartgate.company_details LIMIT 5`);
  console.log('\n=== Sample company_details ===');
  console.log(JSON.stringify(companyDetails.rows, null, 2));

  await pool.end();
}

main().catch(err => {
  console.error('DB Error:', err);
  process.exit(1);
});

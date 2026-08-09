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
  console.log('=== SYNCING ALL POSTGRESQL PRIMARY KEY SEQUENCES ===\n');

  const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'smartgate'");

  for (const row of tables.rows) {
    const table = row.table_name;
    try {
      const maxRes = await pool.query(`SELECT MAX(id) FROM smartgate."${table}"`);
      const maxId = parseInt(maxRes.rows[0].max || '0', 10);
      const nextId = maxId + 1;

      // Try setting sequence
      const seqName = `${table}_id_seq`;
      await pool.query(`SELECT setval('smartgate."${seqName}"', $1, false)`, [nextId]);
      console.log(`Synced sequence for smartgate.${table}: next ID will be ${nextId}`);
    } catch (err) {
      // Ignore if table has no sequence or different id type
    }
  }

  console.log('\nSequence sync complete!');
  await pool.end();
}

main().catch(err => {
  console.error('Sequence sync error:', err);
  process.exit(1);
});

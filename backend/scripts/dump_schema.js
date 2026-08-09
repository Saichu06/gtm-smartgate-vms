const { Pool } = require('pg');
const fs = require('fs');
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
  const schemaDump = {};
  
  for (let r of tables.rows) {
    const tableName = r.table_name;
    const cols = await pool.query("SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema = 'smartgate' AND table_name = $1 ORDER BY ordinal_position", [tableName]);
    const count = await pool.query(`SELECT count(*) FROM smartgate."${tableName}"`);
    const sample = await pool.query(`SELECT * FROM smartgate."${tableName}" LIMIT 3`);
    schemaDump[tableName] = {
      rowCount: parseInt(count.rows[0].count),
      columns: cols.rows,
      sampleRows: sample.rows
    };
  }

  fs.writeFileSync('db_schema_dump.json', JSON.stringify(schemaDump, null, 2));
  console.log('Schema dumped successfully to db_schema_dump.json');
  await pool.end();
}

main().catch(err => {
  console.error('DB Error:', err);
  process.exit(1);
});

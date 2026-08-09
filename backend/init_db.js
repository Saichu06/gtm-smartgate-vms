require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const sql = fs.readFileSync(path.join(__dirname, '../database/schema/002_smartgate_24_tables.sql'), 'utf8');

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin',
  database: 'gtm_smartgate',
});

client.connect()
  .then(async () => {
    console.log('Connecting to gtm_smartgate DB and applying schema...');
    await client.query(sql);
    const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema IN ('public', 'smartgate');");
    console.log(`SCHEMA APPLIED SUCCESSFULLY. (${res.rows.length} tables created)`);
    console.log('Tables:', res.rows.map(r => r.table_name).sort());
    await client.end();
    process.exit(0);
  })
  .catch(err => {
    console.error('SCHEMA_APPLY_ERROR:', err.message);
    process.exit(1);
  });

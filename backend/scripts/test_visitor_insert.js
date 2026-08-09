const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'gtm_smartgate_demo',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin'
});

async function testInsert() {
  try {
    const res = await pool.query(
      `INSERT INTO smartgate.visitor_details 
        (mobile_no, otp, otp_date, visitor_name, coming_from, person_to_meet, visitors_type, image_type, image_path, image_name, idproof_type, idproof_path, idproof_name, laptop, model, serial_no, vehicle_type, vehicle_no, pass_id, checkin_date, status, site_id, comp_id, mulcomp_id, empbook_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
       RETURNING id`,
      ['9876543210', 1234, new Date(), 'Test Visitor', 'Acme', 'Admin', 'Business Visitor', 'BASE64', null, 'test.png', 'Aadhaar', null, 'id.png', 0, null, null, null, null, null, new Date(), 'Checked In', 1, 1, null, null]
    );
    console.log('Insert Success! ID:', res.rows[0].id);

    const transRes = await pool.query(
      `INSERT INTO smartgate.visitor_trans
        (mobile_no, otp, otp_date, visitor_name, coming_from, person_to_meet, visitors_type, image_type, image_path, image_name, idproof_type, idproof_path, idproof_name, laptop, model, serial_no, vehicle_type, vehicle_no, pass_id, checkin_date, status, site_id, comp_id, mulcomp_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
       RETURNING id`,
      ['9876543210', 1234, new Date(), 'Test Visitor', 'Acme', 'Admin', 'Business Visitor', 'BASE64', null, 'test.png', 'Aadhaar', null, 'id.png', 0, null, null, null, null, null, new Date(), 'Checked In', 1, 1, null]
    );
    console.log('Trans Insert Success! ID:', transRes.rows[0].id);
  } catch (err) {
    console.error('Insert Error:', err);
  } finally {
    pool.end();
  }
}

testInsert();

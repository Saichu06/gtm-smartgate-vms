/**
 * Company Repository — Data Access Layer for company_details
 */
const pool = require('../config/database');

exports.findAll = async () => {
  const result = await pool.query(`
    SELECT 
      id, 
      company_code AS code, 
      company_name AS name, 
      company_name AS "displayName", 
      contact_email AS email, 
      contact_mobno AS phone, 
      address1, city, state, pincode,
      logo, welcome_msg AS "welcomeMessage", comp_type AS "compType",
      primary_color AS "primaryColor", secondary_color AS "secondaryColor",
      is_deleted
    FROM smartgate.company_details 
    WHERE is_deleted = false 
    ORDER BY id ASC
  `);
  return result.rows;
};

exports.findById = async (id) => {
  const result = await pool.query(
    `SELECT 
      id, 
      company_code AS code, 
      company_name AS name, 
      company_name AS "displayName", 
      contact_email AS email, 
      contact_mobno AS phone, 
      address1, city, state, pincode,
      logo, welcome_msg AS "welcomeMessage", comp_type AS "compType",
      primary_color AS "primaryColor", secondary_color AS "secondaryColor"
     FROM smartgate.company_details 
     WHERE id = $1 AND is_deleted = false`,
    [id]
  );
  return result.rows[0] || null;
};

exports.create = async ({ code, name, email, phone, address, city, state, pincode, welcomeMessage, primaryColor, secondaryColor }) => {
  const result = await pool.query(
    `INSERT INTO smartgate.company_details 
      (company_code, company_name, contact_email, contact_mobno, address1, city, state, pincode, welcome_msg, primary_color, secondary_color)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING id, company_code AS code, company_name AS name, contact_email AS email, primary_color AS "primaryColor", secondary_color AS "secondaryColor"`,
    [
      code || 'ORG',
      name,
      email,
      phone,
      address || '',
      city || '',
      state || '',
      pincode || 0,
      welcomeMessage || `Welcome to ${name || 'our organization'}!`,
      primaryColor || '#1565C0',
      secondaryColor || '#0D47A1',
    ]
  );
  return result.rows[0];
};

exports.update = async (id, { name, email, phone, address, city, state, pincode, logo, welcomeMessage, primaryColor, secondaryColor }) => {
  const result = await pool.query(
    `UPDATE smartgate.company_details 
     SET company_name = COALESCE($1, company_name),
         contact_email = COALESCE($2, contact_email),
         contact_mobno = COALESCE($3, contact_mobno),
         address1 = COALESCE($4, address1),
         city = COALESCE($5, city),
         state = COALESCE($6, state),
         pincode = COALESCE($7, pincode),
         logo = COALESCE($8, logo),
         welcome_msg = COALESCE($9, welcome_msg),
         primary_color = COALESCE($10, primary_color),
         secondary_color = COALESCE($11, secondary_color)
     WHERE id = $12 AND is_deleted = false
     RETURNING id, company_code AS code, company_name AS name, contact_email AS email, logo, primary_color AS "primaryColor", secondary_color AS "secondaryColor"`,
    [name, email, phone, address, city, state, pincode, logo, welcomeMessage, primaryColor, secondaryColor, id]
  );
  return result.rows[0] || null;
};


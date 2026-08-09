const express = require('express');
const router = express.Router();
const pool = require('../config/database');

const ALLOWED_TABLES = [
  'auto_prefixs',
  'company_details',
  'conf_other_service_details',
  'conference_details',
  'emp_bookingdetails',
  'emp_vehicledetails',
  'employee_details',
  'gate_privileges',
  'gateuser_details',
  'multicompany_details',
  'pass_details',
  'passcategory_details',
  'permanent_employee',
  'resource_masters',
  'roleinfos',
  'sites',
  'store_details',
  'user_details',
  'users',
  'vehicle_entry',
  'vehicle_master',
  'visitor_details',
  'visitor_masters',
  'visitor_trans'
];

// GET /api/test/database — Inspect schema, connection, all 24 tables, columns & row counts
router.get('/', async (req, res) => {
  try {
    const tableDataPromises = ALLOWED_TABLES.map(async (tableName) => {
      // Fetch columns metadata
      const columnsRes = await pool.query(
        `SELECT 
          column_name AS name, 
          data_type AS type, 
          is_nullable AS nullable
         FROM information_schema.columns 
         WHERE table_schema = 'smartgate' AND table_name = $1
         ORDER BY ordinal_position ASC`,
        [tableName]
      );

      // Fetch primary key metadata
      const pkRes = await pool.query(
        `SELECT kcu.column_name
         FROM information_schema.table_constraints tc
         JOIN information_schema.key_column_usage kcu
           ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
         WHERE tc.constraint_type = 'PRIMARY KEY'
           AND tc.table_schema = 'smartgate'
           AND tc.table_name = $1`,
        [tableName]
      );
      const pkColumns = pkRes.rows.map((r) => r.column_name);

      // Fetch row count safely using whitelisted table name
      const countRes = await pool.query(`SELECT COUNT(*) FROM smartgate.${tableName}`);
      const rowCount = parseInt(countRes.rows[0].count, 10);

      const columns = columnsRes.rows.map((col) => ({
        name: col.name,
        type: col.type,
        nullable: col.nullable === 'YES',
        primaryKey: pkColumns.includes(col.name),
      }));

      return {
        name: tableName,
        rowCount,
        columnCount: columns.length,
        columns,
      };
    });

    const tables = await Promise.all(tableDataPromises);

    res.status(200).json({
      database: process.env.DB_NAME || 'gtm_smartgate_demo',
      schema: 'smartgate',
      connected: true,
      timestamp: new Date().toISOString(),
      totalTables: tables.length,
      tables,
    });
  } catch (err) {
    res.status(500).json({
      database: process.env.DB_NAME || 'gtm_smartgate_demo',
      schema: 'smartgate',
      connected: false,
      error: err.message,
    });
  }
});

// GET /api/test/database/:table — Inspect table columns & fetch sample rows
router.get('/:table', async (req, res) => {
  try {
    const tableName = req.params.table.toLowerCase();
    if (!ALLOWED_TABLES.includes(tableName)) {
      return res.status(400).json({
        success: false,
        error: `Invalid or unauthorized table '${req.params.table}'. Must be one of the 24 smartgate schema tables.`,
      });
    }

    // Fetch column details
    const columnsRes = await pool.query(
      `SELECT column_name AS name, data_type AS type, is_nullable AS nullable
       FROM information_schema.columns
       WHERE table_schema = 'smartgate' AND table_name = $1
       ORDER BY ordinal_position ASC`,
      [tableName]
    );

    // Fetch row count
    const countRes = await pool.query(`SELECT COUNT(*) FROM smartgate.${tableName}`);
    const rowCount = parseInt(countRes.rows[0].count, 10);

    // Fetch up to 50 sample rows
    const rowsRes = await pool.query(`SELECT * FROM smartgate.${tableName} ORDER BY 1 DESC LIMIT 50`);

    res.status(200).json({
      success: true,
      database: process.env.DB_NAME || 'gtm_smartgate_demo',
      schema: 'smartgate',
      table: tableName,
      rowCount,
      columns: columnsRes.rows.map((col) => ({
        name: col.name,
        type: col.type,
        nullable: col.nullable === 'YES',
      })),
      sampleRows: rowsRes.rows,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;

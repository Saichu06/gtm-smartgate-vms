const express = require('express');
const app = express();
const { Pool } = require('pg');
const bodyparser = require('body-parser');
const cors = require('cors');

// Middleware
app.use(cors());
app.use(bodyparser.json({ limit: '50mb' }));
app.use(bodyparser.urlencoded({ limit: "50mb", extended: true }));

// PostgreSQL connection pool
const pool = new Pool({
  user: 'postgres',        // your postgres username
  host: 'localhost',             // server name or IP (use 'localhost' if running locally)
  database: 'gtm_smartgate_demo',     // database name
  password: 'admin',// postgres password
  port: 5432,              // default PostgreSQL port
  options: '-c search_path=smartgate'  // 👈 sets default schema
});

// Middleware to attach pool to requests
app.use((req, res, next) => {
  req.db = pool;
  next();
});

app.use(async (req, res, next) => {
  try {
    const schemaName = req.headers['x-schema'] || 'smartgate';
    await req.db.query(`SET search_path TO ${schemaName}`);
    next();
  } catch (err) {
    next(err);
  }
});


// Example route to test connection
app.get('/test', async (req, res) => {
  try {
    const result = await req.db.query('SELECT NOW()');
    res.json({ message: 'Postgres connected!', time: result.rows[0].now });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Import your routes
const LoginRoutes = require('./expressRoutes/loginRoutes');
const MasterRoutes = require('./expressRoutes/masterRoutes');

app.use('/login', LoginRoutes);
app.use('/master', MasterRoutes);

// Start server
app.listen(4000, () => {
  console.log('Express server running with PostgreSQL at port 4000');
});

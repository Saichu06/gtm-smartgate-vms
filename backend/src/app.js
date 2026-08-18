require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./config/database');

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Centralized DB middleware for req.db
app.use((req, res, next) => {
  req.db = pool;
  next();
});

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Healthcheck Routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'gtm-smartgate-backend', timestamp: new Date() });
});

app.get('/api/health/db', async (req, res) => {
  try {
    const result = await req.db.query('SELECT NOW()');
    res.status(200).json({
      status: 'ok',
      database: 'connected',
      timestamp: result.rows[0].now,
    });
  } catch (err) {
    console.error('[DB HEALTHCHECK ERROR]', err.message);
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
    });
  }
});

// API Routes Mount Points — /api/v1 enterprise routes
const customerRoutes = require('./routes/customer.routes');
const userRoutes = require('./routes/user.routes');
const roleRoutes = require('./routes/role.routes');
const auditRoutes = require('./routes/audit.routes');
const settingsRoutes = require('./routes/settings.routes');

app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/roles', roleRoutes);
app.use('/api/v1/audit-logs', auditRoutes);
app.use('/api/v1/settings', settingsRoutes);

// Master Routes Mount Points — /master compatibility routes
const masterRoutes = require('../expressRoutes/masterRoutes');
const loginRoutes = require('../expressRoutes/loginRoutes');

app.use('/master', masterRoutes);
app.use('/master', loginRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ error: 'RESOURCE_NOT_FOUND', message: `Route ${req.originalUrl} not found.` });
});

module.exports = app;

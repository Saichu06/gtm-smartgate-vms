/**
 * Express Application Architecture Setup
 * Configures Express middlewares, Helmet, CORS, router mounts, error handlers.
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Healthcheck Route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'gtm-smartgate-backend', timestamp: new Date() });
});

// Import Routes
const authRoutes = require('./routes/auth.routes');
const masterRoutes = require('./routes/master.routes');
const visitorRoutes = require('./routes/visitor.routes');
const customerRoutes = require('./routes/customer.routes');
const userRoutes = require('./routes/user.routes');
const roleRoutes = require('./routes/role.routes');
const auditRoutes = require('./routes/audit.routes');
const settingsRoutes = require('./routes/settings.routes');
const reportRoutes = require('./routes/report.routes');
const testDatabaseRoutes = require('./routes/testDatabase.routes');

// API Routes Mount Points
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', masterRoutes);
app.use('/api/v1', visitorRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/roles', roleRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/audit-logs', auditRoutes);
app.use('/api/v1/settings', settingsRoutes);

// Development / Testing Database Inspection Endpoint
app.use('/api/test/database', testDatabaseRoutes);


// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'RESOURCE_NOT_FOUND',
      message: `Route ${req.originalUrl} not found.`,
    },
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[UNHANDLED ERROR]', err);
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production' ? 'An internal server error occurred' : err.message,
    },
  });
});

module.exports = app;

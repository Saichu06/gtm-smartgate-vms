/**
 * Express Application Architecture Setup
 * Configures Express middlewares, router mounts, error handlers.
 */
const express = require('express');
const cors = require('cors');

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Healthcheck Route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'gtm-smartgate-backend', timestamp: new Date() });
});

// API Routes Mount Points
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

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ error: 'RESOURCE_NOT_FOUND', message: `Route ${req.originalUrl} not found.` });
});

module.exports = app;

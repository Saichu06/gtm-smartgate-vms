/**
 * Authentication Middleware Placeholder
 * JWT token verification for protected API routes.
 */

const authenticate = (req, res, next) => {
  // TODO: Implement JWT verification using jsonwebtoken library
  // const token = req.headers['authorization']?.split(' ')[1];
  // if (!token) return res.status(401).json({ error: 'UNAUTHORIZED' });
  // jwt.verify(token, process.env.JWT_SECRET, (err, user) => { ... });
  next(); // Allow through in prototype phase
};

const authorize = (...roles) => (req, res, next) => {
  // TODO: Implement role-based access control (RBAC) gate
  next();
};

module.exports = { authenticate, authorize };

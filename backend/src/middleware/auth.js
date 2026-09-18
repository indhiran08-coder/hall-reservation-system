const jwt = require('jsonwebtoken');

/**
 * Middleware: Verifies JWT from Authorization header.
 * Attaches decoded user payload to req.user.
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please login.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, college_email, first_name, last_name, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token. Please login again.' });
  }
};

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'indhirans@velalarengg.ac.in').toLowerCase();

/**
 * Middleware: Requires the authenticated user to have role === 'admin'.
 * Must be used AFTER authenticate.
 */
const requireAdmin = (req, res, next) => {
  const isAdmin = req.user && (
    req.user.role === 'admin' ||
    (req.user.college_email && req.user.college_email.toLowerCase() === ADMIN_EMAIL)
  );
  if (!isAdmin) {
    return res.status(403).json({ error: 'Access Denied: You do not have administrator privileges.' });
  }
  next();
};

module.exports = { authenticate, requireAdmin };

import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Authentication Middleware
 *
 * IBM App ID integration note:
 * ----------------------------
 * Student/Company login uses IBM App ID (authorization code flow handled in
 * routes/appid.js). After a successful IBM login the backend issues its own
 * local JWT (signed with JWT_SECRET), which is what every API client sends.
 * Therefore this middleware keeps verifying local JWTs for all roles, and the
 * admin portal authenticates against the local database directly.
 */
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
      }

      // Local JWT verification (all API calls use our own signed tokens)
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretplacementportaltokenkey12345!');
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Defense in depth: the role embedded in the JWT must match the database record.
      // The DB is the source of truth; this guards against stale or tampered tokens.
      if (decoded.role && req.user.role !== decoded.role) {
        return res.status(401).json({ message: 'Not authorized, token role mismatch' });
      }

      return next();
    } catch (error) {
      console.error('Authentication Error:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  return res.status(401).json({ message: 'Not authorized, no token' });
};

// Check if user is approved (specifically for company accounts)
export const approved = (req, res, next) => {
  if (req.user && req.user.isApproved) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Account is pending admin approval.' });
  }
};

// Role-based authorization middlewares
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ message: `Access denied. Role '${req.user?.role}' is not authorized.` });
    }
  };
};

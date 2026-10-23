const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');
const ROLES = require('../utils/roles');

// Protect routes - requires a valid JWT
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user = null;
    if (decoded.role === ROLES.ADMIN) {
      user = await Admin.findById(decoded.id).select('-password');
    } else if (decoded.role === ROLES.USER) {
      user = await User.findById(decoded.id).select('-password');
    }

    if (!user) {
      return res
        .status(401)
        .json({ message: 'Not authorized, user not found' });
    }

    req.user = user;
    req.authRole = decoded.role;

    next();
  } catch (error) {
    console.error('JWT error', error);
    return res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};

// Role-based authorization
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.authRole || !allowedRoles.includes(req.authRole)) {
      return res
        .status(403)
        .json({ message: 'Forbidden: insufficient permissions' });
    }
    next();
  };
};

module.exports = {
  protect,
  authorizeRoles
};


const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const Admin = require('../models/Admin');
const User = require('../models/User');
const ROLES = require('../utils/roles');
const generateToken = require('../utils/generateToken');

// Helper to send validation errors
const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return null;
};

// Secure rule: only allow open admin registration if there are no admins yet
// After first admin is created, further admin accounts must be created by existing admins (separate endpoint, later).
const registerAdmin = async (req, res, next) => {
  try {
    const validationError = handleValidation(req, res);
    if (validationError) return;

    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      return res.status(403).json({
        message:
          'Admin registration is locked. Ask an existing admin to create new admins.'
      });
    }

    const { name, email, password } = req.body;

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      role: ROLES.ADMIN
    });

    const token = generateToken({ id: admin._id, role: admin.role });

    res.status(201).json({
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    next(error);
  }
};

const loginAdmin = async (req, res, next) => {
  try {
    const validationError = handleValidation(req, res);
    if (validationError) return;

    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken({ id: admin._id, role: admin.role });

    res.json({
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    next(error);
  }
};

const registerUser = async (req, res, next) => {
  try {
    const validationError = handleValidation(req, res);
    if (validationError) return;

    const { name, email, password, studentId, department } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      studentId,
      department,
      role: ROLES.USER
    });

    const token = generateToken({ id: user._id, role: user.role });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        department: user.department
      }
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const validationError = handleValidation(req, res);
    if (validationError) return;

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken({ id: user._id, role: user.role });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        department: user.department
      }
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res) => {
  // `protect` middleware already attached req.user
  res.json({
    user: req.user,
    role: req.authRole
  });
};

module.exports = {
  registerAdmin,
  loginAdmin,
  registerUser,
  loginUser,
  getMe
};


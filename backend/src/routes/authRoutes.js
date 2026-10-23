const express = require('express');
const { body } = require('express-validator');
const {
  registerAdmin,
  loginAdmin,
  registerUser,
  loginUser,
  getMe
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Validation rules
const emailRule = body('email').isEmail().withMessage('Valid email is required');
const passwordRule = body('password')
  .isLength({ min: 6 })
  .withMessage('Password must be at least 6 characters');
const nameRule = body('name')
  .notEmpty()
  .withMessage('Name is required')
  .isLength({ min: 2 })
  .withMessage('Name must be at least 2 characters');

// Admin auth
router.post(
  '/admin/register',
  [nameRule, emailRule, passwordRule],
  registerAdmin
);
router.post('/admin/login', [emailRule, passwordRule], loginAdmin);

// User auth
router.post(
  '/user/register',
  [nameRule, emailRule, passwordRule],
  registerUser
);
router.post('/user/login', [emailRule, passwordRule], loginUser);

// Get current authenticated user (admin or user)
router.get('/me', protect, getMe);

module.exports = router;


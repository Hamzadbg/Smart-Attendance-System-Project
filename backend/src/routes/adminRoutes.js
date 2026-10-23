const express = require('express');
const { body } = require('express-validator');
const {
  createUserByAdmin,
  getUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  addFaceDescriptor,
  getUserDescriptors,
  deleteDescriptor,
  listAttendance,
  exportAttendance
} = require('../controllers/adminController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const ROLES = require('../utils/roles');

const router = express.Router();

// All admin routes are protected and require admin role
router.use(protect, authorizeRoles(ROLES.ADMIN));

// User management
router.post(
  '/users',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
  ],
  createUserByAdmin
);

router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUserById);
router.delete('/users/:id', deleteUserById);

// Face descriptors
router.post('/face-descriptors', addFaceDescriptor);
router.get('/face-descriptors/user/:userId', getUserDescriptors);
router.delete('/face-descriptors/:id', deleteDescriptor);

// Attendance (view and export only; users mark their own attendance)
router.get('/attendance', listAttendance);
router.get('/attendance/export', exportAttendance);

module.exports = router;


const express = require('express');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const ROLES = require('../utils/roles');
const {
  getMyAttendance,
  getMyAttendanceStats,
  markMyAttendance
} = require('../controllers/userController');

const router = express.Router();

// All user routes are protected and require user role
router.use(protect, authorizeRoles(ROLES.USER));

router.get('/me/attendance', getMyAttendance);
router.get('/me/attendance/stats', getMyAttendanceStats);
router.post('/me/attendance/mark', markMyAttendance);

module.exports = router;


const Attendance = require('../models/Attendance');
const { toDateKey, toTimeString } = require('../utils/dateUtils');
const { findBestMatchForUser } = require('../utils/faceMatching');

const getMyAttendance = async (req, res, next) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const filter = { user: req.user._id };

    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) filter.date.$lte = new Date(dateTo);
    }

    const records = await Attendance.find(filter).sort({ date: -1 });
    res.json({ attendance: records });
  } catch (error) {
    next(error);
  }
};

const getMyAttendanceStats = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const y = parseInt(year || now.getFullYear(), 10);
    const m = parseInt(month || now.getMonth() + 1, 10);

    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59, 999);

    const records = await Attendance.find({
      user: req.user._id,
      date: { $gte: start, $lte: end }
    });

    const presentDays = new Set(records.map((r) => toDateKey(r.date))).size;

    const totalDaysInMonth = new Date(y, m, 0).getDate();
    const percentage =
      totalDaysInMonth > 0
        ? Math.round((presentDays / totalDaysInMonth) * 100)
        : 0;

    res.json({
      month: m,
      year: y,
      presentDays,
      totalDaysInMonth,
      attendancePercentage: percentage
    });
  } catch (error) {
    next(error);
  }
};

const markMyAttendance = async (req, res, next) => {
  try {
    const { descriptor } = req.body;
    if (!Array.isArray(descriptor) || !descriptor.length) {
      return res.status(400).json({
        message: 'Face descriptor is required.'
      });
    }

    const userId = req.user._id.toString();
    const result = await findBestMatchForUser(userId, descriptor);

    if (!result.matched) {
      if (result.reason === 'no_descriptors') {
        return res.status(400).json({
          message: 'No face data enrolled for your account. Ask admin to enroll your face first.'
        });
      }
      return res.status(403).json({
        message: 'Face does not match your account. Please try again or contact admin.'
      });
    }

    const now = new Date();
    const dateKey = toDateKey(now);
    const timeStr = toTimeString(now);

    try {
      const attendance = await Attendance.create({
        user: req.user._id,
        date: now,
        dateKey,
        time: timeStr,
        status: 'Present'
      });
      return res.status(201).json({
        message: 'Attendance marked successfully.',
        attendance: {
          id: attendance._id,
          date: attendance.date,
          time: attendance.time,
          status: attendance.status
        }
      });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({
          message: 'Attendance already marked for today.'
        });
      }
      throw err;
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyAttendance,
  getMyAttendanceStats,
  markMyAttendance
};


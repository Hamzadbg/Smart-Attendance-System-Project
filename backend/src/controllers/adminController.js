const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const { Parser: Json2CsvParser } = require('json2csv');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const FaceDescriptor = require('../models/FaceDescriptor');
const ROLES = require('../utils/roles');
const { toDateKey, toTimeString } = require('../utils/dateUtils');
const { findBestMatch } = require('../utils/faceMatching');

const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return null;
};

// ============ USER MANAGEMENT ============

const createUserByAdmin = async (req, res, next) => {
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

    res.status(201).json({
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

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

const updateUserById = async (req, res, next) => {
  try {
    const { name, email, studentId, department, password } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (studentId !== undefined) user.studentId = studentId;
    if (department !== undefined) user.department = department;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.json({
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

const deleteUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await FaceDescriptor.deleteMany({ user: user._id });
    await Attendance.deleteMany({ user: user._id });
    await user.deleteOne();

    res.json({ message: 'User and related data deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ============ FACE DESCRIPTORS ============

const addFaceDescriptor = async (req, res, next) => {
  try {
    const { userId, descriptor, label } = req.body;

    if (!userId || !Array.isArray(descriptor) || !descriptor.length) {
      return res.status(400).json({
        message: 'userId and non-empty descriptor array are required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const doc = await FaceDescriptor.create({
      user: user._id,
      label: label || user.name,
      descriptor
    });

    res.status(201).json({
      descriptor: {
        id: doc._id,
        user: doc.user,
        label: doc.label
      }
    });
  } catch (error) {
    next(error);
  }
};

const getUserDescriptors = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const descriptors = await FaceDescriptor.find({ user: userId }).select(
      '-descriptor'
    );
    res.json({ descriptors });
  } catch (error) {
    next(error);
  }
};

const deleteDescriptor = async (req, res, next) => {
  try {
    const doc = await FaceDescriptor.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ message: 'Descriptor not found' });
    }
    await doc.deleteOne();
    res.json({ message: 'Descriptor deleted' });
  } catch (error) {
    next(error);
  }
};

// ============ ATTENDANCE & REPORTS ============

const markAttendanceFromDescriptor = async (req, res, next) => {
  try {
    const { descriptor } = req.body;
    if (!Array.isArray(descriptor) || !descriptor.length) {
      return res.status(400).json({
        message: 'Descriptor array is required'
      });
    }

    const match = await findBestMatch(descriptor);
    if (!match) {
      return res.status(404).json({
        message: 'No attendance data found for this face'
      });
    }

    const now = new Date();
    const dateKey = toDateKey(now);
    const timeStr = toTimeString(now);

    try {
      const attendance = await Attendance.create({
        user: match.userId,
        date: now,
        dateKey,
        time: timeStr,
        status: 'Present'
      });

      const populated = await attendance.populate('user', 'name email studentId');

      return res.status(201).json({
        message: 'Attendance marked successfully',
        match: {
          userId: match.userId,
          distance: match.distance
        },
        attendance: {
          id: populated._id,
          user: populated.user,
          date: populated.date,
          time: populated.time,
          status: populated.status
        }
      });
    } catch (err) {
      if (err.code === 11000) {
        // Unique index violation: already marked today
        return res.status(409).json({
          message: 'Attendance already marked for this user today'
        });
      }
      throw err;
    }
  } catch (error) {
    next(error);
  }
};

const listAttendance = async (req, res, next) => {
  try {
    const { userId, dateFrom, dateTo } = req.query;

    const filter = {};
    if (userId) filter.user = userId;

    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) filter.date.$lte = new Date(dateTo);
    }

    const records = await Attendance.find(filter)
      .populate('user', 'name email studentId department')
      .sort({ date: -1 });

    res.json({ attendance: records });
  } catch (error) {
    next(error);
  }
};

const exportAttendance = async (req, res, next) => {
  try {
    const { format = 'csv', dateFrom, dateTo } = req.query;

    const filter = {};
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) filter.date.$lte = new Date(dateTo);
    }

    const records = await Attendance.find(filter)
      .populate('user', 'name email studentId department')
      .sort({ date: 1 });

    const plain = records.map((r) => ({
      name: r.user?.name,
      email: r.user?.email,
      studentId: r.user?.studentId,
      department: r.user?.department,
      date: toDateKey(r.date),
      time: r.time,
      status: r.status
    }));

    if (format === 'csv') {
      const parser = new Json2CsvParser({
        fields: ['name', 'email', 'studentId', 'department', 'date', 'time', 'status']
      });
      const csv = parser.parse(plain);
      res.header('Content-Type', 'text/csv');
      res.attachment('attendance.csv');
      return res.send(csv);
    }

    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Attendance');

      sheet.columns = [
        { header: 'Name', key: 'name', width: 25 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Student ID', key: 'studentId', width: 20 },
        { header: 'Department', key: 'department', width: 20 },
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Time', key: 'time', width: 12 },
        { header: 'Status', key: 'status', width: 12 }
      ];

      plain.forEach((row) => sheet.addRow(row));

      res.header(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.attachment('attendance.xlsx');

      await workbook.xlsx.write(res);
      return res.end();
    }

    if (format === 'pdf') {
      res.header('Content-Type', 'application/pdf');
      res.attachment('attendance.pdf');

      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      doc.pipe(res);

      doc.fontSize(18).text('Attendance Report', { align: 'center' });
      doc.moveDown();

      plain.forEach((row) => {
        doc
          .fontSize(10)
          .text(
            `${row.date} ${row.time} - ${row.name} (${row.email}) - ${row.status}`,
            { align: 'left' }
          );
      });

      doc.end();
      return;
    }

    return res
      .status(400)
      .json({ message: 'Invalid format. Use csv | excel | pdf' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUserByAdmin,
  getUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  addFaceDescriptor,
  getUserDescriptors,
  deleteDescriptor,
  markAttendanceFromDescriptor,
  listAttendance,
  exportAttendance
};


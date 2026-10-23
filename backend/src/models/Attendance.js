const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    dateKey: {
      type: String,
      required: true
      // Format: YYYY-MM-DD for easy uniqueness and filtering
    },
    time: {
      type: String,
      required: true
      // HH:mm:ss (server local time) or "HH:mm" if you prefer
    },
    status: {
      type: String,
      enum: ['Present'],
      default: 'Present'
    }
  },
  {
    timestamps: true
  }
);

attendanceSchema.index({ user: 1, dateKey: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);


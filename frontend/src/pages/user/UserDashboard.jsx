import React, { useEffect, useState } from 'react';
import { FaceCamera } from '../../components/FaceCamera';
import {
  fetchMyAttendance,
  fetchMyAttendanceStats,
  markMyAttendance
} from '../../api/userApi';

const UserDashboard = () => {
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [reportDateFrom, setReportDateFrom] = useState('');
  const [reportDateTo, setReportDateTo] = useState('');

  const loadReport = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (reportDateFrom) params.dateFrom = reportDateFrom;
      if (reportDateTo) params.dateTo = reportDateTo;
      const a = await fetchMyAttendance(params);
      setAttendance(a.attendance || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load your attendance data.');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    const params = {};
    if (filterMonth) params.month = filterMonth;
    if (filterYear) params.year = filterYear;
    try {
      const s = await fetchMyAttendanceStats(params);
      setStats(s);
    } catch (err) {
      setStats(null);
    }
  };

  useEffect(() => {
    loadReport();
  }, [reportDateFrom, reportDateTo]);

  useEffect(() => {
    loadStats();
  }, [filterMonth, filterYear]);

  const handleDescriptor = async (descriptor) => {
    setMessage('');
    setError('');
    try {
      const data = await markMyAttendance(descriptor);
      setMessage(data.message || 'Attendance marked successfully.');
      setShowCamera(false);
      loadReport();
      loadStats();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        'Could not mark attendance. Please try again.';
      setError(msg);
    }
  };

  return (
    <div className="page">
      <h1>My Attendance</h1>

      {/* Give Attendance - User action */}
      <section className="give-attendance-section">
        <h2>Give Attendance</h2>
        <p className="muted">
          Open the camera and capture your face to mark today&apos;s attendance. Your face must match the enrolled data.
        </p>
        {!showCamera ? (
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              setShowCamera(true);
              setMessage('');
              setError('');
            }}
          >
            Give Attendance (Open Camera)
          </button>
        ) : (
          <div className="camera-block">
            <FaceCamera
              mode="attendance"
              onDescriptor={handleDescriptor}
              onError={(err) => setError(err)}
            />
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowCamera(false)}
              style={{ marginTop: '0.5rem' }}
            >
              Cancel
            </button>
          </div>
        )}
        {message && <div className="success-box">{message}</div>}
        {error && <div className="error-box">{error}</div>}
      </section>

      {/* Read-only report: stats */}
      <section className="report-section">
        <h2>Attendance Summary</h2>
        <div className="filter-row">
          <label>Month</label>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          >
            <option value="">All</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <label>Year</label>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
          >
            <option value="">Current</option>
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        {stats && (
          <div className="cards-row">
            <div className="card">
              <p className="stat-value">
                {stats.attendancePercentage}
                <span className="stat-unit">%</span>
              </p>
              <p className="muted">
                {stats.presentDays} / {stats.totalDaysInMonth} days present
                {stats.month && ` (${stats.month}/${stats.year})`}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Read-only report: list with optional date filter */}
      <section className="report-section">
        <h2>My Attendance Report (Read-only)</h2>
        <div className="filter-row">
          <label>From</label>
          <input
            type="date"
            value={reportDateFrom}
            onChange={(e) => setReportDateFrom(e.target.value)}
          />
          <label>To</label>
          <input
            type="date"
            value={reportDateTo}
            onChange={(e) => setReportDateTo(e.target.value)}
          />
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((a) => (
                <tr key={a.id || a._id}>
                  <td>{a.date?.slice(0, 10)}</td>
                  <td>{a.time}</td>
                  <td>{a.status}</td>
                </tr>
              ))}
              {attendance.length === 0 && (
                <tr>
                  <td colSpan="3">No records in this range.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default UserDashboard;

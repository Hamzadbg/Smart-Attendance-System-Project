import React, { useEffect, useState } from 'react';
import {
  exportAttendance,
  fetchAttendance
} from '../../api/adminApi';

const AdminAttendancePage = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const loadAttendance = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      const data = await fetchAttendance(params);
      setAttendance(data.attendance || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load attendance data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [dateFrom, dateTo]);

  const handleDownload = async (format) => {
    try {
      const params = {};
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      const res = await exportAttendance(format, params);
      const blob = new Blob([res.data], { type: res.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const filename =
        (res.headers['content-disposition'] &&
          res.headers['content-disposition']
            .split('filename=')
            .pop()
            .replace(/"/g, '')) ||
        `attendance.${format === 'excel' ? 'xlsx' : format}`;
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError('Failed to download attendance report.');
    }
  };

  return (
    <div className="page">
      <h1>Attendance Records & Reports</h1>
      <p className="subtitle">
        View all attendance and download reports. Users mark their own attendance from their panel.
      </p>

      <div className="report-toolbar">
        <div className="filter-row">
          <label>From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <label>To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
        <div className="download-buttons">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => handleDownload('csv')}
          >
            Download CSV
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => handleDownload('excel')}
          >
            Download Excel
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => handleDownload('pdf')}
          >
            Download PDF
          </button>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}

      <h2>Attendance Records</h2>
      {loading ? (
        <p>Loading attendance...</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((a) => (
              <tr key={a.id || a._id}>
                <td>{a.user?.name}</td>
                <td>{a.user?.email}</td>
                <td>{a.date?.slice(0, 10)}</td>
                <td>{a.time}</td>
                <td>{a.status}</td>
              </tr>
            ))}
            {attendance.length === 0 && (
              <tr>
                <td colSpan="5">No attendance records yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminAttendancePage;

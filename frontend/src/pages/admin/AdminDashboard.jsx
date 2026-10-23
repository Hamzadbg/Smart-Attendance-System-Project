import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div className="page">
      <h1>Admin Dashboard</h1>
      <p className="subtitle">
        Manage users, enroll faces, and take attendance in real time.
      </p>
      <div className="cards-row">
        <div className="card">
          <h2>Users</h2>
          <p>Create, update, and manage all registered users.</p>
          <Link className="btn-secondary" to="/admin/users">
            Manage Users
          </Link>
        </div>
        <div className="card">
          <h2>Face Enrollment</h2>
          <p>Capture and store user face data using the webcam.</p>
          <Link className="btn-secondary" to="/admin/face-enroll">
            Enroll Faces
          </Link>
        </div>
        <div className="card">
          <h2>Attendance</h2>
          <p>Take attendance with live recognition and view reports.</p>
          <Link className="btn-secondary" to="/admin/attendance">
            Attendance & Reports
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;


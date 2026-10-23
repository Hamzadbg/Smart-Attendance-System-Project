import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="landing">
      <h1>Smart Attendance System</h1>
      <p className="subtitle">
        Face recognition based attendance with secure admin control.
      </p>
      <div className="cards-row">
        <div className="card">
          <h2>Admin</h2>
          <p>Manage users, enroll faces, and take attendance in real time.</p>
          <Link className="btn-primary" to="/auth/admin">
            Login as Admin
          </Link>
        </div>
        <div className="card">
          <h2>User</h2>
          <p>Register or login to view your attendance and statistics.</p>
          <Link className="btn-secondary" to="/auth/user">
            Login / Register as User
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;


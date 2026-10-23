import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../state/authContext';

export const Layout = ({ children }) => {
  const { role, user, logout } = useAuth();

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="logo">
          <Link to="/">Smart Attendance</Link>
        </div>
        <nav className="nav">
          {!role && (
            <>
              <NavLink to="/auth/admin">Admin Login</NavLink>
              <NavLink to="/auth/user">User Login / Register</NavLink>
            </>
          )}
          {role === 'admin' && (
            <>
              <NavLink to="/admin">Dashboard</NavLink>
              <NavLink to="/admin/users">Users</NavLink>
              <NavLink to="/admin/face-enroll">Face Enrollment</NavLink>
              <NavLink to="/admin/attendance">View Attendance</NavLink>
            </>
          )}
          {role === 'user' && (
            <>
              <NavLink to="/user">My Attendance</NavLink>
            </>
          )}
        </nav>
        <div className="user-info">
          {user ? (
            <>
              <span className="user-name">
                {user.name} ({role})
              </span>
              <button className="btn-secondary" onClick={logout}>
                Logout
              </button>
            </>
          ) : null}
        </div>
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
};


import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { adminLogin, adminRegisterBootstrap } from '../api/authApi';
import { useAuth } from '../state/authContext';
import { useApiStore } from '../api/client';

const AdminAuthPage = () => {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm();
  const { login } = useAuth();
  const setToken = useApiStore((s) => s.setToken);
  const [serverError, setServerError] = useState('');

  const onSubmit = async (values) => {
    setServerError('');
    try {
      let data;
      if (mode === 'login') {
        data = await adminLogin(values);
      } else {
        data = await adminRegisterBootstrap(values);
      }
      setToken(data.token);
      login({ token: data.token, role: 'admin', user: data.admin });
    } catch (err) {
      setServerError(
        err?.response?.data?.message || 'Something went wrong. Try again.'
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>{mode === 'login' ? 'Admin Login' : 'Initial Admin Setup'}</h2>
        <p className="muted">
          {mode === 'login'
            ? 'Login with your admin credentials.'
            : 'Only allowed when no admin exists; afterward, admins should create more admins from secure tools.'}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="form">
          {mode === 'register' && (
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                {...register('name', {
                  required: true
                })}
              />
              {errors.name && (
                <span className="error">
                  Name is required for registration.
                </span>
              )}
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              {...register('email', { required: true })}
              autoComplete="username"
            />
            {errors.email && (
              <span className="error">Valid email is required.</span>
            )}
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              {...register('password', { required: true, minLength: 6 })}
              autoComplete={
                mode === 'login' ? 'current-password' : 'new-password'
              }
            />
            {errors.password && (
              <span className="error">
                Password must be at least 6 characters.
              </span>
            )}
          </div>

          {serverError && <div className="error-box">{serverError}</div>}

          <button
            type="submit"
            className="btn-primary full-width"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Please wait...'
              : mode === 'login'
              ? 'Login'
              : 'Create Admin'}
          </button>
        </form>

        <div className="switcher">
          {mode === 'login' ? (
            <button
              type="button"
              className="link-button"
              onClick={() => setMode('register')}
            >
              Initial setup? Register first admin
            </button>
          ) : (
            <button
              type="button"
              className="link-button"
              onClick={() => setMode('login')}
            >
              Back to login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAuthPage;


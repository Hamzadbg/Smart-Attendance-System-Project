import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { userLogin, userRegister } from '../api/authApi';
import { useAuth } from '../state/authContext';
import { useApiStore } from '../api/client';

const UserAuthPage = () => {
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
        data = await userLogin(values);
      } else {
        data = await userRegister(values);
      }
      setToken(data.token);
      login({ token: data.token, role: 'user', user: data.user });
    } catch (err) {
      setServerError(
        err?.response?.data?.message || 'Something went wrong. Try again.'
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>{mode === 'login' ? 'User Login' : 'User Registration'}</h2>
        <p className="muted">
          {mode === 'login'
            ? 'Login to view your attendance records.'
            : 'Register to start tracking your attendance.'}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="form">
          {mode === 'register' && (
            <>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  {...register('name', { required: true })}
                  autoComplete="name"
                />
                {errors.name && (
                  <span className="error">Name is required.</span>
                )}
              </div>
              <div className="form-group">
                <label>Student / Employee ID (optional)</label>
                <input type="text" {...register('studentId')} />
              </div>
              <div className="form-group">
                <label>Department (optional)</label>
                <input type="text" {...register('department')} />
              </div>
            </>
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
              : 'Register'}
          </button>
        </form>

        <div className="switcher">
          {mode === 'login' ? (
            <button
              type="button"
              className="link-button"
              onClick={() => setMode('register')}
            >
              New here? Create an account
            </button>
          ) : (
            <button
              type="button"
              className="link-button"
              onClick={() => setMode('login')}
            >
              Already have an account? Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserAuthPage;


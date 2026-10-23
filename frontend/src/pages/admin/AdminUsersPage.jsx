import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { createUser, deleteUser, fetchUsers } from '../../api/adminApi';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm();

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchUsers();
      setUsers(data.users || []);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (values) => {
    setError('');
    try {
      await createUser(values);
      reset();
      await load();
    } catch (err) {
      setError(
        err?.response?.data?.message || 'Failed to create user, try again.'
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user and all related data?')) return;
    setError('');
    try {
      await deleteUser(id);
      await load();
    } catch (err) {
      setError(
        err?.response?.data?.message || 'Failed to delete user, try again.'
      );
    }
  };

  return (
    <div className="page">
      <h1>User Management</h1>
      <div className="grid-2">
        <div>
          <h2>Add User</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="form">
            <div className="form-group">
              <label>Name</label>
              <input type="text" {...register('name', { required: true })} />
              {errors.name && (
                <span className="error">Name is required.</span>
              )}
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" {...register('email', { required: true })} />
              {errors.email && (
                <span className="error">Email is required.</span>
              )}
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                {...register('password', { required: true, minLength: 6 })}
              />
              {errors.password && (
                <span className="error">
                  Password must be at least 6 characters.
                </span>
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
            {error && <div className="error-box">{error}</div>}
            <button
              type="submit"
              className="btn-primary full-width"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create User'}
            </button>
          </form>
        </div>
        <div>
          <h2>All Users</h2>
          {loading ? (
            <div>Loading users...</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>ID</th>
                  <th>Department</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id || u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.studentId}</td>
                    <td>{u.department}</td>
                    <td>
                      <button
                        className="btn-link danger"
                        onClick={() => handleDelete(u.id || u._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="5">No users yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;


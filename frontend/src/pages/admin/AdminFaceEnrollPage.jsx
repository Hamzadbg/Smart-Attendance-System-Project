import React, { useEffect, useState } from 'react';
import { FaceCamera } from '../../components/FaceCamera';
import { addFaceDescriptor, fetchUsers } from '../../api/adminApi';

const AdminFaceEnrollPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadUsers = async () => {
      setLoadingUsers(true);
      try {
        const data = await fetchUsers();
        setUsers(data.users || []);
      } catch (err) {
        setError('Failed to load users for enrollment.');
      } finally {
        setLoadingUsers(false);
      }
    };
    loadUsers();
  }, []);

  const handleDescriptor = async (descriptor) => {
    if (!selectedUserId) {
      setError('Select a user before capturing face.');
      return;
    }
    setError('');
    setMessage('Uploading descriptor...');
    try {
      await addFaceDescriptor({ userId: selectedUserId, descriptor });
      setMessage('Face descriptor saved successfully for this user.');
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          'Failed to save descriptor. Please try again.'
      );
      setMessage('');
    }
  };

  return (
    <div className="page">
      <h1>Face Enrollment</h1>
      <p className="subtitle">
        Select a user, then capture their face to store descriptors for future
        attendance.
      </p>
      <div className="grid-2">
        <div>
          <h2>Select User</h2>
          {loadingUsers ? (
            <p>Loading users...</p>
          ) : (
            <select
              className="select"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              <option value="">-- Choose user --</option>
              {users.map((u) => (
                <option key={u.id || u._id} value={u.id || u._id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          )}
          {error && <div className="error-box">{error}</div>}
          {message && <div className="success-box">{message}</div>}
          <p className="muted">
            You may capture multiple descriptors per user to improve robustness.
          </p>
        </div>
        <div>
          <h2>Webcam</h2>
          <FaceCamera onDescriptor={handleDescriptor} mode="enroll" />
        </div>
      </div>
    </div>
  );
};

export default AdminFaceEnrollPage;


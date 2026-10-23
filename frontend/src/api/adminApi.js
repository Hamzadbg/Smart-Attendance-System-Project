import api from './client';

export const fetchUsers = async () => {
  const res = await api.get('/admin/users');
  return res.data;
};

export const createUser = async (data) => {
  const res = await api.post('/admin/users', data);
  return res.data;
};

export const updateUser = async (id, data) => {
  const res = await api.put(`/admin/users/${id}`, data);
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await api.delete(`/admin/users/${id}`);
  return res.data;
};

export const addFaceDescriptor = async (payload) => {
  const res = await api.post('/admin/face-descriptors', payload);
  return res.data;
};

export const markAttendanceByDescriptor = async (payload) => {
  const res = await api.post('/admin/attendance/mark-by-descriptor', payload);
  return res.data;
};

export const fetchAttendance = async (params = {}) => {
  const res = await api.get('/admin/attendance', { params });
  return res.data;
};

export const exportAttendance = async (format = 'csv', params = {}) => {
  const res = await api.get('/admin/attendance/export', {
    params: { format, ...params },
    responseType: 'blob'
  });
  return res;
};



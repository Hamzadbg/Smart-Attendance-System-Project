import api from './client';

export const fetchMyAttendance = async (params = {}) => {
  const res = await api.get('/users/me/attendance', { params });
  return res.data;
};

export const fetchMyAttendanceStats = async (params = {}) => {
  const res = await api.get('/users/me/attendance/stats', { params });
  return res.data;
};

export const markMyAttendance = async (descriptor) => {
  const res = await api.post('/users/me/attendance/mark', { descriptor });
  return res.data;
};


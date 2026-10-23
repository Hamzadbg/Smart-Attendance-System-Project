import api from './client';

export const adminLogin = async (data) => {
  const res = await api.post('/auth/admin/login', data);
  return res.data;
};

export const adminRegisterBootstrap = async (data) => {
  const res = await api.post('/auth/admin/register', data);
  return res.data;
};

export const userRegister = async (data) => {
  const res = await api.post('/auth/user/register', data);
  return res.data;
};

export const userLogin = async (data) => {
  const res = await api.post('/auth/user/login', data);
  return res.data;
};


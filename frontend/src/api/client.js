import axios from 'axios';
import { create } from 'zustand';

// Simple axios wrapper with token injection

export const useApiStore = create((set) => ({
  token: null,
  setToken: (token) => set({ token })
}));

const api = axios.create({
  baseURL: '/api'
});

api.interceptors.request.use(
  (config) => {
    const { token } = useApiStore.getState();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;


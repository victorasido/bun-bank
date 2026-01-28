import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001', // Alamat Backend lo
  headers: {
    'Content-Type': 'application/json',
  },
});

// Middleware: Kalau ada token di localStorage, otomatis tempel ke request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5128/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: auto-attach Bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pawfinds-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

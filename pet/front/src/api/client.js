import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5128/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pawfinds-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (e) => {
    if (e.response?.status === 401) {
      const hadToken = !!localStorage.getItem('pawfinds-token');
      if (hadToken) {
        localStorage.removeItem('pawfinds-token');
        localStorage.removeItem('pawfinds-user');
        window.location.href = '/';
      }
    }
    return Promise.reject(e);
  }
);

export default api;

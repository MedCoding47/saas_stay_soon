import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5128/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sh-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (e) => {
    if (e.response?.status === 401) {
      if (localStorage.getItem('sh-token')) {
        localStorage.removeItem('sh-token');
        localStorage.removeItem('sh-role');
        localStorage.removeItem('sh-user');
        window.location.href = '/';
      }
    }
    return Promise.reject(e);
  }
);

export default api;

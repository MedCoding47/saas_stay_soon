import { useState } from 'react';
import api from '../api/client';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = async (email, password) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const user = data.user || data;
      localStorage.setItem('sh-token', data.token || data.accessToken);
      localStorage.setItem('sh-role', user.role);
      localStorage.setItem('sh-user', JSON.stringify(user));
      return user;
    } catch (err) {
      if (!err.response) {
        setError('Cannot connect to server. Make sure the backend is running.');
      } else {
        const msg = err.response?.data?.message || err.response?.data?.title || 'Invalid credentials';
        setError(msg);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file) => {
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.url;
    } catch (err) {
      if (!err.response) {
        setError('Cannot connect to server.');
      } else {
        setError(err.response?.data?.message || 'Upload failed');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.put('/auth/profile', profileData);
      localStorage.setItem('sh-user', JSON.stringify(data));
    } catch (err) {
      if (!err.response) {
        setError('Cannot connect to server.');
      } else {
        setError(err.response?.data?.message || err.response?.data?.title || 'Update failed');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (form) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/register', form);
      return data;
    } catch (err) {
      if (!err.response) {
        setError('Cannot connect to server. Make sure the backend is running.');
      } else {
        const body = err.response.data;
        const msg = typeof body === 'string' ? body : body?.message || body?.title || 'Registration failed';
        setError(msg);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { login, register, uploadImage, updateProfile, loading, error };
}

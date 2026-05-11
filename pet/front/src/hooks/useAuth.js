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
      const msg = err.response?.data?.message || err.response?.data?.title || 'Invalid credentials';
      setError(msg);
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
      const msg = err.response?.data?.message || err.response?.data?.title || 'Registration failed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { login, register, loading, error };
}

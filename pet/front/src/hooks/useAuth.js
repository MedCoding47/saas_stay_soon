import { useState, useCallback } from 'react';
import api from '../api/client';

export function useAuth() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('pawfinds-user') || 'null'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const userData = {
        id: data.userId || data.user?.id,
        email: data.email || data.user?.email || email,
        name: data.name || data.user?.name || data.user?.fullName || email.split('@')[0],
        fullName: data.fullName || data.user?.fullName || data.user?.name || email.split('@')[0],
        role: data.role || data.user?.role || 'Applicant',
        organizationId: data.organizationId || data.user?.organizationId,
      };
      localStorage.setItem('pawfinds-token', data.token);
      localStorage.setItem('pawfinds-user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.title || 'Login failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        email: userData.email,
        password: userData.password,
        fullName: userData.fullName,
        organizationId: userData.organizationId || '372fbbfe-ec4d-4024-23f7-08deae08aef0',
      };
      const { data } = await api.post('/auth/register', payload);
      const uData = {
        id: data.userId || data.user?.id,
        email: data.email || data.user?.email || userData.email,
        name: data.name || data.user?.name || data.user?.fullName || userData.fullName,
        fullName: data.fullName || data.user?.fullName || userData.fullName,
        role: data.role || data.user?.role || 'Applicant',
        organizationId: data.organizationId || data.user?.organizationId,
      };
      localStorage.setItem('pawfinds-token', data.token);
      localStorage.setItem('pawfinds-user', JSON.stringify(uData));
      setUser(uData);
      return uData;
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.title ||
        (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(', ') : null) ||
        'Registration failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('pawfinds-token');
    localStorage.removeItem('pawfinds-user');
    setUser(null);
  }, []);

  return { user, loading, error, login, register, logout };
}

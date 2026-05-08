import { createContext, useContext, useState, useEffect } from 'react';
import api from '../../config/api';
import { useNavigate } from 'react-router-dom';

const ClientAuthContext = createContext();

export const ClientAuthProvider = ({ children }) => {
  const [client, setClient] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('pawfinds-token'));
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();

  // Load user on mount / token change
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const { data } = await api.get('/auth/me');
          setClient(data);
        } catch (error) {
          console.error('Auth check failed:', error.response?.data || error.message);
          if (error.response?.status === 401) {
            await silentLogout();
          }
        }
      }
      setLoading(false);
      setAuthChecked(true);
    };
    checkAuth();
  }, [token]);

  const silentLogout = async () => {
    localStorage.removeItem('pawfinds-token');
    localStorage.removeItem('pawfinds-role');
    setToken(null);
    setClient(null);
  };

  const register = async (fullName, email, password) => {
    try {
      const { data } = await api.post('/auth/register', {
        fullName,
        email,
        password,
        organizationId: '6b419b38-8637-4e7c-726d-08deaac236d7' // TODO: make dynamic
      });
      localStorage.setItem('pawfinds-token', data.token);
      localStorage.setItem('pawfinds-role', data.role);
      setToken(data.token);
      setClient({
        id: data.userId,
        email,
        fullName,
        role: data.role,
        organizationId: data.organizationId
      });
      navigate('/client/dashboard');
    } catch (error) {
      console.error('Registration error:', error.response?.data);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('pawfinds-token', data.token);
      localStorage.setItem('pawfinds-role', data.role);
      setToken(data.token);
      // Fetch full user profile
      const { data: userData } = await api.get('/auth/me');
      setClient(userData);
      navigate('/client/dashboard');
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    await silentLogout();
    navigate('/client/login');
  };

  return (
    <ClientAuthContext.Provider value={{
      client,
      token,
      register,
      login,
      logout,
      loading,
      authChecked,
      isAuthenticated: !!client
    }}>
      {!authChecked ? null : children}
    </ClientAuthContext.Provider>
  );
};

export const useClientAuth = () => useContext(ClientAuthContext);

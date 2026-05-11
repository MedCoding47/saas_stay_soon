import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';

export function useAdoptions() {
  const [adoptions, setAdoptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAdoptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/adoptions');
      setAdoptions(data.items || data.$values || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load adoptions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAdoptions(); }, [fetchAdoptions]);

  const updateStatus = async (id, status) => {
    const { data } = await api.patch(`/adoptions/${id}/status`, { status });
    setAdoptions((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    return data;
  };

  return { adoptions, loading, error, fetchAdoptions, updateStatus };
}

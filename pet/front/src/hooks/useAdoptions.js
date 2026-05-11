import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';

export function useAdoptions() {
  const [adoptions, setAdoptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdoptions = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/adoptions');
      setAdoptions(data.items || data.$values || []);
    } catch {
      setAdoptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAdoptions(); }, [fetchAdoptions]);

  const updateStatus = async (id, status) => {
    await api.patch(`/adoptions/${id}/status`, { status });
    await fetchAdoptions();
  };

  const apply = async ({ petId, applicationMessage }) => {
    const { data } = await api.post('/adoptions/apply', { petId, applicationMessage });
    return data;
  };

  return { adoptions, loading, updateStatus, apply, refetch: fetchAdoptions };
}

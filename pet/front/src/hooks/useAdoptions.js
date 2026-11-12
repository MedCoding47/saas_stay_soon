import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';

export function useAdoptions() {
  const [adoptions, setAdoptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdoptions = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/adoptions');
      const items = data?.items ?? data?.$values ?? data ?? [];
      setAdoptions(Array.isArray(items) ? items : []);
    } catch {
      setAdoptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAdoptions(); }, [fetchAdoptions]);

  const apply = async ({ petId, adopterName, adopterPhone, adopterEmail, applicationMessage }) => {
    const { data } = await api.post('/adoptions', {
      petId,
      adopterName,
      adopterPhone,
      adopterEmail,
      applicationMessage
    });
    return data;
  };

  const updateStatus = async (id, status) => {
    await api.patch(`/adoptions/${id}`, { status });
    await fetchAdoptions();
  };

  return { adoptions, loading, updateStatus, apply, refetch: fetchAdoptions };
}

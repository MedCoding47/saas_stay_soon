import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';

export function usePets() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/pets');
      setPets(data.items || data.$values || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load pets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPets(); }, [fetchPets]);

  const createPet = async (petData) => {
    const { data } = await api.post('/pets', petData);
    setPets((prev) => [...prev, data]);
    return data;
  };

  const updatePet = async (id, petData) => {
    const { data } = await api.put(`/pets/${id}`, petData);
    setPets((prev) => prev.map((p) => (p.id === id ? data : p)));
    return data;
  };

  const deletePet = async (id) => {
    await api.delete(`/pets/${id}`);
    setPets((prev) => prev.filter((p) => p.id !== id));
  };

  return { pets, loading, error, fetchPets, createPet, updatePet, deletePet };
}

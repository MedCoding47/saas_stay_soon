import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';

export function usePets() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPets = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/pets');
      setPets(data.items || data.$values || []);
    } catch {
      setPets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPets(); }, [fetchPets]);

  const createPet = async (form) => {
    await api.post('/pets', form);
    await fetchPets();
  };

  const updatePet = async (id, form) => {
    await api.put(`/pets/${id}`, form);
    await fetchPets();
  };

  const deletePet = async (id) => {
    await api.delete(`/pets/${id}`);
    await fetchPets();
  };

  return { pets, loading, createPet, updatePet, deletePet, refetch: fetchPets };
}

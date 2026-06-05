import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';

const STORAGE_KEY = 'nino-favorites';

function loadStored() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState(loadStored);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const isFavorited = useCallback((petId) => {
    return favorites.some(f => String(f.id) === String(petId));
  }, [favorites]);

  const toggleFavorite = useCallback(async (pet) => {
    const id = String(pet.id);
    const exists = favorites.some(f => String(f.id) === id);
    if (exists) {
      setFavorites(prev => prev.filter(f => String(f.id) !== id));
    } else {
      const entry = { id: pet.id, name: pet.name, type: pet.type, breed: pet.breed, location: pet.location, imageUrl: pet.imageUrl, ageMonths: pet.ageMonths, addedAt: Date.now() };
      setFavorites(prev => [...prev, entry]);
    }
    try { await api.post('/favorites/toggle', { petId: pet.id }); } catch {}
  }, [favorites]);

  const removeFavorite = useCallback((petId) => {
    setFavorites(prev => prev.filter(f => String(f.id) !== String(petId)));
    try { api.post('/favorites/remove', { petId }).catch(() => {}); } catch {}
  }, []);

  const refreshFavorites = useCallback(async () => {
    try {
      const { data } = await api.get('/client/favorites');
      if (Array.isArray(data)) setFavorites(data);
    } catch {}
  }, []);

  return { favorites, isFavorited, toggleFavorite, removeFavorite, refreshFavorites };
}

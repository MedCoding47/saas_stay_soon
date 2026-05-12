import { useState, useMemo } from 'react';

const defaultFilters = { species: 'Tous', age: 'Tous', city: 'Tous', urgentOnly: false };

function matchesAge(pet, ageFilter) {
  if (ageFilter === 'Tous') return true;
  const months = pet.ageMonths;
  if (months == null) return false;
  switch (ageFilter) {
    case 'baby': return months < 6;
    case 'young': return months >= 6 && months <= 24;
    case 'adult': return months > 24 && months <= 84;
    case 'senior': return months > 84;
    default: return true;
  }
}

export default function usePetFilters(pets) {
  const [filters, setFilters] = useState(defaultFilters);

  const filtered = useMemo(() => {
    return pets.filter((pet) => {
      if (filters.species !== 'Tous' && pet.type !== filters.species) return false;
      if (filters.city !== 'Tous' && pet.city !== filters.city) return false;
      if (filters.urgentOnly && !pet.isUrgent) return false;
      if (!matchesAge(pet, filters.age)) return false;
      return true;
    });
  }, [pets, filters]);

  const resetFilters = () => setFilters(defaultFilters);

  return { filters, setFilters, filtered, count: filtered.length, resetFilters };
}

export default function FilterBar({ filters, onFilterChange }) {
  const update = (key, value) => onFilterChange?.({ ...filters, [key]: value });

  return (
    <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-warm-dark shadow-glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-wrap items-end gap-3">
          {/* Species */}
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs text-muted mb-1 font-medium">Espèce</label>
            <select
              value={filters.species}
              onChange={(e) => update('species', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-warm-dark bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral transition-all"
            >
              <option value="Tous">Tous</option>
              <option value="Dog">Chien</option>
              <option value="Cat">Chat</option>
            </select>
          </div>

          {/* Age */}
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs text-muted mb-1 font-medium">Âge</label>
            <select
              value={filters.age}
              onChange={(e) => update('age', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-warm-dark bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral transition-all"
            >
              <option value="Tous">Tous</option>
              <option value="baby">Bébé (&lt;6 mois)</option>
              <option value="young">Jeune (6-24 mois)</option>
              <option value="adult">Adulte (2-7 ans)</option>
              <option value="senior">Senior (7+ ans)</option>
            </select>
          </div>

          {/* City */}
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs text-muted mb-1 font-medium">Ville</label>
            <select
              value={filters.city}
              onChange={(e) => update('city', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-warm-dark bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral transition-all"
            >
              <option value="Tous">Toutes</option>
              <option value="Casablanca">Casablanca</option>
              <option value="Rabat">Rabat</option>
              <option value="Marrakech">Marrakech</option>
              <option value="Fès">Fès</option>
              <option value="Tanger">Tanger</option>
            </select>
          </div>

          {/* Urgent toggle */}
          <div className="flex items-center gap-2 pb-[2px]">
            <button
              onClick={() => update('urgentOnly', !filters.urgentOnly)}
              className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${
                filters.urgentOnly ? 'bg-urgent' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                  filters.urgentOnly ? 'translate-x-4' : ''
                }`}
              />
            </button>
            <span className="text-xs font-medium text-muted select-none">
              Urgent
              {filters.urgentOnly && <span className="ml-1 text-urgent">●</span>}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation, Trans } from 'react-i18next';
import { Search, MapPin } from 'lucide-react';
import api from '../../api/client';
import samplePets from '../../data/samplePets';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import PageTransition from '../../components/animations/PageTransition';
import Pagination from '../../components/ui/Pagination';
import { useFavorites } from '../../hooks/useFavorites';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const PAGE_SIZE = 9;
const NEW_THRESHOLD_DAYS = 14;

const defaultFilters = { species: '', age: '', size: '', gender: '', status: '', breed: '', shelter: '' };

const sortOptions = [
  { value: 'recent', label: 'Recent' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'name', label: 'Name A-Z' },
  { value: 'name_z', label: 'Name Z-A' },
];

const speciesOptions = ['Dog', 'Cat', 'Rabbit', 'Bird', 'Hamster', 'Fish', 'Turtle', 'Horse'];
const ageOptions = [
  { value: 'baby', label: 'Baby (under 1yr)' },
  { value: 'young', label: 'Young (1-3yrs)' },
  { value: 'adult', label: 'Adult (3-7yrs)' },
  { value: 'senior', label: 'Senior (7+yrs)' },
];
const sizeOptions = ['Small', 'Medium', 'Large'];
const genderOptions = ['Male', 'Female'];
const statusOptions = ['Available', 'Adopted', 'Pending'];

const shelterNames = ['SPA Casablanca', 'Refuge Rabat', 'Refuge Marrakech', 'Refuge Fès', 'Refuge Tanger'];

const speciesEmoji = {
  Dog: '🐕', Cat: '🐈', Rabbit: '🐰', Bird: '🐦', Parrot: '🦜',
  Hamster: '🐹', Fish: '🐟', Turtle: '🐢', Horse: '🐴',
};

function matchesAge(pet, filter) {
  if (!filter) return true;
  const m = pet.ageMonths;
  if (m == null) return false;
  switch (filter) {
    case 'baby': return m <= 12;
    case 'young': return m > 12 && m <= 36;
    case 'adult': return m > 36 && m <= 84;
    case 'senior': return m > 84;
    default: return true;
  }
}

function matchesSize(pet, filter) { if (!filter) return true; return pet.size === filter; }
function matchesGender(pet, filter) { if (!filter) return true; return pet.gender === filter; }
function matchesStatus(pet, filter) {
  if (!filter) return true;
  const s = typeof pet.status === 'string' ? pet.status : '';
  return s === filter;
}

export default function PetBrowser() {
  const { t } = useTranslation();
  const [allPets, setAllPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(defaultFilters);
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState('recent');
  const [page, setPage] = useState(1);
  const [selectedShelters, setSelectedShelters] = useState([]);
  const navigate = useNavigate();
  const { isFavorited, toggleFavorite } = useFavorites();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.get('/pets')
      .then(({ data }) => {
        if (!cancelled) {
          const list = Array.isArray(data) ? data : data.data || data.items || data.records || [];
          setAllPets(list);
        }
      })
      .catch(() => { if (!cancelled) setAllPets(samplePets); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const uniqueBreeds = useMemo(() => {
    const set = new Set(allPets.map(p => p.breed).filter(Boolean));
    return [...set].sort();
  }, [allPets]);

  const uniqueShelters = useMemo(() => {
    const set = new Set(allPets.map(p => p.shelterName || p.ownerName || p.location).filter(Boolean));
    return [...set];
  }, [allPets]);

  const shelterPetCounts = useMemo(() => {
    const counts = {};
    allPets.forEach(p => {
      const name = p.shelterName || p.ownerName || p.location;
      if (name) counts[name] = (counts[name] || 0) + 1;
    });
    return counts;
  }, [allPets]);

  const filtered = useMemo(() => {
    let list = allPets.filter((pet) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match = (pet.name || '').toLowerCase().includes(q) || (pet.breed || '').toLowerCase().includes(q);
        if (!match) return false;
      }
      if (filters.species && pet.type !== filters.species) return false;
      if (!matchesAge(pet, filters.age)) return false;
      if (!matchesSize(pet, filters.size)) return false;
      if (!matchesGender(pet, filters.gender)) return false;
      if (!matchesStatus(pet, filters.status)) return false;
      if (filters.breed && (pet.breed || '') !== filters.breed) return false;
      if (filters.shelter) {
        const s = pet.shelterName || pet.ownerName || pet.location || '';
        if (s !== filters.shelter) return false;
      }
      return true;
    });
    switch (sort) {
      case 'name': list = [...list].sort((a, b) => a.name?.localeCompare(b.name)); break;
      case 'name_z': list = [...list].sort((a, b) => b.name?.localeCompare(a.name)); break;
      case 'oldest': list = [...list].sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || '')); break;
      default: break;
    }
    return list;
  }, [allPets, filters, sort, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleReset = () => { setFilters(defaultFilters); setSearchQuery(''); setPage(1); };

  const isNewPet = (pet) => {
    if (!pet.createdAt) return false;
    const diff = Date.now() - new Date(pet.createdAt).getTime();
    return diff < NEW_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;
  };

  const petAgeLabel = (pet) => {
    const m = pet.ageMonths;
    if (m == null) return '';
    if (m < 12) return `${m}mo`;
    const y = Math.floor(m / 12);
    return `${y}yr`;
  };

  const [donationFrequency, setDonationFrequency] = useState('once');

  if (loading) {
    return (
      <PageTransition>
        <Navbar />
        <div className="min-h-screen pt-24 flex items-center justify-center bg-[#FAF7F2]">
          <LoadingSpinner text={t('common.loading')} />
        </div>
        <Footer />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <Navbar />
      <main className="min-h-screen bg-[#FAF7F2]">
        {/* SECTION 1 — HERO */}
        <section className="bg-[#0D0D0D] pt-20 pb-24 px-8">
          <div className="max-w-6xl mx-auto">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display font-black text-[56px] text-white leading-[0.9] tracking-tight">
              <Trans i18nKey="pets.browser.title">Find Your<br />Companion</Trans>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-white/50 text-lg mt-4 max-w-md">
              {t('pets.browser.subtitle')}
            </motion.p>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-6 flex gap-3 items-center">
              <span className="tag tag-coral">{t('pets.browser.count', { count: allPets.length })}</span>
            </motion.div>
          </div>
        </section>

        {/* SECTION 2 — STICKY SEARCH BAR */}
        <div className="sticky top-0 z-40 bg-white border-b border-[#E8E0D8] py-4 px-8 shadow-sm">
          <div className="max-w-6xl mx-auto flex items-center gap-4">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8c7e74]" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                placeholder={t('pets.browser.searchPlaceholder', 'Search by name or breed\u2026')}
                className="w-full bg-[#FAF7F2] border-2 border-[#E8E0D8] rounded-full pl-10 pr-4 py-3 text-sm text-[#0D0D0D] outline-none focus:border-[#0D0D0D] transition-colors placeholder-[#8c7e74]"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#b8aaa0] hover:text-[#0D0D0D] text-sm font-bold">\u2715</button>
              )}
            </div>
            <span className="tag tag-coral hidden sm:inline-flex">{filtered.length} {t('pets.browser.found')}</span>
          </div>
        </div>

        {/* SECTION 3 — MAIN CONTENT (SIDEBAR + GRID) */}
        <section className="max-w-6xl mx-auto px-8 py-10 flex gap-8">
          {/* LEFT SIDEBAR — FILTERS */}
          <aside className="hidden lg:block w-64 flex-shrink-0 self-start sticky top-28">
            {/* Species */}
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-[#8c7e74] mb-3 mt-0">{t('pets.browser.filter.species')}</p>
              <div className="border-b border-[#E8E0D8] pb-2 mb-3" />
              <div className="space-y-2">
                <label className="flex items-center cursor-pointer group">
                  <input type="radio" name="species" checked={!filters.species} onChange={() => setFilters(f => ({ ...f, species: '' }))} className="w-4 h-4 rounded-full border-2 border-[#E8E0D8] mr-2 cursor-pointer appearance-none checked:border-coral checked:bg-coral transition-colors" />
                  <span className="text-sm text-[#0D0D0D] cursor-pointer group-hover:text-coral transition-colors">{t('common.all')}</span>
                </label>
                {speciesOptions.map(s => (
                  <label key={s} className="flex items-center cursor-pointer group">
                    <input type="radio" name="species" checked={filters.species === s} onChange={() => setFilters(f => ({ ...f, species: s }))} className="w-4 h-4 rounded-full border-2 border-[#E8E0D8] mr-2 cursor-pointer appearance-none checked:border-coral checked:bg-coral transition-colors" />
                    <span className="text-sm text-[#0D0D0D] cursor-pointer group-hover:text-coral transition-colors">{t('species.' + s, s)}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Age */}
            <div className="mt-6">
              <p className="text-xs font-bold tracking-widest uppercase text-[#8c7e74] mb-3">{t('pets.browser.filter.age')}</p>
              <div className="border-b border-[#E8E0D8] pb-2 mb-3" />
              <div className="space-y-2">
                <label className="flex items-center cursor-pointer group">
                  <input type="radio" name="age" checked={!filters.age} onChange={() => setFilters(f => ({ ...f, age: '' }))} className="w-4 h-4 rounded-full border-2 border-[#E8E0D8] mr-2 cursor-pointer appearance-none checked:border-coral checked:bg-coral transition-colors" />
                  <span className="text-sm text-[#0D0D0D] cursor-pointer group-hover:text-coral transition-colors">{t('common.any')}</span>
                </label>
                {ageOptions.map(a => (
                  <label key={a.value} className="flex items-center cursor-pointer group">
                    <input type="radio" name="age" checked={filters.age === a.value} onChange={() => setFilters(f => ({ ...f, age: a.value }))} className="w-4 h-4 rounded-full border-2 border-[#E8E0D8] mr-2 cursor-pointer appearance-none checked:border-coral checked:bg-coral transition-colors" />
                    <span className="text-sm text-[#0D0D0D] cursor-pointer group-hover:text-coral transition-colors">{t('age.' + a.value, a.label)}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Size */}
            <div className="mt-6">
              <p className="text-xs font-bold tracking-widest uppercase text-[#8c7e74] mb-3">{t('common.size')}</p>
              <div className="border-b border-[#E8E0D8] pb-2 mb-3" />
              <div className="space-y-2">
                <label className="flex items-center cursor-pointer group">
                  <input type="radio" name="size" checked={!filters.size} onChange={() => setFilters(f => ({ ...f, size: '' }))} className="w-4 h-4 rounded-full border-2 border-[#E8E0D8] mr-2 cursor-pointer appearance-none checked:border-coral checked:bg-coral transition-colors" />
                  <span className="text-sm text-[#0D0D0D] cursor-pointer group-hover:text-coral transition-colors">{t('common.any')}</span>
                </label>
                {sizeOptions.map(s => (
                  <label key={s} className="flex items-center cursor-pointer group">
                    <input type="radio" name="size" checked={filters.size === s} onChange={() => setFilters(f => ({ ...f, size: s }))} className="w-4 h-4 rounded-full border-2 border-[#E8E0D8] mr-2 cursor-pointer appearance-none checked:border-coral checked:bg-coral transition-colors" />
                    <span className="text-sm text-[#0D0D0D] cursor-pointer group-hover:text-coral transition-colors">{t('size.' + s, s)}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Gender */}
            <div className="mt-6">
              <p className="text-xs font-bold tracking-widest uppercase text-[#8c7e74] mb-3">{t('common.gender')}</p>
              <div className="border-b border-[#E8E0D8] pb-2 mb-3" />
              <div className="space-y-2">
                <label className="flex items-center cursor-pointer group">
                  <input type="radio" name="gender" checked={!filters.gender} onChange={() => setFilters(f => ({ ...f, gender: '' }))} className="w-4 h-4 rounded-full border-2 border-[#E8E0D8] mr-2 cursor-pointer appearance-none checked:border-coral checked:bg-coral transition-colors" />
                  <span className="text-sm text-[#0D0D0D] cursor-pointer group-hover:text-coral transition-colors">{t('common.any')}</span>
                </label>
                {genderOptions.map(g => (
                  <label key={g} className="flex items-center cursor-pointer group">
                    <input type="radio" name="gender" checked={filters.gender === g} onChange={() => setFilters(f => ({ ...f, gender: g }))} className="w-4 h-4 rounded-full border-2 border-[#E8E0D8] mr-2 cursor-pointer appearance-none checked:border-coral checked:bg-coral transition-colors" />
                    <span className="text-sm text-[#0D0D0D] cursor-pointer group-hover:text-coral transition-colors">{t('gender.' + g, g)}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Breed */}
            {uniqueBreeds.length > 0 && (
              <div className="mt-6">
                <p className="text-xs font-bold tracking-widest uppercase text-[#8c7e74] mb-3">{t('common.breed')}</p>
                <div className="border-b border-[#E8E0D8] pb-2 mb-3" />
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  <label className="flex items-center cursor-pointer group">
                    <input type="radio" name="breed" checked={!filters.breed} onChange={() => setFilters(f => ({ ...f, breed: '' }))} className="w-4 h-4 rounded-full border-2 border-[#E8E0D8] mr-2 cursor-pointer appearance-none checked:border-coral checked:bg-coral transition-colors" />
                    <span className="text-sm text-[#0D0D0D] cursor-pointer group-hover:text-coral transition-colors">{t('common.any')}</span>
                  </label>
                  {uniqueBreeds.map(b => (
                    <label key={b} className="flex items-center cursor-pointer group">
                      <input type="radio" name="breed" checked={filters.breed === b} onChange={() => setFilters(f => ({ ...f, breed: b }))} className="w-4 h-4 rounded-full border-2 border-[#E8E0D8] mr-2 cursor-pointer appearance-none checked:border-coral checked:bg-coral transition-colors" />
                      <span className="text-sm text-[#0D0D0D] cursor-pointer group-hover:text-coral transition-colors truncate">{b}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
            {uniqueShelters.length > 0 && (
              <div className="mt-6">
                <p className="text-xs font-bold tracking-widest uppercase text-[#8c7e74] mb-3">{t('pets.browser.filter.location')}</p>
                <div className="border-b border-[#E8E0D8] pb-2 mb-3" />
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  <label className="flex items-center cursor-pointer group">
                    <input type="radio" name="shelter" checked={!filters.shelter} onChange={() => setFilters(f => ({ ...f, shelter: '' }))} className="w-4 h-4 rounded-full border-2 border-[#E8E0D8] mr-2 cursor-pointer appearance-none checked:border-coral checked:bg-coral transition-colors" />
                    <span className="text-sm text-[#0D0D0D] cursor-pointer group-hover:text-coral transition-colors">{t('common.any')}</span>
                  </label>
                  {uniqueShelters.map(s => (
                    <label key={s} className="flex items-center cursor-pointer group">
                      <input type="radio" name="shelter" checked={filters.shelter === s} onChange={() => setFilters(f => ({ ...f, shelter: s }))} className="w-4 h-4 rounded-full border-2 border-[#E8E0D8] mr-2 cursor-pointer appearance-none checked:border-coral checked:bg-coral transition-colors" />
                      <span className="text-sm text-[#0D0D0D] cursor-pointer group-hover:text-coral transition-colors truncate">{s}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Status */}
            <div className="mt-6">
              <p className="text-xs font-bold tracking-widest uppercase text-[#8c7e74] mb-3">{t('pets.browser.filter.status')}</p>
              <div className="border-b border-[#E8E0D8] pb-2 mb-3" />
              <div className="space-y-2">
                <label className="flex items-center cursor-pointer group">
                  <input type="radio" name="status" checked={!filters.status} onChange={() => setFilters(f => ({ ...f, status: '' }))} className="w-4 h-4 rounded-full border-2 border-[#E8E0D8] mr-2 cursor-pointer appearance-none checked:border-coral checked:bg-coral transition-colors" />
                  <span className="text-sm text-[#0D0D0D] cursor-pointer group-hover:text-coral transition-colors">{t('common.any')}</span>
                </label>
                {statusOptions.map(s => (
                  <label key={s} className="flex items-center cursor-pointer group">
                    <input type="radio" name="status" checked={filters.status === s} onChange={() => setFilters(f => ({ ...f, status: s }))} className="w-4 h-4 rounded-full border-2 border-[#E8E0D8] mr-2 cursor-pointer appearance-none checked:border-coral checked:bg-coral transition-colors" />
                    <span className="text-sm text-[#0D0D0D] cursor-pointer group-hover:text-coral transition-colors">{t('status.' + s, s)}</span>
                  </label>
                ))}
              </div>
            </div>

            <button onClick={handleReset} className="btn-dark w-full mt-6 rounded-2xl">{t('pets.browser.filter.apply')}</button>
            <span onClick={handleReset} className="text-coral text-sm text-center block w-full mt-3 hover:underline cursor-pointer">{t('pets.browser.filter.clear')}</span>
          </aside>

          {/* RIGHT CONTENT — GRID */}
          <div className="flex-1 min-w-0">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm font-semibold text-[#0D0D0D]">{filtered.length} {t('pets.browser.found')}</p>
              <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} className="bg-white border border-[#E8E0D8] rounded-full px-4 py-2 text-sm text-[#8c7e74] outline-none cursor-pointer">
                {sortOptions.map((opt) => (<option key={opt.value} value={opt.value}>{t('sort.' + opt.value, opt.label)}</option>))}
              </select>
            </div>

            {/* No results */}
            {paged.length === 0 ? (
              <div className="text-center py-20">
                <span className="text-6xl">\uD83D\uDD0D</span>
                <h2 className="font-display font-bold text-2xl text-[#0D0D0D] mt-4">{t('pets.browser.noResults')}</h2>
                <p className="text-[#8c7e74] mt-2">{t('pets.browser.noResultsHint', 'Try adjusting your filters')}</p>
                <button onClick={handleReset} className="btn-outline mt-6 rounded-2xl px-8 py-3">{t('pets.browser.filter.clear')}</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {paged.map((pet, i) => (
                  <motion.div
                    key={pet.id || i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-3xl border border-[#E8E0D8] overflow-hidden cursor-pointer group hover:-translate-y-1 hover:shadow-card-hover transition-all duration-300"
                    onClick={() => navigate('/pets/' + pet.id)}
                  >
                    {/* Image area */}
                    <div className="relative bg-[#FAF7F2] h-52 flex items-center justify-center overflow-hidden">
                      <span className="text-8xl group-hover:scale-110 transition-transform duration-500">{speciesEmoji[pet.type] || '\uD83D\uDC3E'}</span>
                      {/* Status badge */}
                      <div className="absolute top-3 left-3">
                        {pet.isSos ? (
                          <span className="bg-coral text-white text-xs font-bold px-3 py-1 rounded-full">{t('pets.details.sos')}</span>
                        ) : pet.status === 'Available' ? (
                          <span className="bg-teal-500 text-white text-xs font-bold px-3 py-1 rounded-full">{t('common.available', 'Available')}</span>
                        ) : pet.status === 'Adopted' ? (
                          <span className="bg-[#8c7e74] text-white text-xs font-bold px-3 py-1 rounded-full">{t('status.Adopted', 'Adopted')}</span>
                        ) : pet.status === 'Pending' ? (
                          <span className="bg-amber-400 text-white text-xs font-bold px-3 py-1 rounded-full">{t('status.Pending', 'Pending')}</span>
                        ) : null}
                      </div>
                      {/* Favorite */}
                      <button onClick={(e) => { e.stopPropagation(); toggleFavorite(pet); }} className={'absolute top-3 right-3 w-8 h-8 rounded-full bg-white border border-[#E8E0D8] flex items-center justify-center text-sm hover:border-coral hover:text-coral transition-colors' + (isFavorited(pet.id) ? ' border-coral bg-coral text-white' : '')}>
                        {isFavorited(pet.id) ? '\u2665' : '\u2661'}
                      </button>
                    </div>
                    {/* Card body */}
                    <div className="p-5">
                      <div className="flex items-start justify-between">
                        <h3 className="font-bold text-lg text-[#0D0D0D]">{pet.name}</h3>
                        <span className="tag tag-outline text-xs">{pet.type || t('common.pet')}</span>
                      </div>
                      <p className="text-sm text-[#8c7e74] mt-0.5">{pet.breed || t('common.mixedBreed')}</p>
                      <div className="flex items-center gap-1 mt-2 text-xs text-[#8c7e74]">
                        <MapPin size={12} />
                        <span>{pet.location || t('common.morocco')}</span>
                      </div>
                      <div className="border-t border-[#E8E0D8] mt-4 pt-4">
                        <button onClick={(e) => { e.stopPropagation(); navigate('/pets/' + pet.id); }} className="btn-dark w-full rounded-xl py-3 text-sm">{t('pets.browser.adopt')}</button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            <Pagination current={page} total={totalPages} onChange={setPage} />
          </div>
        </section>

        {/* SECTION 4 — SHELTER MAP + FILTER */}
        <section className="bg-white border-y border-[#E8E0D8] py-16 px-8">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-start">
            {/* Left — Map */}
            <div>
              <h2 className="font-display font-bold text-2xl text-[#0D0D0D] mb-6">{t('pets.browser.shelterMap', 'Find a shelter near you')}</h2>
              <div className="rounded-3xl overflow-hidden border border-[#E8E0D8] h-72 bg-[#FAF7F2] flex items-center justify-center">
                <p className="text-[#8c7e74] text-sm">{t('pets.browser.mapPlaceholder', 'Map loading\u2026')}</p>
              </div>
              <button className="btn-outline mt-4 rounded-2xl px-6 py-3 text-sm">{t('pets.browser.getDirections', 'Get directions')}</button>
            </div>
            {/* Right — Shelter checklist */}
            <div>
              <h3 className="font-bold text-lg text-[#0D0D0D] mb-4">{t('pets.browser.filterByShelter', 'Filter by shelter')}</h3>
              {uniqueShelters.length > 0 ? (
                <>
                  {uniqueShelters.map(s => (
                    <label key={s} className="flex items-center gap-3 py-3 border-b border-[#E8E0D8] last:border-0 cursor-pointer">
                      <input type="checkbox" checked={selectedShelters.includes(s)} onChange={() => setSelectedShelters(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])} className="w-5 h-5 rounded border-2 border-[#E8E0D8] appearance-none checked:bg-coral checked:border-coral cursor-pointer transition-colors" />
                      <span className="text-sm font-medium text-[#0D0D0D]">{s}</span>
                      <span className="ml-auto tag tag-outline text-xs">{shelterPetCounts[s] || 0} {t('common.pets')}</span>
                    </label>
                  ))}
                  <button onClick={() => { handleReset(); }} className="btn-dark w-full mt-6 rounded-2xl">{t('pets.browser.applyShelterFilter', 'Apply shelter filter')}</button>
                </>
              ) : (
                <p className="text-[#8c7e74] text-sm">{t('pets.browser.noShelters', 'No shelters available')}</p>
              )}
            </div>
          </div>
        </section>

        {/* SECTION 5 — PREPARE YOUR ADOPTION */}
        <section className="bg-[#FAF7F2] py-20 px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-display font-black text-display-sm text-[#0D0D0D]">
              {t('pets.browser.prepareTitle', 'Prepare Your Adoption')}
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-[#8c7e74] text-lg mt-3 mb-12">
              {t('pets.browser.prepareSubtitle', 'Adopting a pet is a lifetime commitment. Make sure you are ready.')}
            </motion.p>
            <div className="grid grid-cols-3 gap-6">
              {[
                { num: '01', icon: '\uD83D\uDCCB', titleKey: 'pets.browser.prepare.step1_title', title: 'Create your profile', descKey: 'pets.browser.prepare.step1_desc', desc: 'Sign up and tell us about your lifestyle so we can find the perfect match.' },
                { num: '02', icon: '\u2705', titleKey: 'pets.browser.prepare.step2_title', title: 'Meet your companion', descKey: 'pets.browser.prepare.step2_desc', desc: 'Visit the shelter, interact with the pet, and make sure it is the right fit.' },
                { num: '03', icon: '\uD83D\uDCDD', titleKey: 'pets.browser.prepare.step3_title', title: 'Complete the adoption', descKey: 'pets.browser.prepare.step3_desc', desc: 'Sign the CEC, provide the required documents, and welcome your new family member.' },
              ].map((step, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 * i }} className="bg-white rounded-3xl border border-[#E8E0D8] p-8 text-center">
                  <p className="font-display font-black text-[64px] text-[#E8E0D8] leading-none">{step.num}</p>
                  <span className="text-4xl block mt-2">{step.icon}</span>
                  <h3 className="font-bold text-[#0D0D0D] mt-3 text-lg">{t(step.titleKey, step.title)}</h3>
                  <p className="text-[#8c7e74] text-sm mt-2 leading-relaxed">{t(step.descKey, step.desc)}</p>
                </motion.div>
              ))}
            </div>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <a href={localStorage.getItem('sh-token') ? '/client/dashboard' : '/login/client'} className="btn-dark mt-10 px-10 py-4 inline-flex items-center gap-2 rounded-2xl">
                {t('pets.browser.createAccount', 'Create my adopter account')} \u2192
              </a>
            </motion.div>
          </div>
        </section>

        {/* SECTION 6 — DONATION STRIP */}
        <section className="bg-[#0D0D0D] py-20 px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-display font-black text-display-sm text-white">
              {t('pets.browser.donationTitle')}
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-white/50 text-lg mt-3 mb-12">
              {t('pets.browser.donationSubtitle')}
            </motion.p>
            {/* Frequency toggle */}
            <div className="inline-flex bg-white/10 rounded-full p-1">
              <button onClick={() => setDonationFrequency('once')} className={'px-6 py-2 rounded-full text-sm font-medium transition-colors' + (donationFrequency === 'once' ? ' bg-coral text-white' : ' text-white/50')}>
                {t('pets.browser.donationOnce', 'One-time')}
              </button>
              <button onClick={() => setDonationFrequency('monthly')} className={'px-6 py-2 rounded-full text-sm font-medium transition-colors' + (donationFrequency === 'monthly' ? ' bg-coral text-white' : ' text-white/50')}>
                {t('pets.browser.donationMonthly', 'Monthly')}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-5 mt-8">
              {[{ amt: '$5' }, { amt: '$20' }, { amt: '$50' }].map((d, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center hover:border-coral/50 transition-colors cursor-pointer">
                  <p className="font-display font-black text-[56px] text-white leading-none">{d.amt}</p>
                  <p className="text-white/30 text-xs mt-1">{t('common.taxDeductible')}</p>
                  <a href={'https://paypal.me/Medmoney642/' + d.amt.replace('$', '')} target="_blank" rel="noopener noreferrer" className="btn-coral w-full mt-6 rounded-2xl text-sm inline-block">{t('pets.browser.donate')}</a>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </PageTransition>
  );
}

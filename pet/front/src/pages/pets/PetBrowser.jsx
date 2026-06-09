import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation, Trans } from 'react-i18next';
import api from '../../api/client';
import samplePets from '../../data/samplePets';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import PageTransition from '../../components/animations/PageTransition';
import Pagination from '../../components/ui/Pagination';
import { useFavorites } from '../../hooks/useFavorites';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const PAGE_SIZE = 9;

const defaultFilters = { species: '', age: '', size: '', gender: '', status: '' };

const sortOptions = [
  { value: 'recent', label: 'Recent' },
  { value: 'name', label: 'Name A-Z' },
  { value: 'age', label: 'Age' },
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

  const filtered = useMemo(() => {
    let list = allPets.filter((pet) => {
      if (filters.species && pet.type !== filters.species) return false;
      if (!matchesAge(pet, filters.age)) return false;
      if (!matchesSize(pet, filters.size)) return false;
      if (!matchesGender(pet, filters.gender)) return false;
      if (!matchesStatus(pet, filters.status)) return false;
      return true;
    });
    switch (sort) {
      case 'name': list = [...list].sort((a, b) => a.name?.localeCompare(b.name)); break;
      case 'age': list = [...list].sort((a, b) => (a.ageMonths || 0) - (b.ageMonths || 0)); break;
      default: break;
    }
    return list;
  }, [allPets, filters, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleReset = () => { setFilters(defaultFilters); setPage(1); };

  const petAgeLabel = (pet) => {
    const m = pet.ageMonths;
    if (m == null) return '';
    if (m < 12) return `${m}mo`;
    const y = Math.floor(m / 12);
    return `${y}yr`;
  };

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
        {/* HERO */}
        <section className="bg-[#0D0D0D] py-16 px-8">
          <div className="max-w-6xl mx-auto">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display font-black text-[56px] text-white leading-[0.9] tracking-tight">
              <Trans i18nKey="pets.browser.title">Find Your<br />Companion</Trans>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-white/50 text-lg mt-4 max-w-md">
              {t('pets.browser.subtitle')}
            </motion.p>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-6">
              <span className="tag tag-coral">{t('pets.browser.count', { count: allPets.length })}</span>
            </motion.div>
          </div>
        </section>

        {/* MAIN CONTENT */}
        <section className="max-w-6xl mx-auto px-8 py-12">
          <div className="flex gap-10">
            {/* FILTER SIDEBAR */}
            <div className="hidden lg:block w-72 flex-shrink-0">
              <div className="bg-white border border-[#E8E0D8] rounded-3xl overflow-hidden">
                {/* Species */}
                <div className="border-b border-[#E8E0D8] py-6 px-6">
                  <p className="text-xs font-bold tracking-widest uppercase text-[#8c7e74] mb-3">{t('pets.browser.filter.species')}</p>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="species" checked={!filters.species} onChange={() => setFilters(f => ({ ...f, species: '' }))} className="w-4 h-4 border-2 border-[#E8E0D8] rounded-full appearance-none checked:border-coral checked:bg-coral transition-colors cursor-pointer" />
                      <span className="text-sm text-[#0D0D0D] font-medium">{t('common.all')}</span>
                    </label>
                    {speciesOptions.map(s => (
                      <label key={s} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="species" checked={filters.species === s} onChange={() => setFilters(f => ({ ...f, species: s }))} className="w-4 h-4 border-2 border-[#E8E0D8] rounded-full appearance-none checked:border-coral checked:bg-coral transition-colors cursor-pointer" />
                        <span className="text-sm text-[#0D0D0D] font-medium">{t('species.' + s, s)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Age */}
                <div className="border-b border-[#E8E0D8] py-6 px-6">
                  <p className="text-xs font-bold tracking-widest uppercase text-[#8c7e74] mb-3">{t('pets.browser.filter.age')}</p>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="age" checked={!filters.age} onChange={() => setFilters(f => ({ ...f, age: '' }))} className="w-4 h-4 border-2 border-[#E8E0D8] rounded-full appearance-none checked:border-coral checked:bg-coral transition-colors cursor-pointer" />
                      <span className="text-sm text-[#0D0D0D] font-medium">{t('common.any')}</span>
                    </label>
                    {ageOptions.map(a => (
                      <label key={a.value} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="age" checked={filters.age === a.value} onChange={() => setFilters(f => ({ ...f, age: a.value }))} className="w-4 h-4 border-2 border-[#E8E0D8] rounded-full appearance-none checked:border-coral checked:bg-coral transition-colors cursor-pointer" />
                        <span className="text-sm text-[#0D0D0D] font-medium">{t('age.' + a.value, a.label)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Size */}
                <div className="border-b border-[#E8E0D8] py-6 px-6">
                  <p className="text-xs font-bold tracking-widest uppercase text-[#8c7e74] mb-3">{t('common.size')}</p>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="size" checked={!filters.size} onChange={() => setFilters(f => ({ ...f, size: '' }))} className="w-4 h-4 border-2 border-[#E8E0D8] rounded-full appearance-none checked:border-coral checked:bg-coral transition-colors cursor-pointer" />
                      <span className="text-sm text-[#0D0D0D] font-medium">{t('common.any')}</span>
                    </label>
                    {sizeOptions.map(s => (
                      <label key={s} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="size" checked={filters.size === s} onChange={() => setFilters(f => ({ ...f, size: s }))} className="w-4 h-4 border-2 border-[#E8E0D8] rounded-full appearance-none checked:border-coral checked:bg-coral transition-colors cursor-pointer" />
                        <span className="text-sm text-[#0D0D0D] font-medium">{t('size.' + s, s)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Gender */}
                <div className="border-b border-[#E8E0D8] py-6 px-6">
                  <p className="text-xs font-bold tracking-widest uppercase text-[#8c7e74] mb-3">{t('common.gender')}</p>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="gender" checked={!filters.gender} onChange={() => setFilters(f => ({ ...f, gender: '' }))} className="w-4 h-4 border-2 border-[#E8E0D8] rounded-full appearance-none checked:border-coral checked:bg-coral transition-colors cursor-pointer" />
                      <span className="text-sm text-[#0D0D0D] font-medium">{t('common.any')}</span>
                    </label>
                    {genderOptions.map(g => (
                      <label key={g} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="gender" checked={filters.gender === g} onChange={() => setFilters(f => ({ ...f, gender: g }))} className="w-4 h-4 border-2 border-[#E8E0D8] rounded-full appearance-none checked:border-coral checked:bg-coral transition-colors cursor-pointer" />
                        <span className="text-sm text-[#0D0D0D] font-medium">{t('gender.' + g, g)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div className="border-b border-[#E8E0D8] py-6 px-6">
                  <p className="text-xs font-bold tracking-widest uppercase text-[#8c7e74] mb-3">{t('pets.browser.filter.status')}</p>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="status" checked={!filters.status} onChange={() => setFilters(f => ({ ...f, status: '' }))} className="w-4 h-4 border-2 border-[#E8E0D8] rounded-full appearance-none checked:border-coral checked:bg-coral transition-colors cursor-pointer" />
                      <span className="text-sm text-[#0D0D0D] font-medium">{t('common.any')}</span>
                    </label>
                    {statusOptions.map(s => (
                      <label key={s} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="status" checked={filters.status === s} onChange={() => setFilters(f => ({ ...f, status: s }))} className="w-4 h-4 border-2 border-[#E8E0D8] rounded-full appearance-none checked:border-coral checked:bg-coral transition-colors cursor-pointer" />
                        <span className="text-sm text-[#0D0D0D] font-medium">{t('status.' + s, s)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="p-6">
                  <button onClick={handleReset} className="btn-dark w-full rounded-2xl">{t('pets.browser.filter.apply')}</button>
                  <button onClick={handleReset} className="text-sm text-coral hover:underline mt-3 block w-full text-center">{t('pets.browser.filter.clear')}</button>
                </div>
              </div>
            </div>

            {/* PET CARDS GRID */}
            <div className="flex-1 min-w-0">
              {/* Top bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <p className="text-sm text-[#8c7e74]">
                  <strong className="text-[#0D0D0D]">{filtered.length}</strong> {t('pets.browser.found', { count: filtered.length })}
                </p>
                <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} className="px-4 py-2.5 rounded-xl border-2 border-[#E8E0D8] bg-white text-sm text-[#0D0D0D] outline-none focus:border-[#0D0D0D] transition-colors cursor-pointer">
                  {sortOptions.map((opt) => (<option key={opt.value} value={opt.value}>{t('sort.' + opt.value, opt.label)}</option>))}
                </select>
              </div>

              {/* Grid */}
              {paged.length === 0 ? (
                <p className="text-center text-[#8c7e74] py-20">{t('pets.browser.noResults')}</p>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {paged.map((pet, i) => {
                    const imgSrc = pet.imageUrl || pet.mainImageUrl;
                    return (
                    <motion.div
                      key={pet.id || i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => navigate(`/pets/${pet.id}`)}
                      className="bg-white rounded-3xl border border-[#E8E0D8] overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-card-hover transition-all duration-300 group"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-[#FAF7F2]">
                        {imgSrc ? (
                          <img src={imgSrc} alt={pet.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-6xl">{speciesEmoji[pet.type] || '🐾'}</div>
                        )}
                        {pet.isSos && (
                          <span className="absolute top-3 left-3 bg-coral text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-widest shadow-md z-10">{t('pets.details.sos')}</span>
                        )}
                        {pet.status === 'Available' && !pet.isSos && (
                          <span className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-widest shadow-md z-10">{t('common.available')}</span>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); toggleFavorite(pet); }} className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border flex items-center justify-center text-sm transition-all shadow-sm hover:scale-110 ${
                          isFavorited(pet.id) ? 'border-coral bg-coral text-white' : 'border-[#E8E0D8] hover:border-coral hover:text-coral'
                        }`}>{isFavorited(pet.id) ? '♥' : '♡'}</button>
                        <div className="absolute bottom-3 right-3 flex gap-1.5">
                          {pet.gender && <span className="bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-0.5 text-[11px] font-bold text-[#0D0D0D]">{pet.gender === 'Male' ? '♂' : '♀'}</span>}
                          {pet.ageMonths != null && <span className="bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-0.5 text-[11px] font-bold text-[#0D0D0D]">{petAgeLabel(pet)}</span>}
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-bold text-lg text-[#0D0D0D] truncate">{pet.name}</h3>
                            <p className="text-sm text-[#8c7e74] mt-0.5 truncate">{pet.breed || t('common.mixedBreed')}</p>
                          </div>
                          <span className="tag px-3 py-1 rounded-full bg-[#FAF7F2] text-[#8c7e74] border border-[#E8E0D8] text-[10px] font-bold tracking-widest uppercase shrink-0">{pet.type || t('common.pet')}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-2 text-xs text-[#b8aaa0]">
                          <span>📍</span>
                          <span className="truncate">{pet.location || t('common.morocco')}</span>
                          {pet.size && <><span className="text-[#E8E0D8]">·</span><span className="capitalize">{t('size.' + pet.size, pet.size)}</span></>}
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); navigate(`/pets/${pet.id}`); }} className="btn-dark w-full mt-4 rounded-xl py-3 text-sm">{t('pets.browser.adopt')}</button>
                      </div>
                    </motion.div>
                    );
                  })}
                </div>
              )}

              <Pagination current={page} total={totalPages} onChange={setPage} />
            </div>
          </div>
        </section>

        {/* SHELTER FILTER SECTION */}
        <section className="bg-white border-t border-[#E8E0D8] py-12 px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-display font-bold text-2xl text-[#0D0D0D] mb-6">{t('pets.browser.filter.location')}</h2>
            <div className="flex flex-wrap gap-3">
              {shelterNames.map((name) => {
                const active = selectedShelters.includes(name);
                return (
                  <button
                    key={name}
                    onClick={() => setSelectedShelters(prev => prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name])}
                    className={`px-5 py-2.5 rounded-full text-sm font-semibold border transition-all duration-200 ${
                      active ? 'bg-[#0D0D0D] text-[#FAF7F2] border-[#0D0D0D]' : 'bg-transparent text-[#8c7e74] border-[#E8E0D8] hover:border-[#0D0D0D] hover:text-[#0D0D0D]'
                    }`}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* DONATION SECTION */}
        <section className="bg-[#0D0D0D] py-16 px-8">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="font-display font-black text-display-sm text-white">{t('pets.browser.donationTitle')}</h2>
            <p className="text-white/40 text-lg mt-4 mb-12 max-w-lg mx-auto">{t('pets.browser.donationSubtitle')}</p>
            <div className="grid md:grid-cols-3 gap-5 max-w-3xl mx-auto">
              {[{ amt: '$5' }, { amt: '$20' }, { amt: '$50' }].map((d, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center">
                  <p className="font-display font-black text-5xl text-white">{d.amt}</p>
                  <p className="text-white/30 text-xs mt-1">{t('common.taxDeductible')}</p>
                  <a href={`https://paypal.me/Medmoney642/${d.amt.replace('$', '')}`} target="_blank" rel="noopener noreferrer" className="btn-outline-white w-full mt-6 text-sm inline-block">{t('pets.browser.donate')}</a>
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

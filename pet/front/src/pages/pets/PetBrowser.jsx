import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/client';
import samplePets from '../../data/samplePets';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import PageTransition from '../../components/animations/PageTransition';
import AdoptionTypeCard from '../../components/pets/AdoptionTypeCard';
import CounterBar from '../../components/pets/CounterBar';
import FilterSidebar from '../../components/pets/FilterSidebar';
import PetCardGrid from '../../components/pets/PetCardGrid';
import Pagination from '../../components/ui/Pagination';
import DonationCard from '../../components/pets/DonationCard';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const PAGE_SIZE = 9;

const defaultFilters = { species: '', age: '', size: '', gender: '', status: '' };

const sortOptions = [
  { value: 'recent', label: 'Recent' },
  { value: 'name', label: 'Name A-Z' },
  { value: 'age', label: 'Age' },
];

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

function matchesSize(pet, filter) {
  if (!filter) return true;
  return pet.size === filter;
}

function matchesGender(pet, filter) {
  if (!filter) return true;
  return pet.gender === filter;
}

function matchesStatus(pet, filter) {
  if (!filter) return true;
  const s = typeof pet.status === 'string' ? pet.status : '';
  return s === filter;
}

export default function PetBrowser() {
  const [allPets, setAllPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(defaultFilters);
  const [sort, setSort] = useState('recent');
  const [page, setPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

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
      .catch(() => {
        if (!cancelled) setAllPets(samplePets);
      })
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
      case 'name':
        list = [...list].sort((a, b) => a.name?.localeCompare(b.name));
        break;
      case 'age':
        list = [...list].sort((a, b) => (a.ageMonths || 0) - (b.ageMonths || 0));
        break;
      default:
        break;
    }

    return list;
  }, [allPets, filters, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleReset = () => {
    setFilters(defaultFilters);
    setPage(1);
  };

  if (loading) {
    return (
      <PageTransition>
        <Navbar />
        <div className="min-h-screen pt-24 flex items-center justify-center bg-warm">
          <LoadingSpinner text="Loading animals..." />
        </div>
        <Footer />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <Navbar />
      <main className="min-h-screen bg-warm">
        {/* Hero */}
        <section className="pt-28 pb-16 px-4" style={{ background: 'linear-gradient(135deg, #0F0C29, #302B63, #24243e)' }}>
          <div className="max-w-7xl mx-auto text-center">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-5xl font-bold text-white max-w-3xl mx-auto leading-tight">
              Responsible adoption changes the life of the animal as much as yours
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-4 text-coral text-lg md:text-xl">
              Empathetic, intelligent & companion animal, each has a story to tell
            </motion.p>
          </div>
          <div className="max-w-6xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
            <AdoptionTypeCard emoji="🐕" title="Responsible Adoption" description="Give a second chance to a dog in need" delay={0.2} />
            <AdoptionTypeCard emoji="🐈" title="Foster Adoption" description="Open your home temporarily to a cat" delay={0.3} />
            <AdoptionTypeCard emoji="🐰" title="Distance Adoption" description="Sponsor an animal from afar" delay={0.4} />
          </div>
        </section>

        {/* Counter */}
        <CounterBar count={allPets.length} />

        {/* Main content */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Mobile filter toggle */}
          <div className="lg:hidden mb-4">
            <Button variant="outline" className="!rounded-pill !border-coral/50 !text-coral w-full" onClick={() => setMobileFilterOpen(true)}>
              Filters
            </Button>
          </div>

          <div className="flex gap-8">
            {/* Sidebar */}
            <div className="w-full lg:w-64 flex-shrink-0">
              <FilterSidebar
                filters={filters}
                onFilterChange={(f) => { setFilters(f); setPage(1); }}
                onReset={handleReset}
                mobileOpen={mobileFilterOpen}
                onMobileClose={() => setMobileFilterOpen(false)}
              />
            </div>

            {/* Results */}
            <div className="flex-1 min-w-0">
              {/* Top bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <p className="text-sm text-muted">
                  <strong className="text-gray-900">{filtered.length}</strong> animals found
                </p>
                <select
                  value={sort}
                  onChange={(e) => { setSort(e.target.value); setPage(1); }}
                  className="px-3 py-2 rounded-xl border border-warm-dark bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-coral/30"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Grid */}
              <PetCardGrid pets={paged} emptyMessage="No animals match your criteria." />

              {/* Pagination */}
              <Pagination current={page} total={totalPages} onChange={setPage} />
            </div>
          </div>
        </section>

        {/* Map + Shelters */}
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="bg-gray-200 rounded-3xl h-72 flex items-center justify-center text-gray-400 text-6xl">
                  🗺️
                </div>
                <p className="text-sm text-muted mt-4">Find a shelter near you</p>
                <Button variant="primary" className="!rounded-pill mt-3">Get directions</Button>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Our shelters</h3>
                <div className="space-y-3">
                  {['SPA Casablanca', 'Refuge Rabat', 'Refuge Marrakech', 'Refuge Fès', 'Refuge Tanger'].map((name) => (
                    <label key={name} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 hover:text-coral transition-colors">
                      <input type="checkbox" className="accent-coral" />
                      {name}
                    </label>
                  ))}
                </div>
                <Button variant="primary" className="!rounded-pill mt-4">Filter by shelter</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Responsible Adoption Banner */}
        <section className="bg-coral py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-8">
            <div className="text-8xl">🐾</div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold text-white">Responsible Adoption</h2>
              <p className="text-white/80 mt-2 max-w-lg">Learn more about what it means to adopt responsibly and give an animal a loving home.</p>
              <Button variant="outline" className="!rounded-pill mt-4 !border-white !text-white hover:!bg-white hover:!text-coral">
                Read our blog
              </Button>
            </div>
          </div>
        </section>

        {/* Donation Section */}
        <section className="py-16 bg-warm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Give for animals</h2>
            <p className="text-muted mt-2 mb-10">Your donation helps us rescue and care for more animals</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <DonationCard amount="60 MAD" taxInfo="Tax deductible" delay={0} />
              <DonationCard amount="120 MAD" taxInfo="Tax deductible" delay={0.1} />
              <DonationCard amount="200 MAD" taxInfo="Tax deductible" delay={0.2} />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </PageTransition>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/client';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PageTransition from '../../components/animations/PageTransition';

const speciesEmoji = {
  Dog: '🐕', Cat: '🐈', Rabbit: '🐰', Bird: '🐦', Parrot: '🦜',
  Hamster: '🐹', Fish: '🐟', Turtle: '🐢', Horse: '🐴',
};

const petStatus = (s) => {
  if (typeof s === 'number') return ({ 1: 'Available', 2: 'Adopted', 3: 'Pending' })[s] || 'Available';
  const map = { Available: 'Available', ApplicationReceived: 'Pending', UnderReview: 'Pending', Approved: 'Pending', Completed: 'Adopted' };
  return map[s] || s || 'Available';
};

const stagger = { initial: {}, animate: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function PetBrowser() {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('All');
  const [applyPet, setApplyPet] = useState(null);
  const [message, setMessage] = useState('');
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState('');

  const token = localStorage.getItem('sh-token');
  const role = localStorage.getItem('sh-role');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.get('/pets').then(({ data }) => {
      if (cancelled) return;
      setPets(data.items || data.$values || []);
    }).catch(() => {}).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const species = ['All', ...new Set(pets.map((p) => p.type || 'Other').filter(Boolean))];

  const filtered = pets.filter((p) => {
    const matchesSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.breed?.toLowerCase().includes(search.toLowerCase());
    const matchesSpecies = speciesFilter === 'All' || (p.type || 'Other') === speciesFilter;
    return matchesSearch && matchesSpecies;
  });

  const handleApply = async () => {
    if (!token) { navigate('/client/register'); return; }
    if (role !== 'Applicant') { setApplyError('Only applicants can submit adoption requests.'); return; }
    setApplying(true);
    setApplyError('');
    try {
      await api.post('/adoptions/apply', { petId: applyPet.id, applicationMessage: message });
      setApplyPet(null);
      setMessage('');
    } catch (err) {
      setApplyError(err.response?.data?.message || 'Failed to submit');
    } finally {
      setApplying(false);
    }
  };

  return (
    <PageTransition>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Browse Pets</h1>
            <p className="mt-3 text-gray-500">Find your perfect companion among our furry friends</p>
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-4 mb-10 max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search by name or breed..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input flex-1"
            />
            <select
              value={speciesFilter}
              onChange={(e) => setSpeciesFilter(e.target.value)}
              className="input sm:w-44"
            >
              {species.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {loading ? <LoadingSpinner text="Finding pets..." />
          : filtered.length === 0 ? (
            <p className="text-center text-gray-400 py-16">No pets found</p>
          ) : (
            <motion.div variants={stagger} initial="initial" animate="animate" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((pet) => (
                <motion.div key={pet.id} variants={fadeUp}>
                  <motion.div
                    whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(216,90,48,0.2)' }}
                    className="bg-white rounded-2xl shadow-card p-6 border border-gray-100 h-full flex flex-col transition-all duration-300"
                  >
                    <div className="h-48 bg-warm rounded-xl mb-5 flex items-center justify-center text-6xl overflow-hidden">
                      {pet.imageUrl ? <img src={pet.imageUrl} alt={pet.name} className="w-full h-full object-cover" /> : <span>{speciesEmoji[pet.type] || '🐾'}</span>}
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{pet.name}</h3>
                      <Badge status={petStatus(pet.status)} />
                    </div>
                    <p className="text-gray-500 text-sm mb-1">{pet.breed || 'Mixed Breed'}</p>
                    {pet.age != null && <p className="text-gray-400 text-xs mb-4">{pet.age} year{pet.age !== 1 ? 's' : ''} old</p>}
                    <div className="mt-auto">
                      <Button variant="teal" className="w-full text-sm" onClick={() => setApplyPet(pet)}>Adopt Me</Button>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      <Modal isOpen={!!applyPet} onClose={() => { setApplyPet(null); setMessage(''); setApplyError(''); }}>
        {applyPet && (
          <div>
            <div className="text-5xl text-center mb-4">{speciesEmoji[applyPet.type] || '🐾'}</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">Apply to Adopt {applyPet.name}</h2>
            <p className="text-sm text-gray-500 mb-5 text-center">{applyPet.breed || 'Pet'} &middot; {petStatus(applyPet.status)}</p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Message to Shelter (optional)</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell us why you'd be a great pet parent..." rows={4} className="input" />
            </div>
            {applyError && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">{applyError}</p>}
            <Button className="w-full" onClick={handleApply} disabled={applying}>{applying ? 'Submitting...' : 'Submit Request'}</Button>
          </div>
        )}
      </Modal>

      <Footer />
    </PageTransition>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/client';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PageTransition from '../../components/animations/PageTransition';

const petStatus = (s) => {
  if (typeof s === 'number') return ({ 1:'Available', 2:'Adopted', 3:'Pending' })[s] || 'Available';
  const map = { 'Available':'Available', 'ApplicationReceived':'Pending', 'UnderReview':'Pending', 'Approved':'Pending', 'Completed':'Adopted' };
  return map[s] || s || 'Available';
};
const stagger = { initial: {}, animate: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function PetBrowser() {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [applyPet, setApplyPet] = useState(null);
  const [message, setMessage] = useState('');
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState('');

  const user = JSON.parse(localStorage.getItem('pawfinds-user') || 'null');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.get('/pets').then(({ data }) => {
      if (cancelled) return;
      setPets(data.items || data.$values || []);
    }).catch(() => {}).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filtered = filter === 'All' ? pets : pets.filter((p) => petStatus(p.status) === filter);
  const statuses = ['All', ...new Set(pets.map((p) => petStatus(p.status)))];

  const handleApply = async () => {
    if (!user) { navigate('/client/login'); return; }
    if (user.role !== 'Applicant') { setApplyError('Only applicants can submit adoption requests.'); return; }
    setApplying(true);
    setApplyError('');
    try {
      await api.post('/adoptions/apply', { petId: applyPet.id, applicationMessage: message });
      setApplyPet(null);
      setMessage('');
      alert('Adoption request submitted!');
    } catch (err) {
      setApplyError(err.response?.data?.message || 'Failed to submit');
    } finally {
      setApplying(false);
    }
  };

  return (
    <PageTransition>
      <Navbar />
      <div className="min-h-screen bg-warm-light pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Browse Pets</h1>
            <p className="mt-3 text-gray-500">Find your perfect companion among our furry friends</p>
          </motion.div>

          <div className="flex justify-center gap-2 mb-10 flex-wrap">
            {statuses.map((s) => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === s ? 'bg-coral text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
                }`}
              >{s}</button>
            ))}
          </div>

          {loading ? <LoadingSpinner text="Finding pets..." />
          : filtered.length === 0 ? (
            <p className="text-center text-gray-400 py-16">No pets found</p>
          ) : (
            <motion.div variants={stagger} initial="initial" animate="animate" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((pet) => (
                <motion.div key={pet.id} variants={fadeUp}>
                  <Card className="h-full flex flex-col">
                    <div className="h-48 bg-gradient-to-br from-warm to-warm-dark rounded-xl mb-5 flex items-center justify-center text-6xl overflow-hidden">
                      {pet.imageUrl ? <img src={pet.imageUrl} alt={pet.name} className="w-full h-full object-cover" /> : '🐾'}
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
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
      <Modal isOpen={!!applyPet} onClose={() => { setApplyPet(null); setMessage(''); setApplyError(''); }}>
        {applyPet && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Apply to Adopt {applyPet.name}</h2>
            <p className="text-sm text-gray-500 mb-5">{applyPet.breed || 'Pet'} &middot; {petStatus(applyPet.status)}</p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Message to Shelter (optional)</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell us why you'd be a great pet parent..." rows={4} className="input" />
            </div>
            {applyError && <p className="text-red-500 text-sm mb-4">{applyError}</p>}
            <Button className="w-full" onClick={handleApply} disabled={applying}>{applying ? 'Submitting...' : 'Submit Request'}</Button>
          </div>
        )}
      </Modal>
      <Footer />
    </PageTransition>
  );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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

export default function PetDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applyModal, setApplyModal] = useState(false);
  const [message, setMessage] = useState('');
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [contacting, setContacting] = useState(false);
  const [contactError, setContactError] = useState('');

  const token = localStorage.getItem('sh-token');
  const role = localStorage.getItem('sh-role');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.get(`/pets/${id}`).then(({ data }) => {
      if (!cancelled) setPet(data);
    }).catch(() => {
      if (!cancelled) navigate('/pets');
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id, navigate]);

  const handleApply = async () => {
    if (!token) { navigate('/client/login'); return; }
    if (role !== 'Applicant' && role !== 'Adopter') { setApplyError('Only adopters can submit requests.'); return; }
    setApplying(true);
    setApplyError('');
    try {
      await api.post('/adoptions/apply', { petId: pet.id, applicationMessage: message });
      setApplyModal(false);
      setMessage('');
    } catch (err) {
      setApplyError(err.response?.data?.message || 'Failed to submit');
    } finally {
      setApplying(false);
    }
  };

  const handleContact = async () => {
    if (!token) { navigate('/client/login'); return; }
    setContacting(true);
    setContactError('');
    try {
      const { data } = await api.post(`/conversations/start/${pet.id}`);
      navigate('/client/messages');
    } catch (err) {
      setContactError(err.response?.data?.message || 'Failed to start conversation');
    } finally {
      setContacting(false);
    }
  };

  if (loading) return (<PageTransition><Navbar /><div className="min-h-screen pt-24 flex items-center justify-center"><LoadingSpinner text="Loading pet..." /></div></PageTransition>);
  if (!pet) return null;

  return (
    <PageTransition>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/pets" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-coral mb-8 transition-colors">&larr; Back to Browse</Link>

          <div className="grid md:grid-cols-2 gap-10">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
              <div className="bg-warm rounded-3xl h-80 md:h-96 flex items-center justify-center text-8xl overflow-hidden shadow-card">
                {pet.imageUrl ? <img src={pet.imageUrl} alt={pet.name} className="w-full h-full object-cover" /> : <span>{speciesEmoji[pet.type] || '🐾'}</span>}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{pet.name}</h1>
                <Badge status={petStatus(pet.status)} />
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 bg-warm rounded-full text-sm font-medium text-gray-700">{speciesEmoji[pet.type] || ''} {pet.type}</span>
                {pet.breed && <span className="px-3 py-1.5 bg-warm rounded-full text-sm font-medium text-gray-700">{pet.breed}</span>}
                {pet.age != null && <span className="px-3 py-1.5 bg-warm rounded-full text-sm font-medium text-gray-700">{pet.age} year{pet.age !== 1 ? 's' : ''} old</span>}
                {pet.location && <span className="px-3 py-1.5 bg-warm rounded-full text-sm font-medium text-gray-700">📍 {pet.location}</span>}
              </div>

              {pet.description && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">About</h3>
                  <p className="text-gray-700 leading-relaxed">{pet.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button variant="primary" className="w-full" onClick={() => setApplyModal(true)} disabled={pet.status === 'Adopted' || pet.status === 2}>
                  Adopt Me
                </Button>
                <Button variant="outline" className="w-full" onClick={handleContact} disabled={contacting}>
                  {contacting ? 'Starting...' : 'Contact Shelter'}
                </Button>
              </div>
              {contactError && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{contactError}</p>}
            </motion.div>
          </div>
        </div>
      </div>

      <Modal isOpen={applyModal} onClose={() => { setApplyModal(false); setMessage(''); setApplyError(''); }} title={`Apply to Adopt ${pet.name}`}>
        <div className="text-5xl text-center mb-4">{speciesEmoji[pet.type] || '🐾'}</div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Message to Shelter (optional)</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell us why you'd be a great pet parent..." rows={4} className="input" />
        </div>
        {applyError && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">{applyError}</p>}
        <Button className="w-full" onClick={handleApply} disabled={applying}>{applying ? 'Submitting...' : 'Submit Request'}</Button>
      </Modal>

      <Footer />
    </PageTransition>
  );
}

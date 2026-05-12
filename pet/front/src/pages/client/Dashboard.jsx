import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/client';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PageTransition from '../../components/animations/PageTransition';

const speciesEmoji = {
  Dog: '🐕', Cat: '🐈', Rabbit: '🐰', Bird: '🐦', Parrot: '🦜',
  Hamster: '🐹', Fish: '🐟', Turtle: '🐢', Horse: '🐴',
};

export default function ClientDashboard() {
  const [tab, setTab] = useState('overview');
  const [requests, setRequests] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [adoptionCount, setAdoptionCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ petName: '', species: 'Dog', breed: '', age: 1, reason: '', description: '', contactPhone: '', contactEmail: '' });
  const [formSubmitting, setFormSubmitting] = useState(false);

  const user = JSON.parse(localStorage.getItem('sh-user') || '{}');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [reqRes, favRes, countRes] = await Promise.all([
          api.get('/adoptions/mine'),
          api.get('/client/favorites'),
          api.get('/client/adoption-count'),
        ]);
        if (cancelled) return;
        setRequests(reqRes.data?.items || reqRes.data?.$values || []);
        setFavorites(favRes.data || []);
        setAdoptionCount(countRes.data || 0);
      } catch {}
      if (!cancelled) setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const handleSubmitGiveUp = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      await api.post('/client/adopt-requests', formData);
      setShowForm(false);
      setFormData({ petName: '', species: 'Dog', breed: '', age: 1, reason: '', description: '', contactPhone: '', contactEmail: '' });
    } catch {}
    setFormSubmitting(false);
  };

  if (loading) return <PageTransition><Navbar /><div className="min-h-screen pt-24 flex items-center justify-center"><LoadingSpinner /></div><Footer /></PageTransition>;

  return (
    <PageTransition>
      <Navbar />
      <main className="min-h-screen bg-warm pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">My Dashboard</h1>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 flex-wrap">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'favorites', label: `Favorites (${favorites.length}/4)` },
              { key: 'adoptions', label: `My Adoptions (${adoptionCount}/2)` },
              { key: 'giveup', label: 'Give Up a Pet' },
            ].map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-4 py-2 rounded-pill text-sm font-medium transition-all ${tab === t.key ? 'bg-coral text-white' : 'bg-white text-gray-700 hover:bg-warm-dark'}`}>
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'overview' && (
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl shadow-card p-6 text-center">
                <p className="text-3xl font-bold text-coral">{adoptionCount}/2</p>
                <p className="text-muted text-sm mt-1">Adoptions</p>
              </div>
              <div className="bg-white rounded-2xl shadow-card p-6 text-center">
                <p className="text-3xl font-bold text-amber">{favorites.length}/4</p>
                <p className="text-muted text-sm mt-1">Favorites</p>
              </div>
              <div className="bg-white rounded-2xl shadow-card p-6 text-center">
                <p className="text-3xl font-bold text-teal">{requests.length}</p>
                <p className="text-muted text-sm mt-1">Requests</p>
              </div>
            </div>
          )}

          {tab === 'favorites' && (
            <div>
              {favorites.length === 0 ? (
                <div className="text-center py-16 text-muted">
                  <p>No favorite pets yet.</p>
                  <Link to="/pets" className="text-coral font-medium mt-2 inline-block">Browse pets</Link>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {favorites.map((f) => (
                    <motion.div key={f.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-xl shadow-card p-4 text-center">
                      <div className="text-4xl mb-2">{speciesEmoji[f.petName] || '🐾'}</div>
                      <p className="font-medium text-gray-900">{f.petName}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'adoptions' && (
            <div>
              {adoptionCount >= 2 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 mb-4">
                  ⚠️ You have reached the maximum of 2 adoptions.
                </div>
              )}
              {requests.length === 0 ? (
                <div className="text-center py-16 text-muted">
                  <p>No adoption requests yet.</p>
                  <Link to="/pets" className="btn-primary inline-flex mt-4 px-6 py-2">Browse Pets</Link>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {requests.map((r) => (
                    <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-xl shadow-card p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="text-3xl">{speciesEmoji[r.petType] || '🐾'}</div>
                        <Badge status={r.status} />
                      </div>
                      <p className="font-bold text-gray-900">{r.petName || `Pet #${r.petId}`}</p>
                      {r.createdAt && <p className="text-xs text-muted mt-1">{new Date(r.createdAt).toLocaleDateString()}</p>}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'giveup' && (
            <div>
              <p className="text-muted text-sm mb-4">If you can no longer care for your pet, fill this form and the Super Admin will review your request within 24 hours.</p>
              {!showForm ? (
                <Button variant="primary" className="!rounded-pill" onClick={() => setShowForm(true)}>Start a Request</Button>
              ) : (
                <form onSubmit={handleSubmitGiveUp} className="bg-white rounded-2xl shadow-card p-6 max-w-lg space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pet Name</label>
                    <input className="input" value={formData.petName} onChange={(e) => setFormData({ ...formData, petName: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Species</label>
                    <select className="input" value={formData.species} onChange={(e) => setFormData({ ...formData, species: e.target.value })}>
                      <option value="Dog">Dog 🐕</option>
                      <option value="Cat">Cat 🐈</option>
                      <option value="Rabbit">Rabbit 🐰</option>
                      <option value="Bird">Bird 🐦</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Breed (optional)</label>
                    <input className="input" value={formData.breed} onChange={(e) => setFormData({ ...formData, breed: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age (years)</label>
                    <input type="number" min="0" className="input" value={formData.age} onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Why are you giving up your pet?</label>
                    <textarea className="input" rows="3" value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Additional details (optional)</label>
                    <textarea className="input" rows="2" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                    <input className="input" value={formData.contactPhone} onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                    <input type="email" className="input" value={formData.contactEmail} onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })} required />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" variant="primary" className="!rounded-pill" disabled={formSubmitting}>
                      {formSubmitting ? 'Submitting...' : 'Submit Request'}
                    </Button>
                    <Button variant="outline" className="!rounded-pill" onClick={() => setShowForm(false)}>Cancel</Button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </PageTransition>
  );
}

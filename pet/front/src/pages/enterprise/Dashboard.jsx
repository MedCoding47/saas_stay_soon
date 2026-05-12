import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/client';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import PageTransition from '../../components/animations/PageTransition';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function EnterpriseDashboard() {
  const [pets, setPets] = useState([]);
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pets');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [petsRes, profileRes] = await Promise.all([
          api.get('/enterprise/pets'),
          api.get('/enterprise/profile'),
        ]);
        if (cancelled) return;
        setPets(petsRes.data || []);
        setProfile(profileRes.data);

        const prodMap = {};
        for (const pet of petsRes.data || []) {
          try {
            const { data } = await api.get(`/enterprise/pets/${pet.id}/products`);
            prodMap[pet.id] = data || [];
          } catch { prodMap[pet.id] = []; }
        }
        setProducts(prodMap);
      } catch {}
      if (!cancelled) setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <PageTransition><Navbar /><div className="min-h-screen pt-24 flex items-center justify-center"><LoadingSpinner /></div><Footer /></PageTransition>;

  return (
    <PageTransition>
      <Navbar />
      <main className="min-h-screen bg-warm pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Enterprise Dashboard</h1>

          {/* Tabs */}
          <div className="flex gap-2 mb-8">
            {[
              { key: 'pets', label: `My Pets (${pets.length}/6)` },
              { key: 'profile', label: 'Company Profile' },
              { key: 'adoptions', label: 'Adoption Requests' },
            ].map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-4 py-2 rounded-pill text-sm font-medium transition-all ${tab === t.key ? 'bg-coral text-white' : 'bg-white text-gray-700 hover:bg-warm-dark'}`}>
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'pets' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted">{pets.length}/6 pets used</p>
                {pets.length < 6 && <Button variant="primary" className="!rounded-pill">Add Pet</Button>}
              </div>
              {pets.length === 0 ? (
                <div className="text-center py-16 text-muted">No pets yet. Start by adding your first pet.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pets.map((pet) => (
                    <motion.div key={pet.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-xl shadow-card p-4">
                      <h3 className="font-bold text-gray-900">{pet.name}</h3>
                      <p className="text-xs text-muted">{pet.type}{pet.breed ? ` · ${pet.breed}` : ''}</p>
                      <p className="text-xs text-muted-light mt-1">📍 {pet.location}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${pet.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{pet.status}</span>
                        <span className="text-xs text-muted-light">{products[pet.id]?.length || 0}/4 products</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'profile' && (
            <div className="bg-white rounded-2xl shadow-card p-6 max-w-lg">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Company Information</h2>
              {profile && (
                <div className="space-y-3 text-sm">
                  <div><span className="text-muted">Name:</span> <span className="font-medium">{profile.companyName}</span></div>
                  <div><span className="text-muted">Location:</span> <span>{profile.location}</span></div>
                  <div><span className="text-muted">Phone:</span> <span>{profile.phone || '—'}</span></div>
                  <div><span className="text-muted">Email:</span> <span>{profile.email || '—'}</span></div>
                  {profile.description && <div><span className="text-muted">About:</span> <p className="text-gray-700 mt-1">{profile.description}</p></div>}
                </div>
              )}
              <Button variant="primary" className="!rounded-pill mt-6">Edit Profile</Button>
            </div>
          )}

          {tab === 'adoptions' && (
            <div className="text-center py-16 text-muted">Adoption requests from clients will appear here.</div>
          )}
        </div>
      </main>
      <Footer />
    </PageTransition>
  );
}

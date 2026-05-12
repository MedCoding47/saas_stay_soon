import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/client';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import PageTransition from '../../components/animations/PageTransition';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function VeterinaireDashboard() {
  const [profile, setProfile] = useState(null);
  const [advice, setAdvice] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('profile');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [profileRes, adviceRes, bookingsRes] = await Promise.all([
          api.get('/veterinaire/profile'),
          api.get('/veterinaire/advice'),
          api.get('/veterinaire/bookings'),
        ]);
        if (cancelled) return;
        setProfile(profileRes.data);
        setAdvice(adviceRes.data || []);
        setBookings(bookingsRes.data || []);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Veterinaire Dashboard</h1>

          <div className="flex gap-2 mb-8">
            {[
              { key: 'profile', label: 'My Profile' },
              { key: 'advice', label: `Advice (${advice.length})` },
              { key: 'bookings', label: `Bookings (${bookings.length})` },
            ].map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-4 py-2 rounded-pill text-sm font-medium transition-all ${tab === t.key ? 'bg-coral text-white' : 'bg-white text-gray-700 hover:bg-warm-dark'}`}>
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'profile' && profile && (
            <div className="bg-white rounded-2xl shadow-card p-6 max-w-lg">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Clinic Information</h2>
              <div className="space-y-3 text-sm">
                <div><span className="text-muted">Clinic:</span> <span className="font-medium">{profile.clinicName}</span></div>
                <div><span className="text-muted">Location:</span> <span>{profile.location}</span></div>
                <div><span className="text-muted">Phone:</span> <span>{profile.phone || '—'}</span></div>
                <div><span className="text-muted">Available:</span> <span>{profile.isAvailable ? '✅ Yes' : '❌ No'}</span></div>
                {profile.description && <div><span className="text-muted">About:</span> <p className="text-gray-700 mt-1">{profile.description}</p></div>}
              </div>
              <Button variant="primary" className="!rounded-pill mt-6">Edit Profile</Button>
            </div>
          )}

          {tab === 'advice' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted">Share tips and advice for pet owners</p>
                <Button variant="primary" className="!rounded-pill">Add Advice</Button>
              </div>
              {advice.length === 0 ? (
                <div className="text-center py-16 text-muted">No advice yet.</div>
              ) : (
                <div className="grid gap-4">
                  {advice.map((a) => (
                    <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-xl shadow-card p-4">
                      <h3 className="font-bold text-gray-900">{a.title}</h3>
                      <p className="text-sm text-muted mt-1">{a.content}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'bookings' && (
            <div>
              {bookings.length === 0 ? (
                <div className="text-center py-16 text-muted">No booking requests yet.</div>
              ) : (
                <div className="grid gap-4">
                  {bookings.map((b) => (
                    <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-xl shadow-card p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{b.userName}</p>
                        <p className="text-xs text-muted">{new Date(b.bookingDate).toLocaleDateString()} — {b.notes || 'No notes'}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${b.status === 'Pending' ? 'bg-amber-100 text-amber-700' : b.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{b.status}</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </PageTransition>
  );
}

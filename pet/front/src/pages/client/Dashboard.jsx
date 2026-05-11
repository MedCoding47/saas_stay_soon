import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/client';
import Navbar from '../../components/layout/Navbar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PageTransition from '../../components/animations/PageTransition';

export default function ClientDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('pawfinds-user') || '{}');
  const [adoptions, setAdoptions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role === 'Admin') { navigate('/client/login'); return; }
    Promise.all([
      api.get('/adoptions/mine').then(({ data }) => setAdoptions(data.items || data.$values || [])).catch(() => {}),
      api.get('/notifications').then(({ data }) => setNotifications(Array.isArray(data) ? data : data.$values || [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <PageTransition>
      <div className="min-h-screen bg-warm-light">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 pt-24 pb-16">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.fullName || user.name || 'Pet Lover'}!</h1>
            <p className="text-gray-500 mt-1 mb-10">Your adoption journey at a glance</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900">My Requests</h2>
                <Link to="/pets"><Button variant="ghost" className="text-sm !px-3 !py-1">Browse Pets</Button></Link>
              </div>
              {adoptions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-sm mb-3">No adoption requests yet</p>
                  <Link to="/pets"><Button variant="primary" className="text-sm">Find a Pet</Button></Link>
                </div>
              ) : (
                <ul className="space-y-3">
                  {adoptions.map((a) => (
                    <li key={a.id} className="flex items-center justify-between py-3 border-b border-gray-50">
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{a.petName || a.pet?.name || `Pet #${a.petId}`}</p>
                        <p className="text-xs text-gray-400">Request #{a.id}</p>
                      </div>
                      <Badge status={a.status || 'Pending'} />
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Notifications</h2>
              {notifications.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">No notifications yet</p>
              ) : (
                <ul className="space-y-3">
                  {notifications.map((n) => (
                    <li key={n.id} className="py-3 border-b border-gray-50">
                      <p className="text-sm text-gray-700">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ''}</p>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

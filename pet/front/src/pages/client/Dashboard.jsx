import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/client';
import Navbar from '../../components/layout/Navbar';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PageTransition from '../../components/animations/PageTransition';

const speciesEmoji = {
  Dog: '🐕', Cat: '🐈', Rabbit: '🐰', Bird: '🐦', Parrot: '🦜',
  Hamster: '🐹', Fish: '🐟', Turtle: '🐢', Horse: '🐴',
};

const adoptStatus = (s) => {
  if (typeof s === 'number') {
    const map = { 2: 'Pending', 3: 'Under Review', 4: 'Approved', 5: 'Completed', 6: 'Rejected' };
    return map[s] || 'Unknown';
  }
  const map = { ApplicationReceived: 'Pending', UnderReview: 'Under Review', Approved: 'Approved', Completed: 'Completed', Rejected: 'Rejected' };
  return map[s] || s || 'Unknown';
};

export default function ClientDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');

  const user = JSON.parse(localStorage.getItem('sh-user') || '{}');

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening');
  }, []);

  useEffect(() => {
    let cancelled = false;
    api.get('/adoptions').then(({ data }) => {
      if (cancelled) return;
      const list = data.items || data.$values || [];
      setRequests(list.filter((a) => a.userId === user.id || a.applicantEmail === user.email));
    }).catch(() => {}).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user.id, user.email]);

  const pendingCount = requests.filter((r) => [2, 3].includes(r.status) || ['ApplicationReceived', 'UnderReview'].includes(r.status)).length;
  const approvedCount = requests.filter((r) => r.status === 4 || r.status === 'Approved').length;

  return (
    <PageTransition>
      <Navbar />
      <div className="min-h-screen bg-warm pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold text-gray-900">
              {greeting}, {user.fullName || user.email || 'Pet Lover'}!
            </h1>
            <p className="text-gray-500 mt-1">Here's your adoption journey</p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-6 my-10">
            <div className="card text-center">
              <p className="text-3xl font-bold text-coral">{requests.length}</p>
              <p className="text-gray-500 text-sm mt-1">Total Requests</p>
            </div>
            <div className="card text-center">
              <p className="text-3xl font-bold text-amber">{pendingCount}</p>
              <p className="text-gray-500 text-sm mt-1">Pending</p>
            </div>
            <div className="card text-center">
              <p className="text-3xl font-bold text-teal">{approvedCount}</p>
              <p className="text-gray-500 text-sm mt-1">Approved</p>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h2 className="text-xl font-bold text-gray-900 mb-4">My Requests</h2>
            {loading ? <LoadingSpinner /> : requests.length === 0 ? (
              <div className="card text-center py-12">
                <div className="text-6xl mb-4">🐾</div>
                <p className="text-gray-500 mb-4">You haven't made any adoption requests yet</p>
                <Link to="/pets" className="btn-primary inline-flex px-6 py-3">Browse Pets</Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {requests.map((r, i) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="card"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-4xl">{speciesEmoji[r.petType] || '🐾'}</div>
                      <Badge status={adoptStatus(r.status)} />
                    </div>
                    <h3 className="font-bold text-gray-900">{r.petName || `Pet #${r.petId}`}</h3>
                    <p className="text-gray-400 text-xs mt-1">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}

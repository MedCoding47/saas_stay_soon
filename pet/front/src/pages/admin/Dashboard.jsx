import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/client';
import Navbar from '../../components/layout/Navbar';
import AdminSidebar from '../../components/layout/AdminSidebar';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PageTransition from '../../components/animations/PageTransition';

const petStatus = (s) => {
  if (typeof s === 'number') return ({ 1: 'Available', 2: 'Adopted', 3: 'Pending' })[s] || 'Available';
  const map = { Available: 'Available', ApplicationReceived: 'Pending', UnderReview: 'Pending', Approved: 'Pending', Completed: 'Adopted' };
  return map[s] || s || 'Available';
};

const adoptStatus = (s) => {
  if (typeof s === 'number') return ({ 2: 'Application Received', 3: 'Under Review', 4: 'Approved', 5: 'Completed' })[s] || 'Unknown';
  return s || 'Unknown';
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalPets: 0, available: 0, pending: 0, adopted: 0, users: 0 });
  const [recentPets, setRecentPets] = useState([]);
  const [adoptions, setAdoptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/pets').then(({ data }) => {
        const pets = data.items || data.$values || [];
        setRecentPets(pets.slice(0, 5));
        setStats({
          totalPets: pets.length,
          available: pets.filter((p) => p.status === 1 || p.status === 'Available').length,
          pending: pets.filter((p) => [2, 3, 4].includes(p.status) || ['ApplicationReceived', 'UnderReview', 'Approved'].includes(p.status)).length,
          adopted: pets.filter((p) => p.status === 5 || p.status === 'Completed').length,
          users: 0,
        });
      }),
      api.get('/adoptions').then(({ data }) => {
        setAdoptions(data.items || data.$values || []);
      }).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Total Pets', value: stats.totalPets, color: 'text-coral', bg: 'bg-coral/10', icon: '🐾' },
    { label: 'Available', value: stats.available, color: 'text-teal', bg: 'bg-teal/10', icon: '✅' },
    { label: 'Pending', value: stats.pending, color: 'text-amber', bg: 'bg-amber/10', icon: '⏳' },
    { label: 'Adopted', value: stats.adopted, color: 'text-blue-600', bg: 'bg-blue-100', icon: '🏠' },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <AdminSidebar />
        <div className="pl-64 pt-16">
          <div className="max-w-7xl mx-auto px-8 py-8">
            <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold text-gray-900 mb-8">
              🐾 Super-hayawan Dashboard
            </motion.h1>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="card"
                >
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-gray-500 text-sm mt-1">{s.label}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Pets</h2>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-500 border-b border-gray-100">
                      <th className="text-left pb-3 font-medium">Name</th>
                      <th className="text-left pb-3 font-medium">Breed</th>
                      <th className="text-right pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPets.map((pet) => (
                      <tr key={pet.id} className="border-b border-gray-50">
                        <td className="py-3 font-medium text-gray-800">{pet.name}</td>
                        <td className="py-3 text-gray-500">{pet.breed || '—'}</td>
                        <td className="py-3 text-right"><Badge status={petStatus(pet.status)} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Activity Feed</h2>
                {adoptions.length === 0 ? (
                  <p className="text-gray-400 text-sm py-4 text-center">No recent activity</p>
                ) : (
                  <ul className="space-y-3">
                    {adoptions.slice(0, 6).map((a) => (
                      <li key={a.id} className="flex items-center justify-between py-2 border-b border-gray-50">
                        <div className="text-sm text-gray-700">
                          Request <span className="font-medium">#{a.id}</span>
                          {a.petName && <span className="text-gray-400"> for {a.petName}</span>}
                        </div>
                        <Badge status={adoptStatus(a.status)} />
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

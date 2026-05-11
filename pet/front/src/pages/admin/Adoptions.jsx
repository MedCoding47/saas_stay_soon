import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAdoptions } from '../../hooks/useAdoptions';
import Navbar from '../../components/layout/Navbar';
import AdminSidebar from '../../components/layout/AdminSidebar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PageTransition from '../../components/animations/PageTransition';

const adoptStatus = (s) => typeof s === 'number' ? ({ 2:'Application Received',3:'Under Review',4:'Approved',5:'Completed' })[s]||'Unknown' : s||'Unknown';
const FILTER_NAMES = { 'All': 'All', 'Application Received': 'Application Received', 'Under Review': 'Under Review', 'Approved': 'Approved', 'Completed': 'Completed' };

export default function Adoptions() {
  const { adoptions, loading, updateStatus } = useAdoptions();
  const [filter, setFilter] = useState('All');

  const filtered = filter === 'All' ? adoptions : adoptions.filter((a) => adoptStatus(a.status) === filter);

  if (loading) return <LoadingSpinner />;

  return (
    <PageTransition>
      <div className="min-h-screen bg-warm-light">
        <Navbar />
        <AdminSidebar />
        <div className="pl-64 pt-16">
          <div className="max-w-7xl mx-auto px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Adoption Requests</h1>

            <div className="flex gap-2 mb-6 flex-wrap">
              {Object.keys(FILTER_NAMES).map((s) => (
                <button key={s} onClick={() => setFilter(s)}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === s ? 'bg-coral text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
                  }`}
                >{s}</button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-400">No adoption requests found</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr><th className="text-left p-4 font-medium text-gray-500">ID</th><th className="text-left p-4 font-medium text-gray-500">Pet</th><th className="text-left p-4 font-medium text-gray-500">Adopter</th><th className="text-left p-4 font-medium text-gray-500">Status</th><th className="text-left p-4 font-medium text-gray-500">Actions</th></tr>
                  </thead>
                  <tbody>
                    {filtered.map((a, i) => (
                      <motion.tr key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-800">#{a.id}</td>
                        <td className="p-4 text-gray-600">{a.petName || a.pet?.name || '—'}</td>
                        <td className="p-4 text-gray-600">{a.adopterName || a.adopter?.name || a.adopter?.email || '—'}</td>
                        <td className="p-4"><Badge status={adoptStatus(a.status)} /></td>
                        <td className="p-4">
                          {(a.status === 5 || a.status === 'Completed') ? (
                            <span className="text-gray-400 text-xs">Completed</span>
                          ) : (
                            <div className="flex gap-2">
                              <Button variant="teal" className="text-sm !px-4 !py-1.5" onClick={() => updateStatus(a.id, adoptStatus(a.status) === 'Application Received' ? 'UnderReview' : adoptStatus(a.status) === 'Under Review' ? 'Approved' : 'Completed')}>
                                {adoptStatus(a.status) === 'Application Received' ? 'Start Review' : adoptStatus(a.status) === 'Under Review' ? 'Approve' : 'Complete'}
                              </Button>
                            </div>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

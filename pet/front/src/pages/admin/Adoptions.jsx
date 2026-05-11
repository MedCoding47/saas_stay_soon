import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAdoptions } from '../../hooks/useAdoptions';
import Navbar from '../../components/layout/Navbar';
import AdminSidebar from '../../components/layout/AdminSidebar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PageTransition from '../../components/animations/PageTransition';

const adoptStatus = (s) => {
  if (typeof s === 'number') {
    const map = { 2: 'Pending', 3: 'Under Review', 4: 'Approved', 5: 'Completed', 6: 'Rejected' };
    return map[s] || 'Unknown';
  }
  const map = { ApplicationReceived: 'Pending', UnderReview: 'Under Review', Approved: 'Approved', Completed: 'Completed', Rejected: 'Rejected' };
  return map[s] || s || 'Unknown';
};

export default function AdminAdoptions() {
  const { adoptions, loading, updateStatus } = useAdoptions();
  const [filter, setFilter] = useState('All');

  const statuses = ['All', 'Pending', 'Under Review', 'Approved', 'Completed', 'Rejected'];
  const filtered = filter === 'All' ? adoptions : adoptions.filter((a) => adoptStatus(a.status) === filter);

  const statusActions = { Pending: 'Under Review', 'Under Review': 'Approved', Approved: 'Completed' };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <AdminSidebar />
        <div className="pl-64 pt-16">
          <div className="max-w-7xl mx-auto px-8 py-8">
            <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold text-gray-900 mb-8">
              Adoption Requests
            </motion.h1>

            <div className="flex gap-2 mb-6 flex-wrap">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === s ? 'bg-coral text-white' : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm border border-gray-100'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {loading ? <LoadingSpinner /> : (
              <div className="bg-white rounded-2xl shadow-card overflow-hidden border border-gray-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500">
                      <th className="text-left px-6 py-4 font-medium">Applicant</th>
                      <th className="text-left px-6 py-4 font-medium">Pet</th>
                      <th className="text-left px-6 py-4 font-medium">Status</th>
                      <th className="text-left px-6 py-4 font-medium">Date</th>
                      <th className="text-right px-6 py-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan={5} className="text-center text-gray-400 py-12">No adoption requests</td></tr>
                    ) : (
                      filtered.map((a, i) => (
                        <motion.tr
                          key={a.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-6 py-4 font-medium text-gray-800">{a.applicantName || a.applicantEmail || `User #${a.userId}`}</td>
                          <td className="px-6 py-4 text-gray-600">{a.petName || `Pet #${a.petId}`}</td>
                          <td className="px-6 py-4"><Badge status={adoptStatus(a.status)} /></td>
                          <td className="px-6 py-4 text-gray-400">{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : '—'}</td>
                          <td className="px-6 py-4 text-right">
                            {statusActions[adoptStatus(a.status)] && (
                              <Button
                                variant="teal"
                                className="!px-4 !py-1.5 text-xs"
                                onClick={() => updateStatus(a.id, statusActions[adoptStatus(a.status)])}
                              >
                                {statusActions[adoptStatus(a.status)] === 'Approved' ? 'Approve' : statusActions[adoptStatus(a.status)] === 'Completed' ? 'Complete' : 'Review'}
                              </Button>
                            )}
                            {adoptStatus(a.status) === 'Pending' && (
                              <Button
                                variant="ghost"
                                className="!px-4 !py-1.5 text-xs !text-red-500 ml-2"
                                onClick={() => updateStatus(a.id, 'Rejected')}
                              >
                                Reject
                              </Button>
                            )}
                          </td>
                        </motion.tr>
                      ))
                    )}
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

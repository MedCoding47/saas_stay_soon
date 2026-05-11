import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/client';
import Navbar from '../../components/layout/Navbar';
import AdminSidebar from '../../components/layout/AdminSidebar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PageTransition from '../../components/animations/PageTransition';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users').then(({ data }) => {
      setUsers(Array.isArray(data) ? data : data.$values || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <PageTransition>
      <div className="min-h-screen bg-warm-light">
        <Navbar />
        <AdminSidebar />
        <div className="pl-64 pt-16">
          <div className="max-w-7xl mx-auto px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">User Management</h1>

            {users.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-400">No users found</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr><th className="text-left p-4 font-medium text-gray-500">Name</th><th className="text-left p-4 font-medium text-gray-500">Email</th><th className="text-left p-4 font-medium text-gray-500">Role</th><th className="text-left p-4 font-medium text-gray-500">Joined</th></tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => (
                      <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-800">{u.name || u.fullName || u.email}</td>
                        <td className="p-4 text-gray-600">{u.email}</td>
                        <td className="p-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            u.role === 'Admin' ? 'bg-coral/10 text-coral' :
                            u.role === 'SuperAdmin' ? 'bg-purple-100 text-purple-700' :
                            'bg-teal/10 text-teal'
                          }`}>{u.role || 'Applicant'}</span>
                        </td>
                        <td className="p-4 text-gray-400">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
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

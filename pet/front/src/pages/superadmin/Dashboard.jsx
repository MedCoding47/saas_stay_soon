import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/client';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PageTransition from '../../components/animations/PageTransition';

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('pawfinds-user') || '{}');
  const [stats, setStats] = useState({ users: 0, organizations: 0, pets: 0, adoptions: 0 });
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [orgForm, setOrgForm] = useState({ name: '', email: '' });

  useEffect(() => {
    if (user.role !== 'SuperAdmin') { navigate('/admin'); return; }
    Promise.all([
      api.get('/pets').then(({ data }) => {
        const p = Array.isArray(data) ? data : data.$values || [];
        setStats((s) => ({ ...s, pets: p.length }));
      }).catch(() => {}),
      api.get('/adoptions').then(({ data }) => {
        const a = Array.isArray(data) ? data : data.$values || [];
        setStats((s) => ({ ...s, adoptions: a.length }));
      }).catch(() => {}),
      api.get('/users').then(({ data }) => {
        const u = Array.isArray(data) ? data : data.$values || [];
        setStats((s) => ({ ...s, users: u.length }));
      }).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const createOrganization = async (e) => {
    e.preventDefault();
    try {
      await api.post('/organizations', orgForm);
      setModalOpen(false);
      setOrgForm({ name: '', email: '' });
    } catch {}
  };

  if (loading) return <LoadingSpinner />;

  return (
    <PageTransition>
      <div className="min-h-screen bg-warm-light">
        <nav className="bg-white shadow-sm border-b border-gray-100 px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">🐾</span>
            <span className="font-bold text-gray-900">PawFinds <span className="text-coral text-xs font-normal ml-1">SuperAdmin</span></span>
          </div>
          <button onClick={() => { localStorage.removeItem('pawfinds-token'); localStorage.removeItem('pawfinds-user'); navigate('/'); }}
            className="btn-ghost text-sm">Logout</button>
        </nav>

        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
            <Button variant="primary" onClick={() => setModalOpen(true)}>+ New Organization</Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[
              { label: 'Total Users', value: stats.users, icon: '👥', color: 'text-coral' },
              { label: 'Organizations', value: stats.organizations, icon: '🏢', color: 'text-teal' },
              { label: 'Total Pets', value: stats.pets, icon: '🐾', color: 'text-amber-600' },
              { label: 'Adoptions', value: stats.adoptions, icon: '📋', color: 'text-blue-600' },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="card">
                <div className="text-2xl mb-2">{s.icon}</div>
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-gray-500 text-sm mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>

          <Card className="p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Platform Overview</h2>
            <p className="text-gray-500">Manage organizations, monitor platform stats, and oversee all shelters from one place.</p>
          </Card>
        </div>

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Organization">
          <form onSubmit={createOrganization}>
            <Input label="Organization Name" value={orgForm.name} onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })} required />
            <Input label="Admin Email" type="email" value={orgForm.email} onChange={(e) => setOrgForm({ ...orgForm, email: e.target.value })} required />
            <div className="flex gap-3 mt-6">
              <Button type="submit" variant="primary">Create</Button>
              <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            </div>
          </form>
        </Modal>
      </div>
    </PageTransition>
  );
}

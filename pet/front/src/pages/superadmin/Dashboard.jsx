import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/client';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import PageTransition from '../../components/animations/PageTransition';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [adoptRequests, setAdoptRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [statsRes, usersRes, orgsRes, adoptReqRes] = await Promise.all([
          api.get('/superadmin/dashboard'),
          api.get('/superadmin/users'),
          api.get('/superadmin/organizations'),
          api.get('/superadmin/adopt-requests'),
        ]);
        if (cancelled) return;
        setStats(statsRes.data);
        setUsers(usersRes.data || []);
        setOrgs(orgsRes.data || []);
        setAdoptRequests(adoptReqRes.data || []);
      } catch (err) {
        console.error('SuperAdmin load error', err);
      }
      if (!cancelled) setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const handleRespond = async (id, approved) => {
    try {
      await api.post(`/superadmin/adopt-requests/${id}/respond`, { approved, response: approved ? 'Approved' : 'Rejected' });
      setAdoptRequests((prev) => prev.filter((r) => r.id !== id));
    } catch {}
  };

  if (loading) return <PageTransition><Navbar /><div className="min-h-screen pt-24 flex items-center justify-center"><LoadingSpinner /></div><Footer /></PageTransition>;

  return (
    <PageTransition>
      <Navbar />
      <main className="min-h-screen bg-warm pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Super Admin Dashboard</h1>

          <div className="flex gap-2 mb-8 flex-wrap">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'users', label: `Users (${users.length})` },
              { key: 'orgs', label: `Organizations (${orgs.length})` },
              { key: 'requests', label: `Adopt Requests (${adoptRequests.length})` },
            ].map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-4 py-2 rounded-pill text-sm font-medium transition-all ${tab === t.key ? 'bg-coral text-white' : 'bg-white text-gray-700 hover:bg-warm-dark'}`}>
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'overview' && stats && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'Total Users', value: stats.totalUsers },
                { label: 'Organizations', value: stats.totalOrgs },
                { label: 'Total Pets', value: stats.totalPets },
                { label: 'Adoptions', value: stats.totalAdoptions },
                { label: 'Pending Requests', value: stats.pendingAdoptRequests },
                { label: 'Veterinaires', value: stats.totalVets },
              ].map((s) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-card p-6 text-center">
                  <p className="text-3xl font-bold text-coral">{s.value}</p>
                  <p className="text-sm text-muted mt-1">{s.label}</p>
                </motion.div>
              ))}
            </div>
          )}

            {tab === 'users' && (
            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
              <div className="p-4 border-b border-warm-dark/20 flex justify-between items-center">
                <span className="text-sm text-muted">{users.length} users</span>
                <Link to="/superadmin/create-account" className="text-sm text-coral font-medium hover:underline">+ Create Account</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-warm">
                    <tr>
                      <th className="text-left p-4 font-semibold text-muted">Name</th>
                      <th className="text-left p-4 font-semibold text-muted">Email</th>
                      <th className="text-left p-4 font-semibold text-muted">Role</th>
                      <th className="text-left p-4 font-semibold text-muted">Organization</th>
                      <th className="text-left p-4 font-semibold text-muted">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-t border-warm-dark/50 hover:bg-warm/50 transition-colors">
                        <td className="p-4"><Link to={`/superadmin/users/${u.id}`} className="font-medium text-coral hover:underline">{u.fullName}</Link></td>
                        <td className="p-4 text-muted">{u.email}</td>
                        <td className="p-4"><span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-coral-light text-coral">{u.role}</span></td>
                        <td className="p-4 text-muted">{u.orgName}</td>
                        <td className="p-4"><span className={`text-xs font-semibold ${u.isActive ? 'text-green-600' : 'text-red-500'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'orgs' && (
            <div className="grid gap-4">
              {orgs.map((o) => (
                <motion.div key={o.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-card p-4 flex items-center justify-between">
                  <div>
                      <h3 className="font-bold text-gray-900"><button onClick={() => navigate(`/superadmin/organizations/${o.id}`)} className="hover:text-coral transition-colors text-left">{o.name}</button></h3>
                    <p className="text-xs text-muted">Slug: {o.slug} · {o.userCount} users · {o.petCount} pets</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${o.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{o.isActive ? 'Active' : 'Inactive'}</span>
                </motion.div>
              ))}
            </div>
          )}

          {tab === 'requests' && (
            <div>
              {adoptRequests.length === 0 ? (
                <div className="text-center py-16 text-muted">No pending adopt requests.</div>
              ) : (
                <div className="grid gap-4">
                  {adoptRequests.map((r) => (
                    <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-xl shadow-card p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900">{r.petName} ({r.species})</h3>
                          <p className="text-xs text-muted">By: {r.userName}</p>
                          <p className="text-xs text-muted-light mt-1">Created: {new Date(r.createdAt).toLocaleDateString()}</p>
                          {r.isOverdue && <p className="text-xs text-red-500 font-semibold mt-1">{'⚠'} Overdue (response over 24h)</p>}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${r.status === 'Pending' ? 'bg-amber-100 text-amber-700' : r.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{r.status}</span>
                      </div>
                      {r.status === 'Pending' && (
                        <div className="flex gap-2 mt-4">
                          <Button variant="primary" className="!rounded-pill !px-4 !py-1.5 text-xs" onClick={() => handleRespond(r.id, true)}>Approve</Button>
                          <Button variant="outline" className="!rounded-pill !px-4 !py-1.5 text-xs !border-red-400 !text-red-500" onClick={() => handleRespond(r.id, false)}>Reject</Button>
                        </div>
                      )}
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

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/client';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import PageTransition from '../../components/animations/PageTransition';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const roleBadgeClass = (role) => {
  switch (role) {
    case 'Veterinaire': return 'tag-teal';
    case 'Client': return 'tag-outline';
    case 'Enterprise': return 'tag-coral';
    case 'SuperAdmin': return 'tag-dark';
    default: return 'tag-outline';
  }
};

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

  if (loading) return <PageTransition><Navbar /><div className="min-h-screen bg-[#FAF7F2] pt-24 flex items-center justify-center"><LoadingSpinner /></div><Footer /></PageTransition>;

  return (
    <PageTransition>
      <Navbar />
      <main className="min-h-screen bg-[#FAF7F2] pt-24 pb-20">
        <div className="bg-white border-b border-[#E8E0D8]">
          <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
            <h1 className="font-display font-black text-3xl text-[#0D0D0D]">Super Admin Dashboard</h1>
            <div className="flex gap-2">
              {[
                { key: 'overview', label: 'Overview' },
                { key: 'users', label: `Users (${users.length})` },
                { key: 'orgs', label: `Organizations (${orgs.length})` },
                { key: 'requests', label: `Adopt Requests (${adoptRequests.length})` },
              ].map((t) => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                    tab === t.key
                      ? 'bg-[#0D0D0D] text-[#FAF7F2]'
                      : 'bg-[#FAF7F2] text-[#8c7e74] border border-[#E8E0D8]'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {tab === 'overview' && stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Total Users', value: stats.totalUsers },
                { label: 'Organizations', value: stats.totalOrgs },
                { label: 'Total Pets', value: stats.totalPets },
                { label: 'Adoptions', value: stats.totalAdoptions },
                { label: 'Pending Requests', value: stats.pendingAdoptRequests },
                { label: 'Veterinaires', value: stats.totalVets },
              ].map((s, idx) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`bg-white rounded-3xl border border-[#E8E0D8] p-8 ${idx === 0 ? 'border-l-4 border-l-coral' : ''}`}>
                  <p className="font-display font-black text-[56px] leading-none text-[#0D0D0D]">{s.value}</p>
                  <p className="text-xs font-bold tracking-widest uppercase text-[#8c7e74] mt-2">{s.label}</p>
                </motion.div>
              ))}
            </div>
          )}

          {tab === 'users' && (
            <div className="bg-white rounded-3xl border border-[#E8E0D8] overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E0D8]">
                <span className="text-xs font-bold tracking-widest uppercase text-[#8c7e74]">{users.length} users</span>
                <Link to="/superadmin/create-account" className="btn-dark text-sm px-5 py-2">+ Create Account</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#FAF7F2] border-b border-[#E8E0D8]">
                    <tr>
                      <th className="text-xs font-bold tracking-widest uppercase text-[#8c7e74] px-6 py-4 text-left">Name</th>
                      <th className="text-xs font-bold tracking-widest uppercase text-[#8c7e74] px-6 py-4 text-left">Email</th>
                      <th className="text-xs font-bold tracking-widest uppercase text-[#8c7e74] px-6 py-4 text-left">Role</th>
                      <th className="text-xs font-bold tracking-widest uppercase text-[#8c7e74] px-6 py-4 text-left">Organization</th>
                      <th className="text-xs font-bold tracking-widest uppercase text-[#8c7e74] px-6 py-4 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-[#FAF7F2] transition-colors">
                        <td className="px-6 py-4 text-sm text-[#0D0D0D] border-b border-[#E8E0D8]">
                          <Link to={`/superadmin/users/${u.id}`} className="font-semibold text-coral hover:underline cursor-pointer">{u.fullName}</Link>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#0D0D0D] border-b border-[#E8E0D8]">{u.email}</td>
                        <td className="px-6 py-4 text-sm border-b border-[#E8E0D8]">
                          <span className={`tag ${roleBadgeClass(u.role)}`}>{u.role}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#0D0D0D] border-b border-[#E8E0D8]">{u.orgName}</td>
                        <td className="px-6 py-4 text-sm border-b border-[#E8E0D8]">
                          {u.isActive ? (
                            <span className="inline-flex items-center gap-1.5 text-teal font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal" />
                              Active
                            </span>
                          ) : (
                            <span className="text-[#8c7e74]">Inactive</span>
                          )}
                        </td>
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
                  className="bg-white rounded-3xl border border-[#E8E0D8] p-6 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-[#0D0D0D]">
                      <button onClick={() => navigate(`/superadmin/organizations/${o.id}`)} className="hover:text-coral transition-colors text-left font-display font-black">
                        {o.name}
                      </button>
                    </h3>
                    <p className="text-xs text-[#8c7e74] mt-1">Slug: {o.slug} &middot; {o.userCount} users &middot; {o.petCount} pets</p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${o.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {o.isActive ? 'Active' : 'Inactive'}
                  </span>
                </motion.div>
              ))}
            </div>
          )}

          {tab === 'requests' && (
            <div>
              {adoptRequests.length === 0 ? (
                <div className="text-center py-16 text-[#8c7e74] bg-white rounded-3xl border border-[#E8E0D8]">No pending adopt requests.</div>
              ) : (
                <div className="grid gap-4">
                  {adoptRequests.map((r) => (
                    <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-3xl border border-[#E8E0D8] p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-display font-bold text-lg text-[#0D0D0D]">{r.petName} ({r.species})</h3>
                          <p className="text-xs text-[#8c7e74] mt-1">By: {r.userName}</p>
                          <p className="text-xs text-[#8c7e74] mt-1">Created: {new Date(r.createdAt).toLocaleDateString()}</p>
                          {r.isOverdue && <p className="text-xs text-red-500 font-semibold mt-1">{'\u26A0'} Overdue (response over 24h)</p>}
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

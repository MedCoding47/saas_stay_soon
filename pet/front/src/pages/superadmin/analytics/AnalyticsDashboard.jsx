import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell,
  BarChart, Bar,
  ResponsiveContainer,
} from 'recharts';
import api from '../../../api/client';
import RatingStars from '../../../components/ui/RatingStars';

const COLORS = { Dog: '#8B2500', Cat: '#C8962A', Rabbit: '#0F6E56', Other: '#666' };
const ACTIVITY_COLORS = { booking: '#8B2500', review: '#C8962A', adoption: '#22c55e', signup: '#0F6E56' };

function relativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

function fmtMAD(val) {
  return Number(val || 0).toLocaleString('fr-MA') + ' MAD';
}

function SkeletonBlock({ className }) {
  return <div className={`bg-[#1C0F07] animate-pulse rounded-xl ${className || ''}`} style={{ animation: 'shimmer 1.5s infinite' }} />;
}

export default function AnalyticsDashboard() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [bookingsOverTime, setBookingsOverTime] = useState([]);
  const [petsByType, setPetsByType] = useState([]);
  const [topShelters, setTopShelters] = useState([]);
  const [topVets, setTopVets] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('30d');
  const [shelterSort, setShelterSort] = useState({ key: null, dir: 'desc' });
  const [vetSort, setVetSort] = useState({ key: null, dir: 'desc' });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewRes, petsRes, sheltersRes, vetsRes, activityRes] = await Promise.all([
        api.get('/analytics/overview'),
        api.get('/analytics/pets-by-type'),
        api.get('/analytics/top-shelters'),
        api.get('/analytics/top-vets'),
        api.get('/analytics/recent-activity'),
      ]);
      setOverview(overviewRes.data);
      setPetsByType(petsRes.data || []);
      setTopShelters(sheltersRes.data || []);
      setTopVets(vetsRes.data || []);
      setRecentActivity(activityRes.data || []);
    } catch (err) {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    let cancelled = false;
    api.get(`/analytics/bookings-over-time?period=${period}`).then(({ data }) => {
      if (!cancelled) setBookingsOverTime(data || []);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [period]);

  useEffect(() => {
    const id = setInterval(() => {
      api.get('/analytics/recent-activity').then(({ data }) => {
        setRecentActivity(data || []);
      }).catch(() => {});
    }, 30000);
    return () => clearInterval(id);
  }, []);

  const sortData = (data, sort) => {
    if (!sort.key) return data;
    return [...data].sort((a, b) => {
      const va = a[sort.key], vb = b[sort.key];
      if (typeof va === 'string') return sort.dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      return sort.dir === 'asc' ? (va - vb) : (vb - va);
    });
  };

  const handleSort = (setter, sort, key) => {
    setter({ key, dir: sort.key === key && sort.dir === 'asc' ? 'desc' : 'asc' });
  };

  const SortChevron = ({ sort, label, sortKey }) => (
    <button onClick={() => handleSort(sort.setter, sort.state, sortKey)} className="flex items-center gap-1 text-left">
      {label}
      {sort.state.key === sortKey && <span className="text-xs">{sort.state.dir === 'asc' ? '\u25B2' : '\u25BC'}</span>}
    </button>
  );

  const totalPets = petsByType.reduce((s, p) => s + p.count, 0);

  return (
    <main className="min-h-screen pb-20" style={{ backgroundColor: '#0D0704' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <button onClick={() => navigate('/superadmin/dashboard')} className="text-sm text-gray-400 hover:text-white transition-colors">&larr; Back to Dashboard</button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-amber-900/30 border border-amber-700/50 text-amber-300 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={fetchAll} className="px-3 py-1 rounded-lg bg-amber-700/50 text-amber-200 text-xs font-medium hover:bg-amber-700/70">Retry</button>
          </div>
        )}

        {/* Row 1 — KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {loading ? Array.from({ length: 4 }).map((_, i) => <SkeletonBlock key={i} className="h-28" />) : (
            <>
              <KpiCard icon="💰" label="Total Revenue" value={fmtMAD(overview?.totalRevenue)} />
              <KpiCard icon="📋" label="Total Bookings" value={overview?.totalBookings} sub={`▲ ${overview?.pendingBookings || 0} pending`} subClass="text-amber-400" />
              <KpiCard icon="🐾" label="Active Listings" value={overview?.activeListings} sub={`${overview?.adoptionsThisMonth || 0} adopted this month`} subClass="text-green-400" />
              <KpiCard icon="👥" label="Total Users" value={overview?.totalUsers} sub={`▲ ${overview?.newUsersThisMonth || 0} new this month`} subClass="text-[var(--sh-gold)]" />
            </>
          )}
        </div>

        {/* Row 2 — Bookings over time */}
        <div className="mb-8">
          <div className="bg-[#1C0F07] border border-amber-900/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold">Bookings Over Time</h2>
              <div className="flex gap-1">
                {['7d', '30d', '90d'].map((p) => (
                  <button key={p} onClick={() => setPeriod(p)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${period === p ? 'bg-[#8B2500] text-white' : 'bg-[#2A1810] text-gray-400 hover:bg-[#3A2810]'}`}>
                    {p === '7d' ? '7 days' : p === '30d' ? '30 days' : '90 days'}
                  </button>
                ))}
              </div>
            </div>
            {loading ? <SkeletonBlock className="h-64" /> : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={bookingsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A1810" />
                  <XAxis dataKey="date" tick={{ fill: '#999', fontSize: 12 }} tickLine={false} />
                  <YAxis tick={{ fill: '#999', fontSize: 12 }} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1C0F07', border: '1px solid rgba(201,150,42,0.3)', borderRadius: 8, color: '#fff' }} />
                  <Line type="monotone" dataKey="count" stroke="#8B2500" strokeWidth={2} dot={false} name="Bookings" />
                  <Line type="monotone" dataKey="revenue" stroke="#C8962A" strokeWidth={2} dot={false} name="Revenue (MAD)" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Row 3 — Two charts side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          {/* Pets by Type — Pie Chart */}
          <div className="bg-[#1C0F07] border border-amber-900/30 rounded-xl p-6">
            <h2 className="text-white font-bold mb-4">Pets by Type</h2>
            {loading ? <SkeletonBlock className="h-64" /> : (
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={petsByType} dataKey="count" nameKey="type" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3}>
                      {petsByType.map((entry) => (
                        <Cell key={entry.type} fill={COLORS[entry.type] || COLORS.Other} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1C0F07', border: '1px solid rgba(201,150,42,0.3)', borderRadius: 8, color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-4 mt-3">
                  {petsByType.map((p) => (
                    <div key={p.type} className="flex items-center gap-2 text-sm">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[p.type] || COLORS.Other }} />
                      <span className="text-gray-300">{p.type}</span>
                      <span className="text-gray-500">{p.count} ({totalPets > 0 ? Math.round(p.count / totalPets * 100) : 0}%)</span>
                      <span className="text-green-400 text-xs">{Math.round(p.adopted / (p.count || 1) * 100)}% adopted</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Platform Activity — Bar Chart */}
          <div className="bg-[#1C0F07] border border-amber-900/30 rounded-xl p-6">
            <h2 className="text-white font-bold mb-4">Platform Activity (Last 7 days)</h2>
            {loading ? <SkeletonBlock className="h-64" /> : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={bookingsOverTime.filter((_, i) => i >= bookingsOverTime.length - 7)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A1810" />
                  <XAxis dataKey="date" tick={{ fill: '#999', fontSize: 12 }} tickLine={false} />
                  <YAxis tick={{ fill: '#999', fontSize: 12 }} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1C0F07', border: '1px solid rgba(160,82,45,0.3)', borderRadius: 8, color: '#fff' }} />
                  <Bar dataKey="count" fill="#A0522D" radius={[4, 4, 0, 0]} name="Bookings" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Row 4 — Two tables side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          {/* Top Shelters */}
          <div className="bg-[#1C0F07] border border-amber-900/30 rounded-xl p-6 overflow-hidden">
            <h2 className="text-white font-bold mb-4">Top 10 Shelters</h2>
            {loading ? <SkeletonBlock className="h-64" /> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 text-xs border-b border-amber-900/20">
                      <th className="p-2 text-left">#</th>
                      <th className="p-2 text-left"><SortChevron sort={{ setter: setShelterSort, state: shelterSort }} sortKey="name" label="Name" /></th>
                      <th className="p-2 text-left"><SortChevron sort={{ setter: setShelterSort, state: shelterSort }} sortKey="city" label="City" /></th>
                      <th className="p-2 text-right"><SortChevron sort={{ setter: setShelterSort, state: shelterSort }} sortKey="bookingCount" label="Bookings" /></th>
                      <th className="p-2 text-center">Rating</th>
                      <th className="p-2 text-right"><SortChevron sort={{ setter: setShelterSort, state: shelterSort }} sortKey="petCount" label="Pets" /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortData(topShelters, shelterSort).map((s, i) => (
                      <tr key={s.id} className={`border-b border-amber-900/10 cursor-pointer hover:bg-[#2A1810]/50 transition-colors ${i % 2 === 1 ? 'bg-[#251208]/30' : ''}`}
                        onClick={() => navigate(`/superadmin/organizations/${s.id}`)}>
                        <td className="p-2 text-gray-500">{i + 1}</td>
                        <td className="p-2 text-gray-200 font-medium">{s.name}</td>
                        <td className="p-2 text-gray-400">{s.city}</td>
                        <td className="p-2 text-gray-200 text-right">{s.bookingCount}</td>
                        <td className="p-2 text-center"><RatingStars rating={s.avgRating} size="sm" showValue={false} /></td>
                        <td className="p-2 text-gray-200 text-right">{s.petCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Top Vets */}
          <div className="bg-[#1C0F07] border border-amber-900/30 rounded-xl p-6 overflow-hidden">
            <h2 className="text-white font-bold mb-4">Top 10 Vets</h2>
            {loading ? <SkeletonBlock className="h-64" /> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 text-xs border-b border-amber-900/20">
                      <th className="p-2 text-left">#</th>
                      <th className="p-2 text-left"><SortChevron sort={{ setter: setVetSort, state: vetSort }} sortKey="name" label="Name" /></th>
                      <th className="p-2 text-left"><SortChevron sort={{ setter: setVetSort, state: vetSort }} sortKey="city" label="City" /></th>
                      <th className="p-2 text-right"><SortChevron sort={{ setter: setVetSort, state: vetSort }} sortKey="bookingCount" label="Bookings" /></th>
                      <th className="p-2 text-center">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortData(topVets, vetSort).map((v, i) => (
                      <tr key={v.id} className={`border-b border-amber-900/10 cursor-pointer hover:bg-[#2A1810]/50 transition-colors ${i % 2 === 1 ? 'bg-[#251208]/30' : ''}`}
                        onClick={() => navigate(`/superadmin/users/${v.id}`)}>
                        <td className="p-2 text-gray-500">{i + 1}</td>
                        <td className="p-2 text-gray-200 font-medium">{v.name}</td>
                        <td className="p-2 text-gray-400">{v.city}</td>
                        <td className="p-2 text-gray-200 text-right">{v.bookingCount}</td>
                        <td className="p-2 text-center"><RatingStars rating={v.avgRating} size="sm" showValue={false} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Row 5 — Recent Activity */}
        <div>
          <div className="bg-[#1C0F07] border border-amber-900/30 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <h2 className="text-white font-bold">Live Activity</h2>
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonBlock key={i} className="h-12" />)}
              </div>
            ) : (
              <div className="space-y-0">
                {recentActivity.map((a, i) => (
                  <div key={i} className="flex items-start gap-3 py-3 border-b border-amber-900/10 last:border-0">
                    <span className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: ACTIVITY_COLORS[a.type] || '#666' }} />
                    <p className="text-sm text-gray-300 flex-1">{a.description}</p>
                    <span className="text-xs text-gray-500 shrink-0">{relativeTime(a.timestamp)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}

function KpiCard({ icon, label, value, sub, subClass }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-[#1C0F07] border border-amber-900/30 rounded-xl p-5">
      <p className="text-gray-400 text-sm mb-1">{icon} {label}</p>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      {sub && <p className={`text-xs ${subClass || 'text-gray-500'}`}>{sub}</p>}
    </motion.div>
  );
}

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, HeartPulse, MapPin, Phone, Mail, GraduationCap, Plus, Clock, Users, Stethoscope } from 'lucide-react';
import api from '../../api/client';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import PageTransition from '../../components/animations/PageTransition';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { BentoGridShowcase } from '../../components/ui/bento-grid';

const tabs = [
  { key: 'profile', label: 'Profile', icon: '👤' },
  { key: 'advice', label: 'Advice', icon: '💡' },
  { key: 'recommendations', label: 'Tips', icon: '📋' },
  { key: 'bookings', label: 'Bookings', icon: '📅' },
];

export default function VeterinaireDashboard() {
  const [profile, setProfile] = useState(null);
  const [advice, setAdvice] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('profile');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editForm, setEditForm] = useState({});

  const [adviceModal, setAdviceModal] = useState(false);
  const [adviceForm, setAdviceForm] = useState({ title: '', content: '' });

  const [recoModal, setRecoModal] = useState(false);
  const [recoForm, setRecoForm] = useState({ title: '', description: '', targetSpecies: '', targetAgeRange: '' });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [profileRes, adviceRes, bookingsRes, recoRes] = await Promise.all([
          api.get('/veterinaire/profile'),
          api.get('/veterinaire/advice'),
          api.get('/veterinaire/bookings'),
          api.get('/veterinaire/recommendations'),
        ]);
        if (cancelled) return;
        setProfile(profileRes.data);
        setAdvice(adviceRes.data || []);
        setBookings(bookingsRes.data || []);
        setRecommendations(recoRes.data || []);
      } catch {}
      if (!cancelled) setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const handleEditProfile = () => {
    setEditForm({
      clinicName: profile.clinicName,
      location: profile.location,
      phone: profile.phone || '',
      description: profile.description || '',
      isAvailable: profile.isAvailable,
      formation: profile.formation || '',
    });
    setEditing(true);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setError('');
    try {
      await api.put('/veterinaire/profile', { ...editForm, latitude: profile.latitude, longitude: profile.longitude });
      setEditing(false);
      const { data } = await api.get('/veterinaire/profile');
      setProfile(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    }
    setSaving(false);
  };

  const handleEditChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setEditForm({ ...editForm, [e.target.name]: value });
  };

  const handleAddAdvice = async () => {
    try {
      await api.post('/veterinaire/advice', adviceForm);
      setAdviceModal(false);
      setAdviceForm({ title: '', content: '' });
      const { data } = await api.get('/veterinaire/advice');
      setAdvice(data || []);
    } catch {}
  };

  const handleDeleteAdvice = async (id) => {
    try {
      await api.delete(`/veterinaire/advice/${id}`);
      setAdvice((prev) => prev.filter((a) => a.id !== id));
    } catch {}
  };

  const handleAddReco = async () => {
    try {
      const body = {
        title: recoForm.title,
        description: recoForm.description,
        targetSpecies: recoForm.targetSpecies || null,
        targetAgeRange: recoForm.targetAgeRange || null,
      };
      await api.post('/veterinaire/recommendations', body);
      setRecoModal(false);
      setRecoForm({ title: '', description: '', targetSpecies: '', targetAgeRange: '' });
      const { data } = await api.get('/veterinaire/recommendations');
      setRecommendations(data || []);
    } catch {}
  };

  const handleDeleteReco = async (id) => {
    try {
      await api.delete(`/veterinaire/recommendations/${id}`);
      setRecommendations((prev) => prev.filter((r) => r.id !== id));
    } catch {}
  };

  const handleBookingStatus = async (id, status) => {
    try {
      await api.patch(`/veterinaire/bookings/${id}/status`, { status });
      const { data } = await api.get('/veterinaire/bookings');
      setBookings(data || []);
    } catch {}
  };

  if (loading) return <PageTransition><Navbar /><div className="min-h-screen pt-24 flex items-center justify-center"><LoadingSpinner /></div><Footer /></PageTransition>;

  const AvatarCard = () => (
    <Card className="relative h-full w-full overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-6 text-center">
        {profile.profilePictureUrl ? (
          <img src={profile.profilePictureUrl} alt="" className="w-28 h-28 rounded-full object-cover border-4 border-white/30 shadow-xl mb-4" />
        ) : (
          <div className="w-28 h-28 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center text-white text-4xl font-bold shadow-xl mb-4">
            {profile.userName?.[0] || 'V'}
          </div>
        )}
        <h2 className="text-2xl font-bold text-white mb-1">{profile.userName || 'Veterinaire'}</h2>
        <p className="text-white/80 text-sm mb-1">{profile.clinicName}</p>
        <p className="text-white/60 text-xs">{profile.userEmail}</p>
        {profile.isAvailable && (
          <span className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-400/20 text-green-200 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Available for consultations
          </span>
        )}
      </div>
    </Card>
  );

  const ContactCard = () => (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="w-4 h-4 text-coral" />
          Contact & Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
          <span>{profile.location || '—'}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
          <span>{profile.phone || '—'}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="truncate">{profile.userEmail}</span>
        </div>
      </CardContent>
    </Card>
  );

  const FormationCard = () => (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-coral" />
          Credentials
        </CardTitle>
      </CardHeader>
      <CardContent>
        {profile.formation ? (
          <div className="flex flex-wrap gap-2">
            {profile.formation.split(',').map((f, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {f.trim()}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No credentials added yet.</p>
        )}
      </CardContent>
    </Card>
  );

  const DescriptionCard = () => (
    <Card className="relative h-full w-full overflow-hidden">
      {profile.description ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30" />
          <CardHeader className="relative">
            <CardTitle className="text-lg">About</CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <p className="text-sm text-muted-foreground leading-relaxed">{profile.description}</p>
          </CardContent>
        </>
      ) : (
        <div className="h-full flex items-center justify-center p-6">
          <p className="text-sm text-muted-foreground text-center">No description yet. Edit your profile to add one.</p>
        </div>
      )}
    </Card>
  );

  const StatsCard = () => (
    <Card className="flex h-full flex-col justify-between bg-gradient-to-br from-coral-light to-amber-light p-6">
      <HeartPulse className="h-8 w-8 text-coral" />
      <div className="mt-4">
        <p className="text-5xl font-bold text-gray-900 dark:text-white">{advice.length}</p>
        <p className="text-sm text-muted-foreground mt-1">Advice articles shared</p>
      </div>
      <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{bookings.length} bookings</span>
        <span className="flex items-center gap-1.5"><Stethoscope className="w-3.5 h-3.5" />{recommendations.length} tips</span>
      </div>
    </Card>
  );

  const { MapCard, edit, ...rest } = {};

  const JourneyCard = () => (
    <Card className="relative h-full w-full overflow-hidden p-6">
      <CardHeader className="p-0 mb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="w-4 h-4 text-coral" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {bookings.length > 0 ? (
          <div className="space-y-2">
            {bookings.slice(0, 3).map((b) => (
              <div key={b.id} className="flex items-center gap-3 text-sm p-2 rounded-lg bg-muted/50">
                <div className={`w-2 h-2 rounded-full ${b.status === 'Pending' ? 'bg-amber-400' : b.status === 'Confirmed' ? 'bg-green-400' : 'bg-gray-400'}`} />
                <span className="flex-1 truncate">{b.userName}</span>
                <span className="text-xs text-muted-foreground">{new Date(b.bookingDate).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No recent activity.</p>
        )}
      </CardContent>
    </Card>
  );

  const LocationCard = profile.latitude && profile.longitude ? (
    <Card className="overflow-hidden md:col-span-1 md:row-span-1">
      <iframe
        title="Clinic Location"
        src={`https://maps.google.com/maps?q=${profile.latitude},${profile.longitude}&z=15&output=embed`}
        className="w-full h-full min-h-[200px]"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </Card>
  ) : null;

  const allSlots = [
    { key: 'integrations', component: <ContactCard /> },
    { key: 'mainFeature', component: <AvatarCard /> },
    { key: 'featureTags', component: <FormationCard /> },
    { key: 'secondaryFeature', component: <DescriptionCard /> },
    { key: 'statistic', component: <StatsCard /> },
    { key: 'journey', component: <JourneyCard /> },
  ];

  const slotMap = {};
  allSlots.forEach(s => { slotMap[s.key] = s.component; });

  return (
    <PageTransition>
      <Navbar />
      <main className="min-h-screen bg-warm pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Veterinaire Dashboard</h1>
            <div className="flex gap-2 flex-wrap">
              {tabs.map((t) => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`px-4 py-2 rounded-pill text-sm font-medium transition-all flex items-center gap-1.5 ${tab === t.key ? 'bg-coral text-white shadow-lg shadow-coral/20' : 'bg-white text-gray-700 hover:bg-warm-dark'}`}>
                  <span>{t.icon}</span> {t.label}
                </button>
              ))}
            </div>
          </div>

          {tab === 'profile' && profile && (
            <div>
              {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">{error}</p>}
              {editing ? (
                <div className="max-w-2xl mx-auto">
                  <Card>
                    <CardHeader>
                      <CardTitle>Edit Clinic Profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Name</label>
                          <input name="clinicName" value={editForm.clinicName} onChange={handleEditChange}
                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/40 focus:border-coral transition-all" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                          <input name="location" value={editForm.location} onChange={handleEditChange}
                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/40 focus:border-coral transition-all" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                          <input name="phone" value={editForm.phone} onChange={handleEditChange}
                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/40 focus:border-coral transition-all" />
                        </div>
                        <div className="flex items-center gap-3">
                          <input type="checkbox" id="isAvailable" name="isAvailable" checked={editForm.isAvailable} onChange={handleEditChange}
                            className="w-4 h-4 rounded border-gray-300 text-coral focus:ring-coral" />
                          <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700">Available for consultations</label>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Formation / Credentials</label>
                          <textarea name="formation" value={editForm.formation} onChange={handleEditChange} rows={3}
                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/40 focus:border-coral transition-all resize-none"
                            placeholder="Degrees, certifications, specialties (comma-separated)" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <textarea name="description" value={editForm.description} onChange={handleEditChange} rows={3}
                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/40 focus:border-coral transition-all resize-none" />
                        </div>
                      </div>
                      <div className="flex gap-3 mt-6">
                        <Button onClick={handleSaveProfile} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
                        <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div>
                  <BentoGridShowcase
                    integrations={slotMap.integrations}
                    featureTags={slotMap.featureTags}
                    mainFeature={slotMap.mainFeature}
                    secondaryFeature={slotMap.secondaryFeature}
                    statistic={slotMap.statistic}
                    journey={slotMap.journey}
                  />
                  {profile.latitude && profile.longitude && (
                    <div className="mt-6">
                      {LocationCard}
                    </div>
                  )}
                  <div className="mt-6 flex justify-start">
                    <Button variant="primary" className="!rounded-pill" onClick={handleEditProfile}>
                      Edit Profile
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'advice' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-muted">Share tips and advice for pet owners</p>
                <Button variant="primary" className="!rounded-pill" onClick={() => setAdviceModal(true)}>Add Advice</Button>
              </div>
              {advice.length === 0 ? (
                <div className="text-center py-20 text-muted">No advice yet.</div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {advice.map((a) => (
                    <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl shadow-card p-5 relative group border border-gray-100 hover:shadow-lg transition-shadow">
                      <button onClick={() => handleDeleteAdvice(a.id)}
                        className="absolute top-3 right-3 w-7 h-7 rounded-full bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-sm hover:bg-red-100">✕</button>
                      <h3 className="font-bold text-gray-900 pr-6">{a.title}</h3>
                      <p className="text-sm text-muted mt-2 leading-relaxed">{a.content}</p>
                      <p className="text-xs text-muted/50 mt-3">{new Date(a.createdAt).toLocaleDateString()}</p>
                    </motion.div>
                  ))}
                </div>
              )}
              <Modal isOpen={adviceModal} onClose={() => setAdviceModal(false)} title="Add Advice">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input value={adviceForm.title} onChange={(e) => setAdviceForm({ ...adviceForm, title: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/40 focus:border-coral" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                    <textarea value={adviceForm.content} onChange={(e) => setAdviceForm({ ...adviceForm, content: e.target.value })} rows={4}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/40 focus:border-coral resize-none" />
                  </div>
                  <Button onClick={handleAddAdvice} className="w-full">Save Advice</Button>
                </div>
              </Modal>
            </div>
          )}

          {tab === 'recommendations' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-muted">Product care tips for pet owners</p>
                <Button variant="primary" className="!rounded-pill" onClick={() => setRecoModal(true)}>Add Tip</Button>
              </div>
              {recommendations.length === 0 ? (
                <div className="text-center py-20 text-muted">No recommendations yet.</div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {recommendations.map((r) => (
                    <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl shadow-card p-5 relative group border border-gray-100 hover:shadow-lg transition-shadow">
                      <button onClick={() => handleDeleteReco(r.id)}
                        className="absolute top-3 right-3 w-7 h-7 rounded-full bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-sm hover:bg-red-100">✕</button>
                      <h3 className="font-bold text-gray-900 pr-6">{r.title}</h3>
                      <p className="text-sm text-muted mt-2 leading-relaxed">{r.description}</p>
                      <div className="flex gap-2 mt-3">
                        {r.targetSpecies && <span className="text-xs bg-warm rounded-full px-2.5 py-1 text-muted font-medium">{r.targetSpecies}</span>}
                        {r.targetAgeRange && <span className="text-xs bg-warm rounded-full px-2.5 py-1 text-muted font-medium">{r.targetAgeRange}</span>}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
              <Modal isOpen={recoModal} onClose={() => setRecoModal(false)} title="Add Recommendation">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input value={recoForm.title} onChange={(e) => setRecoForm({ ...recoForm, title: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/40 focus:border-coral" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea value={recoForm.description} onChange={(e) => setRecoForm({ ...recoForm, description: e.target.value })} rows={3}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/40 focus:border-coral resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Species (optional)</label>
                    <input value={recoForm.targetSpecies} onChange={(e) => setRecoForm({ ...recoForm, targetSpecies: e.target.value })}
                      placeholder="e.g. Dog, Cat, Rabbit"
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/40 focus:border-coral" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Age Range (optional)</label>
                    <input value={recoForm.targetAgeRange} onChange={(e) => setRecoForm({ ...recoForm, targetAgeRange: e.target.value })}
                      placeholder="e.g. 1-3 months, Adult, Senior"
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/40 focus:border-coral" />
                  </div>
                  <Button onClick={handleAddReco} className="w-full">Save Recommendation</Button>
                </div>
              </Modal>
            </div>
          )}

          {tab === 'bookings' && (
            <div>
              {bookings.length === 0 ? (
                <div className="text-center py-20 text-muted">No booking requests yet.</div>
              ) : (
                <div className="grid gap-4">
                  {bookings.map((b) => (
                    <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl shadow-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-gray-100">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-coral to-amber flex items-center justify-center text-white text-sm font-bold">
                            {b.userName?.[0] || 'U'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{b.userName}</p>
                            <p className="text-xs text-muted">{new Date(b.bookingDate).toLocaleDateString()} — {b.notes || 'No notes'}</p>
                          </div>
                        </div>
                        {b.petName && <p className="text-xs text-muted mt-2 ml-13">Pet: {b.petName}</p>}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${b.status === 'Pending' ? 'bg-amber-100 text-amber-700' : b.status === 'Confirmed' ? 'bg-green-100 text-green-700' : b.status === 'Completed' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{b.status}</span>
                        {b.status === 'Pending' && (
                          <>
                            <button onClick={() => handleBookingStatus(b.id, 'Confirmed')} className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full hover:bg-green-200 font-medium transition-colors">Confirm</button>
                            <button onClick={() => handleBookingStatus(b.id, 'Cancelled')} className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded-full hover:bg-red-100 font-medium transition-colors">Cancel</button>
                          </>
                        )}
                        {b.status === 'Confirmed' && (
                          <button onClick={() => handleBookingStatus(b.id, 'Completed')} className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 font-medium transition-colors">Complete</button>
                        )}
                      </div>
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

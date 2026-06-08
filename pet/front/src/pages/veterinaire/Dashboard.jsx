import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Calendar, HeartPulse, MapPin, Phone, Mail, GraduationCap, Plus, Clock, Users, Stethoscope } from 'lucide-react';
import api from '../../api/client';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import PageTransition from '../../components/animations/PageTransition';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { BentoGridShowcase } from '../../components/ui/bento-grid';

export default function VeterinaireDashboard() {
  const { t } = useTranslation();

  const tabs = [
    { key: 'profile', label: t('dashboard.vet.tabs.profile'), icon: '👤' },
    { key: 'advice', label: t('dashboard.vet.tabs.advice'), icon: '💡' },
    { key: 'recommendations', label: t('dashboard.vet.tabs.tips'), icon: '📋' },
    { key: 'bookings', label: t('dashboard.vet.tabs.bookings'), icon: '📅' },
  ];

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
      setError(err.response?.data?.message || t('dashboard.vet.failedToSave'));
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
    <div className="relative h-full w-full bg-[#0D0D0D] rounded-3xl p-8 overflow-hidden">
      <div className="h-full flex flex-col items-center justify-center text-center">
        {profile.profilePictureUrl ? (
          <img src={profile.profilePictureUrl} alt="" className="w-20 h-20 rounded-full object-cover border-4 border-white/10 shadow-xl mb-4" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-coral text-white font-display font-black text-3xl flex items-center justify-center shadow-xl mb-4">
            {profile.userName?.[0] || 'V'}
          </div>
        )}
        <h2 className="font-display font-black text-white text-3xl mt-4">{profile.userName || t('dashboard.vet.fallbackName')}</h2>
        <p className="text-white/50 text-sm mt-1">{profile.clinicName}</p>
        <p className="text-white/30 text-xs mt-1">{profile.userEmail}</p>
        {profile.isAvailable && (
          <span className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-400/20 text-green-200 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            {t('dashboard.vet.availableForConsultations')}
          </span>
        )}
      </div>
    </div>
  );

  const ContactCard = () => (
    <Card className="h-full bg-white rounded-3xl border border-[#E8E0D8] p-6">
      <p className="text-xs font-bold tracking-widest uppercase text-[#8c7e74] mb-4 flex items-center gap-2">
        <MapPin className="w-3.5 h-3.5" />
        {t('dashboard.vet.contactLocation')}
      </p>
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-sm text-[#0D0D0D] leading-relaxed">
          <MapPin className="w-4 h-4 text-[#8c7e74] shrink-0" />
          <span>{profile.location || '\u2014'}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-[#0D0D0D] leading-relaxed">
          <Phone className="w-4 h-4 text-[#8c7e74] shrink-0" />
          <span>{profile.phone || '\u2014'}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-[#0D0D0D] leading-relaxed">
          <Mail className="w-4 h-4 text-[#8c7e74] shrink-0" />
          <span className="truncate">{profile.userEmail}</span>
        </div>
      </div>
    </Card>
  );

  const FormationCard = () => (
    <Card className="h-full bg-white rounded-3xl border border-[#E8E0D8] p-6">
      <p className="text-xs font-bold tracking-widest uppercase text-[#8c7e74] mb-4 flex items-center gap-2">
        <GraduationCap className="w-3.5 h-3.5" />
        {t('dashboard.vet.credentials')}
      </p>
      <div>
        {profile.formation ? (
          <div className="flex flex-wrap gap-2">
            {profile.formation.split(',').map((f, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {f.trim()}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#8c7e74]">{t('dashboard.vet.noCredentials')}</p>
        )}
      </div>
    </Card>
  );

  const DescriptionCard = () => (
    <Card className="relative h-full w-full overflow-hidden bg-white rounded-3xl border border-[#E8E0D8] p-6">
      {profile.description ? (
        <>
          <p className="text-xs font-bold tracking-widest uppercase text-[#8c7e74] mb-4">{t('dashboard.vet.about')}</p>
          <p className="text-sm text-[#0D0D0D] leading-relaxed">{profile.description}</p>
        </>
      ) : (
        <div className="h-full flex items-center justify-center">
          <p className="text-sm text-[#8c7e74] text-center">{t('dashboard.vet.noDescription')}</p>
        </div>
      )}
    </Card>
  );

  const StatsCard = () => (
    <Card className="flex h-full flex-col justify-between bg-white rounded-3xl border border-[#E8E0D8] p-6">
      <HeartPulse className="h-8 w-8 text-coral" />
      <div className="mt-4">
        <p className="text-5xl font-bold text-[#0D0D0D]">{advice.length}</p>
        <p className="text-sm text-[#8c7e74] mt-1">{t('dashboard.vet.adviceArticlesShared')}</p>
      </div>
      <div className="mt-4 flex gap-4 text-sm text-[#8c7e74]">
        <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{bookings.length} {t('dashboard.vet.bookings')}</span>
        <span className="flex items-center gap-1.5"><Stethoscope className="w-3.5 h-3.5" />{recommendations.length} {t('dashboard.vet.tips')}</span>
      </div>
    </Card>
  );

  const { MapCard, edit, ...rest } = {};

  const JourneyCard = () => (
    <Card className="relative h-full w-full overflow-hidden bg-white rounded-3xl border border-[#E8E0D8] p-6">
      <p className="text-xs font-bold tracking-widest uppercase text-[#8c7e74] mb-4 flex items-center gap-2">
        <Clock className="w-3.5 h-3.5" />
        {t('dashboard.vet.recentActivity')}
      </p>
      <div>
        {bookings.length > 0 ? (
          <div className="space-y-2">
            {bookings.slice(0, 3).map((b) => (
              <div key={b.id} className="flex items-center gap-3 text-sm text-[#0D0D0D] p-2 rounded-lg bg-[#FAF7F2]">
                <div className={`w-2 h-2 rounded-full ${b.status === 'Pending' ? 'bg-amber-400' : b.status === 'Confirmed' ? 'bg-green-400' : 'bg-gray-400'}`} />
                <span className="flex-1 truncate">{b.userName}</span>
                <span className="text-xs text-[#8c7e74]">{new Date(b.bookingDate).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#8c7e74]">{t('dashboard.vet.noRecentActivity')}</p>
        )}
      </div>
    </Card>
  );

  const LocationCard = profile.latitude && profile.longitude ? (
    <Card className="overflow-hidden md:col-span-1 md:row-span-1 bg-white rounded-3xl border border-[#E8E0D8]">
      <iframe
        title={t('dashboard.vet.clinicLocation')}
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
      <div className="bg-white border-b border-[#E8E0D8] px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="font-display font-black text-3xl text-[#0D0D0D]">{t('dashboard.vet.title')}</h1>
          <div className="flex gap-2">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 ${tab === t.key ? 'bg-[#0D0D0D] text-[#FAF7F2]' : 'bg-[#FAF7F2] text-[#8c7e74] border border-[#E8E0D8]'}`}>
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <main className="min-h-screen bg-[#FAF7F2] pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {tab === 'profile' && profile && (
            <div>
              {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">{error}</p>}
              {editing ? (
                <div className="max-w-2xl mx-auto">
                  <Card className="bg-white rounded-3xl border border-[#E8E0D8] p-6">
                    <CardHeader className="p-0 mb-6">
                      <CardTitle className="text-xs font-bold tracking-widest uppercase text-[#8c7e74]">{t('dashboard.vet.editClinicProfile')}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-[#0D0D0D] mb-1">{t('dashboard.vet.clinicName')}</label>
                          <input name="clinicName" value={editForm.clinicName} onChange={handleEditChange}
                            className="w-full rounded-2xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/40 focus:border-coral transition-all" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[#0D0D0D] mb-1">{t('common.location')}</label>
                          <input name="location" value={editForm.location} onChange={handleEditChange}
                            className="w-full rounded-2xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/40 focus:border-coral transition-all" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[#0D0D0D] mb-1">{t('common.phone')}</label>
                          <input name="phone" value={editForm.phone} onChange={handleEditChange}
                            className="w-full rounded-2xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/40 focus:border-coral transition-all" />
                        </div>
                        <div className="flex items-center gap-3">
                          <input type="checkbox" id="isAvailable" name="isAvailable" checked={editForm.isAvailable} onChange={handleEditChange}
                            className="w-4 h-4 rounded border-gray-300 text-coral focus:ring-coral" />
                          <label htmlFor="isAvailable" className="text-sm font-semibold text-[#0D0D0D]">{t('dashboard.vet.availableForConsultations')}</label>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[#0D0D0D] mb-1">{t('dashboard.vet.formationCredentials')}</label>
                          <textarea name="formation" value={editForm.formation} onChange={handleEditChange} rows={3}
                            className="w-full rounded-2xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/40 focus:border-coral transition-all resize-none"
                            placeholder={t('dashboard.vet.formationPlaceholder')} />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[#0D0D0D] mb-1">{t('common.description')}</label>
                          <textarea name="description" value={editForm.description} onChange={handleEditChange} rows={3}
                            className="w-full rounded-2xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/40 focus:border-coral transition-all resize-none" />
                        </div>
                      </div>
                      <div className="flex gap-3 mt-6">
                        <Button onClick={handleSaveProfile} disabled={saving}>{saving ? t('common.saving') : t('common.save')}</Button>
                        <Button variant="outline" onClick={() => setEditing(false)}>{t('common.cancel')}</Button>
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
                    <Button variant="primary" className="!rounded-full" onClick={handleEditProfile}>
                      {t('dashboard.vet.editProfile')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'advice' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-[#8c7e74]">{t('dashboard.vet.shareTips')}</p>
                <Button variant="primary" className="!rounded-full" onClick={() => setAdviceModal(true)}>{t('dashboard.vet.addAdvice')}</Button>
              </div>
              {advice.length === 0 ? (
                <div className="text-center py-20 text-[#8c7e74]">{t('dashboard.vet.noAdvice')}</div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {advice.map((a) => (
                    <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-3xl p-5 relative group border border-[#E8E0D8] hover:shadow-lg transition-shadow">
                      <button onClick={() => handleDeleteAdvice(a.id)}
                        className="absolute top-3 right-3 w-7 h-7 rounded-full bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-sm hover:bg-red-100">✕</button>
                      <h3 className="font-bold text-[#0D0D0D] pr-6">{a.title}</h3>
                      <p className="text-sm text-[#8c7e74] mt-2 leading-relaxed">{a.content}</p>
                      <p className="text-xs text-[#8c7e74]/50 mt-3">{new Date(a.createdAt).toLocaleDateString()}</p>
                    </motion.div>
                  ))}
                </div>
              )}
              <Modal isOpen={adviceModal} onClose={() => setAdviceModal(false)} title={t('dashboard.vet.addAdvice')}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#0D0D0D] mb-1">{t('dashboard.vet.adviceTitle')}</label>
                    <input value={adviceForm.title} onChange={(e) => setAdviceForm({ ...adviceForm, title: e.target.value })}
                      className="w-full rounded-2xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/40 focus:border-coral" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#0D0D0D] mb-1">{t('dashboard.vet.adviceContent')}</label>
                    <textarea value={adviceForm.content} onChange={(e) => setAdviceForm({ ...adviceForm, content: e.target.value })} rows={4}
                      className="w-full rounded-2xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/40 focus:border-coral resize-none" />
                  </div>
                  <Button onClick={handleAddAdvice} className="w-full">{t('dashboard.vet.saveAdvice')}</Button>
                </div>
              </Modal>
            </div>
          )}

          {tab === 'recommendations' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-[#8c7e74]">{t('dashboard.vet.productCareTips')}</p>
                <Button variant="primary" className="!rounded-full" onClick={() => setRecoModal(true)}>{t('dashboard.vet.addTip')}</Button>
              </div>
              {recommendations.length === 0 ? (
                <div className="text-center py-20 text-[#8c7e74]">{t('dashboard.vet.noRecommendations')}</div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {recommendations.map((r) => (
                    <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-3xl p-5 relative group border border-[#E8E0D8] hover:shadow-lg transition-shadow">
                      <button onClick={() => handleDeleteReco(r.id)}
                        className="absolute top-3 right-3 w-7 h-7 rounded-full bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-sm hover:bg-red-100">✕</button>
                      <h3 className="font-bold text-[#0D0D0D] pr-6">{r.title}</h3>
                      <p className="text-sm text-[#8c7e74] mt-2 leading-relaxed">{r.description}</p>
                      <div className="flex gap-2 mt-3">
                        {r.targetSpecies && <span className="text-xs bg-[#FAF7F2] rounded-full px-2.5 py-1 text-[#8c7e74] font-medium">{r.targetSpecies}</span>}
                        {r.targetAgeRange && <span className="text-xs bg-[#FAF7F2] rounded-full px-2.5 py-1 text-[#8c7e74] font-medium">{r.targetAgeRange}</span>}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
              <Modal isOpen={recoModal} onClose={() => setRecoModal(false)} title={t('dashboard.vet.addRecommendation')}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#0D0D0D] mb-1">{t('dashboard.vet.recoTitle')}</label>
                    <input value={recoForm.title} onChange={(e) => setRecoForm({ ...recoForm, title: e.target.value })}
                      className="w-full rounded-2xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/40 focus:border-coral" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#0D0D0D] mb-1">{t('common.description')}</label>
                    <textarea value={recoForm.description} onChange={(e) => setRecoForm({ ...recoForm, description: e.target.value })} rows={3}
                      className="w-full rounded-2xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/40 focus:border-coral resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#0D0D0D] mb-1">{t('dashboard.vet.targetSpeciesOptional')}</label>
                    <input value={recoForm.targetSpecies} onChange={(e) => setRecoForm({ ...recoForm, targetSpecies: e.target.value })}
                      placeholder={t('dashboard.vet.speciesPlaceholder')}
                      className="w-full rounded-2xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/40 focus:border-coral" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#0D0D0D] mb-1">{t('dashboard.vet.targetAgeRangeOptional')}</label>
                    <input value={recoForm.targetAgeRange} onChange={(e) => setRecoForm({ ...recoForm, targetAgeRange: e.target.value })}
                      placeholder={t('dashboard.vet.agePlaceholder')}
                      className="w-full rounded-2xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/40 focus:border-coral" />
                  </div>
                  <Button onClick={handleAddReco} className="w-full">{t('dashboard.vet.saveRecommendation')}</Button>
                </div>
              </Modal>
            </div>
          )}

          {tab === 'bookings' && (
            <div>
              {bookings.length === 0 ? (
                <div className="text-center py-20 text-[#8c7e74]">{t('dashboard.vet.noBookingRequests')}</div>
              ) : (
                <div className="grid gap-4">
                  {bookings.map((b) => (
                    <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#E8E0D8]">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-coral to-amber flex items-center justify-center text-white text-sm font-bold">
                            {b.userName?.[0] || 'U'}
                          </div>
                          <div>
                            <p className="font-semibold text-[#0D0D0D]">{b.userName}</p>
                            <p className="text-xs text-[#8c7e74]">{new Date(b.bookingDate).toLocaleDateString()} — {b.notes || t('dashboard.vet.noNotes')}</p>
                          </div>
                        </div>
                        {b.petName && <p className="text-xs text-[#8c7e74] mt-2 ml-13">{t('dashboard.vet.petLabel')} {b.petName}</p>}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${b.status === 'Pending' ? 'bg-amber-100 text-amber-700' : b.status === 'Confirmed' ? 'bg-green-100 text-green-700' : b.status === 'Completed' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{t('common.status.' + b.status.toLowerCase())}</span>
                        {b.status === 'Pending' && (
                          <>
                            <button onClick={() => handleBookingStatus(b.id, 'Confirmed')} className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full hover:bg-green-200 font-medium transition-colors">{t('common.confirm')}</button>
                            <button onClick={() => handleBookingStatus(b.id, 'Cancelled')} className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded-full hover:bg-red-100 font-medium transition-colors">{t('common.cancel')}</button>
                          </>
                        )}
                        {b.status === 'Confirmed' && (
                          <button onClick={() => handleBookingStatus(b.id, 'Completed')} className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 font-medium transition-colors">{t('common.complete')}</button>
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

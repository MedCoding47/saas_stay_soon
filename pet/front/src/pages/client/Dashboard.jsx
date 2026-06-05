import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import api from '../../api/client';
import { useAuth } from '../../hooks/useAuth';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PageTransition from '../../components/animations/PageTransition';
import ProfileCard from '../../components/ui/profile-card';

const speciesEmoji = {
  Dog: '\u{1F415}', Cat: '\u{1F408}', Rabbit: '\u{1F430}', Bird: '\u{1F426}', Parrot: '\u{1F99C}',
  Hamster: '\u{1F439}', Fish: '\u{1F41F}', Turtle: '\u{1F422}', Horse: '\u{1F434}',
};

export default function ClientDashboard() {
  const { t } = useTranslation();
  const { uploadImage, updateProfile } = useAuth();
  const [tab, setTab] = useState('overview');
  const [requests, setRequests] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [adoptionCount, setAdoptionCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  /* ---- Adoption request state ---- */
  const [searchParams] = useSearchParams();
  const [showAdoptModal, setShowAdoptModal] = useState(false);
  const [adoptPetId, setAdoptPetId] = useState(null);
  const [adoptMessage, setAdoptMessage] = useState('');
  const [submittingAdopt, setSubmittingAdopt] = useState(false);
  const [adoptError, setAdoptError] = useState('');

  const handleSubmitAdoption = async (e) => {
    e.preventDefault();
    setSubmittingAdopt(true);
    setAdoptError('');
    try {
      await api.post('/adoptions/apply', { petId: adoptPetId, applicationMessage: adoptMessage || null });
      setShowAdoptModal(false);
      setAdoptPetId(null);
      setAdoptMessage('');
      setLoading(true);
      const load = async () => {
        try {
          const [reqRes, countRes] = await Promise.all([
            api.get('/adoptions/mine'),
            api.get('/client/adoption-count'),
          ]);
          setRequests(reqRes.data?.items || reqRes.data?.$values || []);
          setAdoptionCount(countRes.data || 0);
        } catch {}
        setLoading(false);
      };
      load();
    } catch (err) {
      setAdoptError(err.response?.data?.message || t('dashboard.client.adoptionError'));
    }
    setSubmittingAdopt(false);
  };

  useEffect(() => {
    const adopt = searchParams.get('adopt');
    if (adopt) {
      setAdoptPetId(adopt);
      setShowAdoptModal(true);
    }
  }, [searchParams]);

  /* ---- Give up a pet state ---- */
  const [formData, setFormData] = useState({ petName: '', species: 'Dog', breed: '', age: 1, reason: '', description: '', contactPhone: '', contactEmail: '' });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageError, setImageError] = useState('');

  /* ---- Profile state ---- */
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ fullName: '', phoneNumber: '', about: '' });
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sh-user') || '{}'); } catch { return {}; }
  });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [reqRes, favRes, countRes, meRes] = await Promise.all([
          api.get('/adoptions/mine'),
          api.get('/client/favorites'),
          api.get('/client/adoption-count'),
          api.get('/auth/me'),
        ]);
        if (cancelled) return;
        setRequests(reqRes.data?.items || reqRes.data?.$values || []);
        setFavorites(favRes.data || []);
        setAdoptionCount(countRes.data || 0);
        const me = meRes.data;
        localStorage.setItem('sh-user', JSON.stringify(me));
        setUser(me);
        setProfileForm({ fullName: me.fullName || '', phoneNumber: me.phoneNumber || '', about: me.about || '' });
      } catch {}
      if (!cancelled) setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, []);

  /* ---- Give up a pet ---- */
  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    setImageError('');
    setImageUrls([]);
  };

  const uploadAllImages = async () => {
    if (imageFiles.length < 3) {
      setImageError(t('dashboard.client.imageMinError'));
      return null;
    }
    setUploadingImages(true);
    setImageError('');
    const urls = [];
    for (const file of imageFiles) {
      try {
        const url = await uploadImage(file);
        urls.push(url);
      } catch {
        setImageError(t('dashboard.client.imageUploadError'));
        setUploadingImages(false);
        return null;
      }
    }
    setImageUrls(urls);
    setUploadingImages(false);
    return urls;
  };

  const handleSubmitGiveUp = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    const urls = await uploadAllImages();
    if (!urls) {
      setFormSubmitting(false);
      return;
    }
    try {
      await api.post('/client/adopt-requests', { ...formData, imageUrls: urls });
      setShowForm(false);
      setFormData({ petName: '', species: 'Dog', breed: '', age: 1, reason: '', description: '', contactPhone: '', contactEmail: '' });
      setImageFiles([]);
      setImageUrls([]);
    } catch {}
    setFormSubmitting(false);
  };

  /* ---- Profile ---- */
  const handleProfilePictureChange = (e) => {
    setProfilePictureFile(e.target.files[0]);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage('');
    try {
      let profilePictureUrl = undefined;
      if (profilePictureFile) {
        profilePictureUrl = await uploadImage(profilePictureFile);
      }
      await updateProfile({
        fullName: profileForm.fullName,
        phoneNumber: profileForm.phoneNumber,
        about: profileForm.about,
        profilePictureUrl,
      });
      setUser(JSON.parse(localStorage.getItem('sh-user') || '{}'));
      setProfileMessage(t('dashboard.client.profileUpdated'));
      setProfilePictureFile(null);
    } catch {
      setProfileMessage(t('dashboard.client.profileFailed'));
    }
    setSavingProfile(false);
  };

  if (loading) return <PageTransition><Navbar /><div className="min-h-screen pt-24 flex items-center justify-center"><LoadingSpinner /></div><Footer /></PageTransition>;

  return (
    <PageTransition>
      <Navbar />
      <main className="min-h-screen bg-[#FAF7F2] pb-20">

        {/* Top bar */}
        <div className="bg-white border-b border-[#E8E0D8] px-8 py-6">
          <h1 className="font-display font-black text-3xl text-[#0D0D0D]">{t('dashboard.client.title')}</h1>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Tabs */}
          <div className="flex gap-2 mb-8 flex-wrap">
            {[
              { key: 'overview', label: t('dashboard.client.tabs.overview') },
              { key: 'profile', label: t('dashboard.client.tabs.profile') },
              { key: 'favorites', label: `${t('dashboard.client.tabs.favorites')} (${favorites.length}/4)` },
              { key: 'adoptions', label: `${t('dashboard.client.tabs.adoptions')} (${adoptionCount}/2)` },
              { key: 'giveup', label: t('dashboard.client.tabs.giveup') },
            ].map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                  tab === t.key
                    ? 'bg-[#0D0D0D] text-[#FAF7F2]'
                    : 'bg-[#FAF7F2] text-[#8c7e74] border border-[#E8E0D8] hover:border-[#0D0D0D] hover:text-[#0D0D0D]'
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-3xl border border-[#E8E0D8] p-8 border-l-4 border-l-[#E47167]">
                <p className="font-display font-black text-[56px] leading-none text-[#0D0D0D]">{adoptionCount}/2</p>
                <p className="text-xs font-bold tracking-widest uppercase text-[#8c7e74] mt-2">{t('dashboard.client.adoptions')}</p>
              </div>
              <div className="bg-white rounded-3xl border border-[#E8E0D8] p-8">
                <p className="font-display font-black text-[56px] leading-none text-[#0D0D0D]">{favorites.length}/4</p>
                <p className="text-xs font-bold tracking-widest uppercase text-[#8c7e74] mt-2">{t('dashboard.client.favorites')}</p>
              </div>
              <div className="bg-white rounded-3xl border border-[#E8E0D8] p-8">
                <p className="font-display font-black text-[56px] leading-none text-[#0D0D0D]">{requests.length}</p>
                <p className="text-xs font-bold tracking-widest uppercase text-[#8c7e74] mt-2">{t('dashboard.client.requests')}</p>
              </div>
            </div>
          )}

          {tab === 'profile' && (
            <div className="max-w-lg mx-auto">
              <div className="mb-6">
                <ProfileCard
                  imageUrl={user.profilePictureUrl}
                  name={user.fullName || t('common.user')}
                  subtitle={user.email || (user.fullName ? `@${user.fullName.toLowerCase().replace(/\s+/g, '')}` : '@user')}
                  meta={user.createdAt ? t('dashboard.client.joined', { date: new Date(user.createdAt).toLocaleDateString() }) : ''}
                  buttonLabel={editingProfile ? t('common.cancel') : t('dashboard.client.editProfile')}
                  buttonAction={() => setEditingProfile(!editingProfile)}
                />
              </div>

              {editingProfile && (
                <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl border border-[#E8E0D8] p-8 space-y-4">
                  <div className="flex flex-col items-center mb-4">
                    <div className="w-24 h-24 rounded-full bg-[#E8E0D8] flex items-center justify-center overflow-hidden mb-3"
                      style={{ transition: 'transform 500ms ease-out' }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}>
                      {user.profilePictureUrl ? (
                        <img src={user.profilePictureUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl text-[#8c7e74]">{profileForm.fullName?.charAt(0) || '?'}</span>
                      )}
                    </div>
                    <label className="text-sm text-[#E47167] cursor-pointer hover:underline">
                      {t('dashboard.client.changePhoto')}
                      <input type="file" accept="image/*" className="hidden" onChange={handleProfilePictureChange} />
                    </label>
                    {profilePictureFile && (
                      <p className="text-xs text-[#8c7e74] mt-1">{profilePictureFile.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0D0D0D] mb-1">{t('common.fullName')}</label>
                    <input className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" value={profileForm.fullName}
                      onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0D0D0D] mb-1">{t('common.phone')}</label>
                    <input className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" value={profileForm.phoneNumber}
                      onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0D0D0D] mb-1">{t('dashboard.client.about')}</label>
                    <textarea className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" rows="3" value={profileForm.about}
                      onChange={(e) => setProfileForm({ ...profileForm, about: e.target.value })} />
                  </div>
                  {profileMessage && (
                    <p className={`text-sm ${profileMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                      {profileMessage}
                    </p>
                  )}
                  <button type="submit" className="btn-dark" disabled={savingProfile}>
                    {savingProfile ? t('common.saving') : t('dashboard.client.saveProfile')}
                  </button>
                </form>
              )}
            </div>
          )}

          {tab === 'favorites' && (
            <div>
              {favorites.length === 0 ? (
                <div className="text-center py-16 text-[#8c7e74]">
                  <p>{t('dashboard.client.noFavorites')}</p>
                  <Link to="/pets" className="text-[#E47167] font-medium mt-2 inline-block">{t('dashboard.client.browsePets')}</Link>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {favorites.map((f) => (
                    <motion.div key={f.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-3xl border border-[#E8E0D8] p-6 text-center">
                      <div className="text-4xl mb-2">{speciesEmoji[f.petName] || '\u{1F43E}'}</div>
                      <p className="font-medium text-[#0D0D0D]">{f.petName}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'adoptions' && (
            <div>
              {adoptionCount >= 2 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 mb-4">
                  {t('dashboard.client.maxAdoptions')}
                </div>
              )}
              {requests.length === 0 ? (
                <div className="text-center py-16 text-[#8c7e74]">
                  <p>{t('dashboard.client.noAdoptions')}</p>
                  <Link to="/pets" className="btn-dark inline-flex mt-4 px-6 py-2">{t('dashboard.client.browsePets')}</Link>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {requests.map((r) => (
                    <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-3xl border border-[#E8E0D8] p-6">
                      <div className="flex items-start justify-between mb-2">
                        <div className="text-3xl">{speciesEmoji[r.petType] || '\u{1F43E}'}</div>
                        <Badge status={r.status} />
                      </div>
                      <p className="font-bold text-[#0D0D0D]">{r.petName || `Pet #${r.petId}`}</p>
                      {r.createdAt && <p className="text-xs text-[#8c7e74] mt-1">{new Date(r.createdAt).toLocaleDateString()}</p>}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'giveup' && (
            <div>
              <p className="text-[#8c7e74] text-sm mb-4">{t('dashboard.client.giveupDescription')}</p>
              {!showForm ? (
                <button className="btn-dark" onClick={() => setShowForm(true)}>{t('dashboard.client.startRequest')}</button>
              ) : (
                <form onSubmit={handleSubmitGiveUp} className="bg-white rounded-3xl border border-[#E8E0D8] p-8 max-w-lg space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#0D0D0D] mb-1">{t('dashboard.client.petName')}</label>
                    <input className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" value={formData.petName} onChange={(e) => setFormData({ ...formData, petName: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0D0D0D] mb-1">{t('common.species')}</label>
                    <select className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" value={formData.species} onChange={(e) => setFormData({ ...formData, species: e.target.value })}>
                      <option value="Dog">{t('common.species.dog')}</option>
                      <option value="Cat">{t('common.species.cat')}</option>
                      <option value="Rabbit">{t('common.species.rabbit')}</option>
                      <option value="Bird">{t('common.species.bird')}</option>
                      <option value="Other">{t('common.species.other')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0D0D0D] mb-1">{t('dashboard.client.breedOptional')}</label>
                    <input className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" value={formData.breed} onChange={(e) => setFormData({ ...formData, breed: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0D0D0D] mb-1">{t('dashboard.client.ageYears')}</label>
                    <input type="number" min="0" className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" value={formData.age} onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0D0D0D] mb-1">{t('dashboard.client.reason')}</label>
                    <textarea className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" rows="3" value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0D0D0D] mb-1">{t('dashboard.client.additionalDetails')}</label>
                    <textarea className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" rows="2" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0D0D0D] mb-1">{t('dashboard.client.contactPhone')}</label>
                    <input className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" value={formData.contactPhone} onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0D0D0D] mb-1">{t('common.email')}</label>
                    <input type="email" className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" value={formData.contactEmail} onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0D0D0D] mb-1">{t('dashboard.client.photos')}</label>
                    <input type="file" accept="image/*" multiple
                      className="block w-full text-sm text-[#8c7e74] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#E47167] file:text-white hover:file:bg-[#d45a50]"
                      onChange={handleImagesChange} />
                    {imageFiles.length > 0 && (
                      <p className="text-xs text-[#8c7e74] mt-1">{t('dashboard.client.filesSelected', { count: imageFiles.length })}</p>
                    )}
                    {imageError && <p className="text-xs text-red-500 mt-1">{imageError}</p>}
                    {imageUrls.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {imageUrls.map((url, i) => (
                          <img key={i} src={url} alt="" className="w-16 h-16 object-cover rounded-lg" />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="btn-dark" disabled={formSubmitting || uploadingImages}>
                      {formSubmitting || uploadingImages ? t('dashboard.client.uploadingImages') : t('dashboard.client.submitRequest')}
                    </button>
                    <button className="btn-outline" onClick={() => setShowForm(false)}>{t('common.cancel')}</button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Adoption Request Modal */}
        {showAdoptModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowAdoptModal(false)}>
            <div className="bg-white rounded-3xl border border-[#E8E0D8] p-8 w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
              <h2 className="font-display font-black text-2xl text-[#0D0D0D] mb-2">{t('dashboard.client.adoptionRequest')}</h2>
              <p className="text-sm text-[#8c7e74] mb-6">{t('dashboard.client.adoptionModalText', { petId: adoptPetId })}</p>
              {adoptError && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-xl border border-red-200">{adoptError}</p>}
              <form onSubmit={handleSubmitAdoption} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-[#0D0D0D] mb-1">{t('dashboard.client.messageOptional')}</label>
                  <textarea className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" rows="4" value={adoptMessage}
                    onChange={(e) => setAdoptMessage(e.target.value)}
                    placeholder={t('dashboard.client.adoptionPlaceholder')} />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="btn-dark" disabled={submittingAdopt}>
                    {submittingAdopt ? t('common.submitting') : t('dashboard.client.submitRequest')}
                  </button>
                  <button className="btn-outline" onClick={() => setShowAdoptModal(false)}>{t('common.cancel')}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </PageTransition>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/client';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import PageTransition from '../../components/animations/PageTransition';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function SuperAdminUserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [pets, setPets] = useState([]);
  const [adoptions, setAdoptions] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetPassword, setResetPassword] = useState('');

  const load = useCallback(async () => {
    try {
      const { data } = await api.get(`/superadmin/users/${id}`);
      setUser(data);
    } catch { navigate('/superadmin/dashboard'); }
    setLoading(false);
  }, [id, navigate]);

  useEffect(() => { load(); }, [load]);

  const loadPets = async () => {
    try {
      const { data } = await api.get('/superadmin/pets');
      setPets(data.filter(p => p.orgName === user?.orgName));
    } catch {}
  };

  const loadAdoptions = async () => {
    try {
      const { data } = await api.get('/superadmin/adoptions');
      setAdoptions(data.filter(a => a.adopterName === user?.fullName || a.petName === user?.fullName));
    } catch {}
  };

  useEffect(() => {
    if (tab === 'pets' && pets.length === 0) loadPets();
    if (tab === 'adoptions' && adoptions.length === 0) loadAdoptions();
  }, [tab]);

  const handleEdit = (section) => setEditing(section);

  const handleSaveUser = async (form) => {
    setSaving(true);
    setError('');
    try {
      await api.put(`/superadmin/users/${id}`, form);
      setEditing(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update');
    }
    setSaving(false);
  };

  const handleSaveCompany = async (form) => {
    if (!user.companyProfile) return;
    setSaving(true);
    setError('');
    try {
      await api.put(`/superadmin/companies/${user.organizationId}`, form);
      setEditing(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update');
    }
    setSaving(false);
  };

  const handleSaveVet = async (form) => {
    setSaving(true);
    setError('');
    try {
      await api.put(`/superadmin/veterinaires/${id}`, form);
      setEditing(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update');
    }
    setSaving(false);
  };

  const handleResetPassword = async () => {
    if (!window.confirm('Reset password for this user? The new password will be shown once.')) return;
    setResetting(true);
    setResetPassword('');
    try {
      const { data } = await api.post(`/superadmin/users/${id}/reset-password`);
      setResetPassword(data.newPassword);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    }
    setResetting(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Deactivate this user? They will be unable to log in.')) return;
    setDeleting(true);
    try {
      await api.delete(`/superadmin/users/${id}`);
      navigate('/superadmin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete');
    }
    setDeleting(false);
  };

  if (loading) return <PageTransition><Navbar /><div className="min-h-screen bg-[#FAF7F2] pt-24 flex items-center justify-center"><LoadingSpinner /></div><Footer /></PageTransition>;
  if (!user) return null;

  const roleBadgeColors = {
    SuperAdmin: 'bg-purple-50 text-purple-600 border border-purple-200',
    Enterprise: 'bg-coral-light text-coral',
    Client: 'bg-teal-light text-teal',
    Veterinaire: 'bg-amber-50 text-amber-600 border border-amber-200',
  }[user.role] || 'bg-[#FAF7F2] text-[#8c7e74] border border-[#E8E0D8]';

  const tabs = [
    { key: 'overview', label: 'Overview' },
    ...(user.role === 'Enterprise' ? [{ key: 'company', label: 'Company Profile' }] : []),
    ...(user.role === 'Veterinaire' ? [{ key: 'vet', label: 'Clinic Profile' }] : []),
    ...(user.role === 'Enterprise' || user.role === 'Client' ? [{ key: 'pets', label: `Pets (${user.petsCount})` }] : []),
    ...(user.role === 'Client' ? [{ key: 'adoptions', label: `Adoptions (${user.adoptionsCount})` }] : []),
  ];

  return (
    <PageTransition>
      <Navbar />
      <main className="min-h-screen bg-[#FAF7F2] pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <button onClick={() => navigate('/superadmin/dashboard')} className="text-sm text-coral hover:underline mb-4 inline-block">&larr; Back to Dashboard</button>

          <div className="bg-white rounded-3xl border border-[#E8E0D8] overflow-hidden">
            <div className="px-8 py-6 border-b border-[#E8E0D8] flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#FAF7F2] border-2 border-[#E8E0D8] flex items-center justify-center text-xl font-bold text-[#0D0D0D]">
                  {user.fullName?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <h1 className="font-display font-black text-2xl text-[#0D0D0D]">{user.fullName}</h1>
                  <p className="text-sm text-[#8c7e74]">{user.email}</p>
                  <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-semibold ${roleBadgeColors}`}>{user.role}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit('user')} className="px-4 py-2 rounded-xl border-2 border-[#E8E0D8] text-[#8c7e74] text-sm font-semibold hover:border-[#0D0D0D] hover:text-[#0D0D0D] transition-colors">Edit</button>
                <button onClick={handleResetPassword} disabled={resetting} className="px-4 py-2 rounded-xl border-2 border-[#E8E0D8] text-[#8c7e74] text-sm font-semibold hover:border-amber-400 hover:text-amber-600 transition-colors disabled:opacity-50">{resetting ? '...' : 'Reset PW'}</button>
                <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 rounded-xl border-2 border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-50">{deleting ? '...' : 'Deactivate'}</button>
              </div>
            </div>

            <div className="flex gap-2 px-8 pt-4 pb-0 border-b border-[#E8E0D8]">
              {tabs.map((t) => (
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

            <div className="p-8">
              {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-xl">{error}</p>}

              {tab === 'overview' && (
                <div className="space-y-6">
                  {editing === 'user' ? (
                    <UserEditForm user={user} onSave={handleSaveUser} onCancel={() => setEditing(null)} saving={saving} />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h2 className="font-display font-black text-lg text-[#0D0D0D] mb-3">Account Info</h2>
                        <dl className="space-y-3 text-sm bg-[#FAF7F2] rounded-2xl border border-[#E8E0D8] p-5">
                          <Row label="Status" value={user.isActive ? 'Active' : 'Inactive'} className={user.isActive ? 'text-teal font-semibold' : 'text-red-500 font-semibold'} />
                          <Row label="Phone" value={user.phone || '\u2014'} />
                          <Row label="Member since" value={new Date(user.createdAt).toLocaleDateString()} />
                          <Row label="Last updated" value={user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : '\u2014'} />
                          <Row label="About" value={user.about || '\u2014'} />
                        </dl>
                      </div>
                      <div>
                        <h2 className="font-display font-black text-lg text-[#0D0D0D] mb-3">Organization</h2>
                        <dl className="space-y-3 text-sm bg-[#FAF7F2] rounded-2xl border border-[#E8E0D8] p-5">
                          <Row label="Name" value={user.orgName || '\u2014'} />
                          <Row label="Slug" value={user.orgSlug || '\u2014'} />
                          {user.orgName && (
                            <div className="pt-2">
                              <Link to={`/superadmin/organizations/${user.organizationId}`} className="text-coral text-sm font-semibold hover:underline">View Organization Details &rarr;</Link>
                            </div>
                          )}
                        </dl>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Pets', value: user.petsCount },
                      { label: 'Adoptions', value: user.adoptionsCount },
                      { label: 'Favorites', value: user.favoritesCount },
                      { label: 'Bookings', value: user.bookingsCount },
                    ].map((s) => (
                      <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-[#FAF7F2] rounded-3xl border border-[#E8E0D8] p-6 text-center">
                        <p className="font-display font-black text-[40px] leading-none text-[#0D0D0D]">{s.value}</p>
                        <p className="text-xs font-bold tracking-widest uppercase text-[#8c7e74] mt-2">{s.label}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {tab === 'company' && user.companyProfile && (
                editing === 'company'
                  ? <CompanyEditForm profile={user.companyProfile} onSave={handleSaveCompany} onCancel={() => setEditing(null)} saving={saving} />
                  : <>
                    <ProfileView data={user.companyProfile} fields={[
                      { label: 'Company', key: 'companyName' },
                      { label: 'Location', key: 'location' },
                      { label: 'Phone', key: 'phone' },
                      { label: 'Email', key: 'email' },
                      { label: 'Website', key: 'website' },
                      { label: 'Description', key: 'description' },
                    ]} onEdit={() => handleEdit('company')} />
                    {(user.companyProfile.latitude != null && user.companyProfile.longitude != null) && (
                      <div className="mt-4 rounded-2xl overflow-hidden border border-[#E8E0D8]">
                        <iframe
                          src={`https://maps.google.com/maps?q=${user.companyProfile.latitude},${user.companyProfile.longitude}&z=15&output=embed`}
                          width="100%" height="200" style={{ border: 0 }} allowFullScreen loading="lazy"
                          title="Google Maps"
                        />
                      </div>
                    )}
                    {user.companyProfile.googleMapsUrl && (
                      <a href={user.companyProfile.googleMapsUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-coral hover:underline mt-3 transition-colors">
                        View on Google Maps &rarr;
                      </a>
                    )}
                  </>
              )}

              {tab === 'vet' && user.veterinaireProfile && (
                editing === 'vet'
                  ? <VetEditForm profile={user.veterinaireProfile} onSave={handleSaveVet} onCancel={() => setEditing(null)} saving={saving} />
                  : <>
                    <ProfileView data={user.veterinaireProfile} fields={[
                      { label: 'Clinic', key: 'clinicName' },
                      { label: 'Location', key: 'location' },
                      { label: 'Phone', key: 'phone' },
                      { label: 'Available', key: 'isAvailable', render: (v) => v ? 'Yes' : 'No', className: (v) => v ? 'text-teal font-semibold' : 'text-red-500 font-semibold' },
                      { label: 'Formation', key: 'formation' },
                      { label: 'Description', key: 'description' },
                    ]} onEdit={() => handleEdit('vet')} />
                    {(user.veterinaireProfile.latitude != null && user.veterinaireProfile.longitude != null) && (
                      <div className="mt-4 rounded-2xl overflow-hidden border border-[#E8E0D8]">
                        <iframe
                          src={`https://maps.google.com/maps?q=${user.veterinaireProfile.latitude},${user.veterinaireProfile.longitude}&z=15&output=embed`}
                          width="100%" height="200" style={{ border: 0 }} allowFullScreen loading="lazy"
                          title="Google Maps"
                        />
                      </div>
                    )}
                    {user.veterinaireProfile.googleMapsUrl && (
                      <a href={user.veterinaireProfile.googleMapsUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-coral hover:underline mt-3 transition-colors">
                        View on Google Maps &rarr;
                      </a>
                    )}
                  </>
              )}

              {tab === 'pets' && (
                pets.length === 0
                  ? <p className="text-center text-[#8c7e74] py-12">No pets found for this user.</p>
                  : <div className="grid gap-3">
                    {pets.map((p) => (
                      <div key={p.id} className="bg-[#FAF7F2] rounded-2xl border border-[#E8E0D8] p-4 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-[#0D0D0D]">{p.name}</span>
                          <span className="text-[#8c7e74] text-sm ml-2">{p.type}{p.breed ? ` - ${p.breed}` : ''}</span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${p.status === 'Available' ? 'bg-teal-light text-teal' : p.status === 'Adopted' ? 'bg-blue-50 text-blue-600' : 'bg-[#FAF7F2] text-[#8c7e74] border border-[#E8E0D8]'}`}>{p.status}</span>
                      </div>
                    ))}
                  </div>
              )}

              {tab === 'adoptions' && (
                adoptions.length === 0
                  ? <p className="text-center text-[#8c7e74] py-12">No adoptions found.</p>
                  : <div className="space-y-3">
                    {adoptions.map((a) => (
                      <div key={a.id} className="bg-[#FAF7F2] rounded-2xl border border-[#E8E0D8] p-4 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-[#0D0D0D]">{a.petName}</span>
                          <span className="text-[#8c7e74] text-sm ml-2">by {a.adopterName}</span>
                          <p className="text-xs text-[#8c7e74] mt-0.5">{new Date(a.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${a.status === 'Completed' ? 'bg-teal-light text-teal' : a.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-[#FAF7F2] text-[#8c7e74] border border-[#E8E0D8]'}`}>{a.status}</span>
                      </div>
                    ))}
                  </div>
              )}
            </div>
          </div>
        </div>

        {resetPassword && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setResetPassword('')}>
            <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm mx-4 text-center" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-display font-black text-lg text-[#0D0D0D] mb-2">Password Reset</h3>
              <p className="text-sm text-[#8c7e74] mb-4">New password for {user?.fullName}:</p>
              <div className="bg-[#FAF7F2] rounded-2xl p-4 mb-4 font-mono text-lg font-bold text-coral break-all select-all">{resetPassword}</div>
              <p className="text-xs text-[#8c7e74] mb-4">Share this password securely with the user. It will not be shown again.</p>
              <button onClick={() => setResetPassword('')} className="px-6 py-2.5 bg-[#0D0D0D] text-[#FAF7F2] rounded-xl text-sm font-semibold hover:bg-[#2A2A2A] transition-colors">Done</button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </PageTransition>
  );
}

function Row({ label, value, className }) {
  return (
    <div className="flex justify-between">
      <dt className="text-[#8c7e74]">{label}</dt>
      <dd className={`font-medium text-[#0D0D0D] ${className || ''}`}>{value}</dd>
    </div>
  );
}

function ProfileView({ data, fields, onEdit }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-display font-black text-lg text-[#0D0D0D]">Details</h2>
        <button onClick={onEdit} className="text-sm font-semibold text-coral hover:underline">Edit</button>
      </div>
      <div className="bg-[#FAF7F2] rounded-2xl border border-[#E8E0D8] p-5 text-sm grid grid-cols-1 md:grid-cols-2 gap-3">
        {fields.map((f) => (
          <div key={f.key}>
            <span className="text-[#8c7e74]">{f.label}: </span>
            <span className={`font-medium text-[#0D0D0D] ${f.className ? f.className(data[f.key]) : ''}`}>
              {f.render ? f.render(data[f.key]) : (data[f.key] || '\u2014')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function UserEditForm({ user, onSave, onCancel, saving }) {
  const [form, setForm] = useState({ email: user.email, fullName: user.fullName, phone: user.phone || '', isActive: user.isActive, about: user.about || '', profilePictureUrl: user.profilePictureUrl || '' });
  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };
  return (
    <div>
      <h2 className="font-display font-black text-lg text-[#0D0D0D] mb-3">Edit User</h2>
      <div className="bg-[#FAF7F2] rounded-2xl border border-[#E8E0D8] p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#0D0D0D] mb-1.5">Full Name</label>
            <input name="fullName" value={form.fullName} onChange={handleChange} required
              className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0D0D0D] mb-1.5">Email</label>
            <input name="email" value={form.email} onChange={handleChange} required type="email"
              className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0D0D0D] mb-1.5">Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange}
              className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" />
          </div>
          <div className="flex items-center gap-3 pt-6">
            <input type="checkbox" id="isActive" name="isActive" checked={form.isActive} onChange={handleChange}
              className="w-4 h-4 rounded border-[#E8E0D8] text-[#0D0D0D] focus:ring-[#0D0D0D]" />
            <label htmlFor="isActive" className="text-sm font-semibold text-[#0D0D0D]">Active</label>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-[#0D0D0D] mb-1.5">About</label>
            <textarea name="about" value={form.about} onChange={handleChange} rows={2}
              className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors resize-none" />
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={() => onSave(form)} disabled={saving}
            className="px-6 py-3 bg-[#0D0D0D] text-[#FAF7F2] rounded-xl text-sm font-semibold hover:bg-[#2A2A2A] transition-colors disabled:opacity-50">
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button onClick={onCancel}
            className="px-6 py-3 rounded-xl border-2 border-[#E8E0D8] text-[#8c7e74] text-sm font-semibold hover:border-[#0D0D0D] hover:text-[#0D0D0D] transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function CompanyEditForm({ profile, onSave, onCancel, saving }) {
  const [form, setForm] = useState({
    companyName: profile.companyName, location: profile.location, description: profile.description || '',
    phone: profile.phone || '', email: profile.email || '', website: profile.website || '',
    googleMapsUrl: profile.googleMapsUrl || ''
  });
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  return (
    <div>
      <h2 className="font-display font-black text-lg text-[#0D0D0D] mb-3">Edit Company Profile</h2>
      <div className="bg-[#FAF7F2] rounded-2xl border border-[#E8E0D8] p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#0D0D0D] mb-1.5">Company Name</label>
            <input name="companyName" value={form.companyName} onChange={handleChange} required
              className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0D0D0D] mb-1.5">Location</label>
            <input name="location" value={form.location} onChange={handleChange} required
              className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0D0D0D] mb-1.5">Google Maps URL</label>
            <input name="googleMapsUrl" value={form.googleMapsUrl} onChange={handleChange} placeholder="https://maps.google.com/maps?q=..."
              className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0D0D0D] mb-1.5">Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange}
              className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0D0D0D] mb-1.5">Email</label>
            <input name="email" value={form.email} onChange={handleChange} type="email"
              className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0D0D0D] mb-1.5">Website</label>
            <input name="website" value={form.website} onChange={handleChange}
              className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-[#0D0D0D] mb-1.5">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={2}
              className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors resize-none" />
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={() => onSave(form)} disabled={saving}
            className="px-6 py-3 bg-[#0D0D0D] text-[#FAF7F2] rounded-xl text-sm font-semibold hover:bg-[#2A2A2A] transition-colors disabled:opacity-50">
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button onClick={onCancel}
            className="px-6 py-3 rounded-xl border-2 border-[#E8E0D8] text-[#8c7e74] text-sm font-semibold hover:border-[#0D0D0D] hover:text-[#0D0D0D] transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function VetEditForm({ profile, onSave, onCancel, saving }) {
  const [form, setForm] = useState({
    clinicName: profile.clinicName, location: profile.location, description: profile.description || '',
    phone: profile.phone || '', isAvailable: profile.isAvailable,
    googleMapsUrl: profile.googleMapsUrl || '',
    formation: profile.formation || ''
  });
  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };
  return (
    <div>
      <h2 className="font-display font-black text-lg text-[#0D0D0D] mb-3">Edit Clinic Profile</h2>
      <div className="bg-[#FAF7F2] rounded-2xl border border-[#E8E0D8] p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#0D0D0D] mb-1.5">Clinic Name</label>
            <input name="clinicName" value={form.clinicName} onChange={handleChange} required
              className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0D0D0D] mb-1.5">Location</label>
            <input name="location" value={form.location} onChange={handleChange} required
              className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0D0D0D] mb-1.5">Google Maps URL</label>
            <input name="googleMapsUrl" value={form.googleMapsUrl} onChange={handleChange} placeholder="https://maps.google.com/maps?q=..."
              className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0D0D0D] mb-1.5">Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange}
              className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" />
          </div>
          <div className="flex items-center gap-3 pt-6">
            <input type="checkbox" id="isAvailable" name="isAvailable" checked={form.isAvailable} onChange={handleChange}
              className="w-4 h-4 rounded border-[#E8E0D8] text-[#0D0D0D] focus:ring-[#0D0D0D]" />
            <label htmlFor="isAvailable" className="text-sm font-semibold text-[#0D0D0D]">Available</label>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-[#0D0D0D] mb-1.5">Formation / Credentials</label>
            <textarea name="formation" value={form.formation} onChange={handleChange} rows={2}
              className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors resize-none"
              placeholder="Degrees, certifications, specialties..." />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-[#0D0D0D] mb-1.5">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={2}
              className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors resize-none" />
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={() => onSave(form)} disabled={saving}
            className="px-6 py-3 bg-[#0D0D0D] text-[#FAF7F2] rounded-xl text-sm font-semibold hover:bg-[#2A2A2A] transition-colors disabled:opacity-50">
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button onClick={onCancel}
            className="px-6 py-3 rounded-xl border-2 border-[#E8E0D8] text-[#8c7e74] text-sm font-semibold hover:border-[#0D0D0D] hover:text-[#0D0D0D] transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

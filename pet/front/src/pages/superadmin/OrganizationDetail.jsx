import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/client';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import PageTransition from '../../components/animations/PageTransition';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function SuperAdminOrganizationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [resettingUserId, setResettingUserId] = useState(null);
  const [resetPassword, setResetPassword] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data } = await api.get(`/superadmin/organizations/${id}`);
        if (!cancelled) setOrg(data);
      } catch { navigate('/superadmin/dashboard'); }
      if (!cancelled) setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [id, navigate]);

  const handleSaveCompany = async (form) => {
    setSaving(true);
    setError('');
    try {
      await api.put(`/superadmin/companies/${id}`, form);
      setEditing(null);
      const { data } = await api.get(`/superadmin/organizations/${id}`);
      setOrg(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update');
    }
    setSaving(false);
  };

  const handleSaveVet = async (form) => {
    setSaving(true);
    setError('');
    try {
      await api.put(`/superadmin/veterinaires/${org.users?.[0]?.id}`, form);
      setEditing(null);
      const { data } = await api.get(`/superadmin/organizations/${id}`);
      setOrg(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update');
    }
    setSaving(false);
  };

  const handleResetPassword = async (userId) => {
    if (!window.confirm('Reset password for this user? The new password will be shown once.')) return;
    setResettingUserId(userId);
    setResetPassword('');
    try {
      const { data } = await api.post(`/superadmin/users/${userId}/reset-password`);
      setResetPassword(data.newPassword);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    }
    setResettingUserId(null);
  };

  const handleDeleteOrg = async () => {
    if (!window.confirm('Deactivate this organization? All users will lose access.')) return;
    setDeleting(true);
    try {
      await api.delete(`/superadmin/organizations/${id}`);
      navigate('/superadmin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to deactivate');
    }
    setDeleting(false);
  };

  if (loading) return <PageTransition><Navbar /><div className="min-h-screen bg-[#FAF7F2] pt-24 flex items-center justify-center"><LoadingSpinner /></div><Footer /></PageTransition>;
  if (!org) return null;

  const isEnterprise = !!org.companyProfile;
  const isVet = !!org.veterinaireProfile;
  const profile = org.companyProfile || org.veterinaireProfile;

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'users', label: `Users (${org.userCount})` },
    { key: 'pets', label: `Pets (${org.petCount})` },
    { key: 'products', label: `Products (${org.productCount})` },
    { key: 'adoptions', label: `Adoptions (${org.adoptionCount})` },
  ];

  return (
    <PageTransition>
      <Navbar />
      <main className="min-h-screen bg-[#FAF7F2] pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <button onClick={() => navigate('/superadmin/dashboard')} className="text-sm text-coral hover:underline mb-4 inline-block">&larr; Back to Dashboard</button>

          <div className="bg-white rounded-3xl border border-[#E8E0D8] overflow-hidden">
            <div className="px-8 py-6 border-b border-[#E8E0D8] flex items-start justify-between">
              <div>
                <h1 className="font-display font-black text-2xl text-[#0D0D0D]">{org.name}</h1>
                <p className="text-sm text-[#8c7e74] mt-1">Slug: {org.slug}</p>
                <div className="flex gap-2 mt-2">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${org.isActive ? 'bg-teal-light text-teal' : 'bg-red-50 text-red-500'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${org.isActive ? 'bg-teal' : 'bg-red-500'}`} />
                    {org.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className={`inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full ${isEnterprise ? 'bg-coral-light text-coral' : 'bg-amber-50 text-amber-600'}`}>
                    {isEnterprise ? 'Enterprise' : isVet ? 'Veterinaire' : 'Other'}
                  </span>
                </div>
              </div>
              <button onClick={handleDeleteOrg} disabled={deleting}
                className="px-5 py-2 rounded-xl border-2 border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-50">
                {deleting ? '...' : 'Deactivate'}
              </button>
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
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Users', value: org.userCount },
                      { label: 'Pets', value: org.petCount },
                      { label: 'Products', value: org.productCount },
                      { label: 'Adoptions', value: org.adoptionCount },
                    ].map((s) => (
                      <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-[#FAF7F2] rounded-3xl border border-[#E8E0D8] p-6 text-center">
                        <p className="font-display font-black text-[40px] leading-none text-[#0D0D0D]">{s.value}</p>
                        <p className="text-xs font-bold tracking-widest uppercase text-[#8c7e74] mt-2">{s.label}</p>
                      </motion.div>
                    ))}
                  </div>

                  {profile && (
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h2 className="font-display font-black text-lg text-[#0D0D0D]">{isEnterprise ? 'Company' : 'Clinic'} Profile</h2>
                        <button onClick={() => setEditing('profile')} className="text-sm font-semibold text-coral hover:underline">{editing === 'profile' ? '' : 'Edit'}</button>
                      </div>
                      {editing === 'profile' && isEnterprise ? (
                        <CompanyEditForm profile={profile} onSave={handleSaveCompany} onCancel={() => setEditing(null)} saving={saving} />
                      ) : editing === 'profile' && isVet ? (
                        <VetEditForm profile={profile} onSave={handleSaveVet} onCancel={() => setEditing(null)} saving={saving} />
                      ) : (
                        <>
                          <div className="bg-[#FAF7F2] rounded-2xl border border-[#E8E0D8] p-5 text-sm grid grid-cols-1 md:grid-cols-2 gap-3">
                            {isEnterprise && <>
                              <DetailRow label="Company" value={profile.companyName} />
                              <DetailRow label="Location" value={profile.location} />
                              <DetailRow label="Phone" value={profile.phone} />
                              <DetailRow label="Email" value={profile.email} />
                              <DetailRow label="Website" value={profile.website} />
                              <DetailRow label="Description" value={profile.description} className="md:col-span-2" />
                            </>}
                            {isVet && <>
                              <DetailRow label="Clinic" value={profile.clinicName} />
                              <DetailRow label="Location" value={profile.location} />
                              <DetailRow label="Phone" value={profile.phone} />
                              <DetailRow label="Available" value={profile.isAvailable ? 'Yes' : 'No'} className={profile.isAvailable ? 'text-teal font-semibold' : 'text-red-500 font-semibold'} />
                              <DetailRow label="Description" value={profile.description} className="md:col-span-2" />
                            </>}
                          </div>
                          {(profile.latitude != null && profile.longitude != null) && (
                            <div className="mt-4 rounded-2xl overflow-hidden border border-[#E8E0D8]">
                              <iframe
                                src={`https://maps.google.com/maps?q=${profile.latitude},${profile.longitude}&z=15&output=embed`}
                                width="100%" height="250" style={{ border: 0 }} allowFullScreen loading="lazy"
                                title="Google Maps"
                              />
                            </div>
                          )}
                          {profile.googleMapsUrl && (
                            <a href={profile.googleMapsUrl} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm font-semibold text-coral hover:underline mt-3 transition-colors">
                              View on Google Maps &rarr;
                            </a>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {tab === 'users' && (
                <div className="space-y-2">
                  {org.users.map((u) => (
                    <div key={u.id}
                      className="bg-[#FAF7F2] rounded-2xl border border-[#E8E0D8] p-4 hover:bg-[#F5F0EB] transition-colors">
                      <div className="flex items-center justify-between">
                        <Link to={`/superadmin/users/${u.id}`} className="flex-1 min-w-0">
                          <span className="font-bold text-[#0D0D0D]">{u.fullName}</span>
                          <span className="text-[#8c7e74] text-sm ml-2">{u.email}</span>
                        </Link>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs px-3 py-1 rounded-full font-semibold bg-coral-light text-coral">{u.role}</span>
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold ${u.isActive ? 'text-teal' : 'text-red-500'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-teal' : 'bg-red-500'}`} />
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <button onClick={() => handleResetPassword(u.id)} disabled={resettingUserId === u.id}
                            className="text-xs px-3 py-1.5 rounded-xl border border-[#E8E0D8] text-[#8c7e74] hover:bg-white hover:text-[#0D0D0D] transition-colors font-medium">
                            {resettingUserId === u.id ? '...' : 'Reset PW'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {org.users.length === 0 && <p className="text-center text-[#8c7e74] py-8">No users in this organization.</p>}
                </div>
              )}

              {tab === 'pets' && (
                org.pets.length === 0
                  ? <p className="text-center text-[#8c7e74] py-8">No pets in this organization.</p>
                  : <div className="grid gap-3">
                    {org.pets.map((p) => (
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

              {tab === 'products' && (
                org.products.length === 0
                  ? <p className="text-center text-[#8c7e74] py-8">No products in this organization.</p>
                  : <div className="grid gap-3">
                    {org.products.map((p) => (
                      <div key={p.id} className="bg-[#FAF7F2] rounded-2xl border border-[#E8E0D8] p-4 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-[#0D0D0D]">{p.name}</span>
                          <span className="text-[#8c7e74] text-sm ml-2">Pet ID: {p.petId}</span>
                        </div>
                        <span className="font-bold text-coral">{p.price.toFixed(2)} MAD</span>
                      </div>
                    ))}
                  </div>
              )}

              {tab === 'adoptions' && (
                org.adoptions.length === 0
                  ? <p className="text-center text-[#8c7e74] py-8">No adoptions from this organization.</p>
                  : <div className="space-y-3">
                    {org.adoptions.map((a) => (
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
              <p className="text-sm text-[#8c7e74] mb-4">New password for this user:</p>
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

function DetailRow({ label, value, className }) {
  return (
    <div className={className}>
      <span className="text-[#8c7e74]">{label}: </span>
      <span className="font-medium text-[#0D0D0D]">{value || '\u2014'}</span>
    </div>
  );
}

function CompanyEditForm({ profile, onSave, onCancel, saving }) {
  const [form, setForm] = useState({
    companyName: profile.companyName, location: profile.location,
    description: profile.description || '', phone: profile.phone || '',
    email: profile.email || '', website: profile.website || '',
    googleMapsUrl: profile.googleMapsUrl || ''
  });
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  return (
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
  );
}

function VetEditForm({ profile, onSave, onCancel, saving }) {
  const [form, setForm] = useState({
    clinicName: profile.clinicName, location: profile.location,
    description: profile.description || '', phone: profile.phone || '',
    isAvailable: profile.isAvailable,
    googleMapsUrl: profile.googleMapsUrl || '',
    formation: profile.formation || ''
  });
  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };
  return (
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
  );
}

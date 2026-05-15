import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/client';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import PageTransition from '../../components/animations/PageTransition';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

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

  if (loading) return <PageTransition><Navbar /><div className="min-h-screen pt-24 flex items-center justify-center"><LoadingSpinner /></div><Footer /></PageTransition>;
  if (!org) return null;

  const isEnterprise = !!org.companyProfile;
  const isVet = !!org.veterinaireProfile;
  const profile = org.companyProfile || org.veterinaireProfile;
  const profileType = isEnterprise ? 'Company' : 'Clinic';

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
      <main className="min-h-screen bg-warm pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <button onClick={() => navigate('/superadmin/dashboard')} className="text-sm text-coral hover:underline mb-4 inline-block">&larr; Back to Dashboard</button>

          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-6 text-white flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold">{org.name}</h1>
                <p className="text-white/80 text-sm">Slug: {org.slug}</p>
                <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-semibold ${org.isActive ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>{org.isActive ? 'Active' : 'Inactive'}</span>
                <span className={`inline-block mt-1 ml-2 px-3 py-0.5 rounded-full text-xs font-semibold ${isEnterprise ? 'bg-blue-200 text-blue-800' : 'bg-amber-200 text-amber-800'}`}>{isEnterprise ? 'Enterprise' : isVet ? 'Veterinaire' : 'Other'}</span>
              </div>
              <button onClick={handleDeleteOrg} disabled={deleting}
                className="px-3 py-1.5 bg-red-500/30 hover:bg-red-500/50 rounded-lg text-xs font-medium transition-colors">
                {deleting ? '...' : 'Deactivate'}
              </button>
            </div>

            <div className="flex gap-1 px-6 pt-4 border-b border-warm-dark/20 overflow-x-auto">
              {tabs.map((t) => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${tab === t.key ? 'bg-warm text-coral border-b-2 border-coral' : 'text-muted hover:text-gray-700'}`}>
                  {t.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">{error}</p>}

              {tab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard label="Users" value={org.userCount} />
                    <StatCard label="Pets" value={org.petCount} />
                    <StatCard label="Products" value={org.productCount} />
                    <StatCard label="Adoptions" value={org.adoptionCount} />
                  </div>

                  {profile && (
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h2 className="text-lg font-bold text-gray-900">{profileType} Profile</h2>
                        <button onClick={() => setEditing('profile')} className="text-sm text-coral hover:underline">Edit</button>
                      </div>
                      {editing === 'profile' && isEnterprise ? (
                        <CompanyEditForm profile={profile} onSave={handleSaveCompany} onCancel={() => setEditing(null)} saving={saving} />
                      ) : editing === 'profile' && isVet ? (
                        <VetEditForm profile={profile} onSave={handleSaveVet} onCancel={() => setEditing(null)} saving={saving} />
                      ) : (
                        <>
                          <div className="bg-warm rounded-xl p-4 text-sm grid grid-cols-1 md:grid-cols-2 gap-3">
                            {isEnterprise && <>
                              <DetailRow label="Company" value={profile.companyName} />
                              <DetailRow label="Location" value={profile.location} />
                              <DetailRow label="Phone" value={profile.phone} />
                              <DetailRow label="Email" value={profile.email} />
                              <DetailRow label="Website" value={profile.website} />
                              <DetailRow label="Description" value={profile.description} />
                            </>}
                            {isVet && <>
                              <DetailRow label="Clinic" value={profile.clinicName} />
                              <DetailRow label="Location" value={profile.location} />
                              <DetailRow label="Phone" value={profile.phone} />
                              <DetailRow label="Available" value={profile.isAvailable ? 'Yes' : 'No'} className={profile.isAvailable ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'} />
                              <DetailRow label="Description" value={profile.description} className="md:col-span-2" />
                            </>}
                          </div>
                          {(profile.latitude != null && profile.longitude != null) && (
                            <div className="mt-4 rounded-xl overflow-hidden border border-gray-200">
                              <iframe
                                src={`https://maps.google.com/maps?q=${profile.latitude},${profile.longitude}&z=15&output=embed`}
                                width="100%" height="250" style={{ border: 0 }} allowFullScreen loading="lazy"
                                title="Google Maps"
                              />
                            </div>
                          )}
                          {profile.googleMapsUrl && (
                            <a href={profile.googleMapsUrl} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm text-teal hover:text-teal-dark mt-3 transition-colors">
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
                      className="block bg-warm rounded-xl p-4 hover:bg-warm-dark/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <Link to={`/superadmin/users/${u.id}`} className="flex-1 min-w-0">
                          <span className="font-bold text-gray-900">{u.fullName}</span>
                          <span className="text-muted text-sm ml-2">{u.email}</span>
                        </Link>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-coral-light text-coral">{u.role}</span>
                          <span className={`text-xs font-semibold ${u.isActive ? 'text-green-600' : 'text-red-500'}`}>{u.isActive ? 'Active' : 'Inactive'}</span>
                          <button onClick={() => handleResetPassword(u.id)} disabled={resettingUserId === u.id}
                            className="text-xs px-2 py-1 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors font-medium">
                            {resettingUserId === u.id ? '...' : 'Reset PW'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {org.users.length === 0 && <p className="text-center text-muted py-8">No users in this organization.</p>}
                </div>
              )}

              {tab === 'pets' && (
                org.pets.length === 0
                  ? <p className="text-center text-muted py-8">No pets in this organization.</p>
                  : <div className="grid gap-3">
                    {org.pets.map((p) => (
                      <div key={p.id} className="bg-warm rounded-xl p-4 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-gray-900">{p.name}</span>
                          <span className="text-muted text-sm ml-2">{p.type}{p.breed ? ` - ${p.breed}` : ''}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${p.status === 'Available' ? 'bg-green-100 text-green-700' : p.status === 'Adopted' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{p.status}</span>
                      </div>
                    ))}
                  </div>
              )}

              {tab === 'products' && (
                org.products.length === 0
                  ? <p className="text-center text-muted py-8">No products in this organization.</p>
                  : <div className="grid gap-3">
                    {org.products.map((p) => (
                      <div key={p.id} className="bg-warm rounded-xl p-4 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-gray-900">{p.name}</span>
                          <span className="text-muted text-sm ml-2">Pet ID: {p.petId}</span>
                        </div>
                        <span className="font-bold text-coral">{p.price.toFixed(2)} MAD</span>
                      </div>
                    ))}
                  </div>
              )}

              {tab === 'adoptions' && (
                org.adoptions.length === 0
                  ? <p className="text-center text-muted py-8">No adoptions from this organization.</p>
                  : <div className="space-y-3">
                    {org.adoptions.map((a) => (
                      <div key={a.id} className="bg-warm rounded-xl p-4 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-gray-900">{a.petName}</span>
                          <span className="text-muted text-sm ml-2">by {a.adopterName}</span>
                          <p className="text-xs text-muted-light mt-0.5">{new Date(a.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${a.status === 'Completed' ? 'bg-green-100 text-green-700' : a.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'}`}>{a.status}</span>
                      </div>
                    ))}
                  </div>
              )}
            </div>
          </div>
        </div>

        {resetPassword && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setResetPassword('')}>
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4 text-center" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Password Reset</h3>
              <p className="text-sm text-muted mb-4">New password for this user:</p>
              <div className="bg-warm rounded-xl p-4 mb-4 font-mono text-lg font-bold text-coral break-all select-all">{resetPassword}</div>
              <p className="text-xs text-muted-light mb-4">Share this password securely with the user. It will not be shown again.</p>
              <button onClick={() => setResetPassword('')} className="px-6 py-2 bg-coral text-white rounded-pill text-sm font-medium hover:bg-coral-dark transition-colors">Done</button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </PageTransition>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-warm rounded-xl p-4 text-center">
      <p className="text-2xl font-bold text-teal-600">{value}</p>
      <p className="text-xs text-muted mt-1">{label}</p>
    </div>
  );
}

function DetailRow({ label, value, className }) {
  return (
    <div className={className}>
      <span className="text-muted">{label}: </span>
      <span className="font-medium">{value || '—'}</span>
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
    <div className="bg-warm rounded-xl p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Company Name" name="companyName" value={form.companyName} onChange={handleChange} required />
        <Input label="Location" name="location" value={form.location} onChange={handleChange} required />
        <Input label="Google Maps URL" name="googleMapsUrl" value={form.googleMapsUrl} onChange={handleChange} placeholder="https://maps.google.com/maps?q=..." />
        <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} />
        <Input label="Email" name="email" value={form.email} onChange={handleChange} type="email" />
        <Input label="Website" name="website" value={form.website} onChange={handleChange} />
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={2}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/40 focus:border-coral transition-all resize-none" />
        </div>
      </div>
      <div className="flex gap-3 mt-4">
        <Button onClick={() => onSave(form)} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
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
    <div className="bg-warm rounded-xl p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Clinic Name" name="clinicName" value={form.clinicName} onChange={handleChange} required />
        <Input label="Location" name="location" value={form.location} onChange={handleChange} required />
        <Input label="Google Maps URL" name="googleMapsUrl" value={form.googleMapsUrl} onChange={handleChange} placeholder="https://maps.google.com/maps?q=..." />
        <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} />
        <div className="flex items-center gap-3 pt-6">
          <input type="checkbox" id="isAvailable" name="isAvailable" checked={form.isAvailable} onChange={handleChange} className="w-4 h-4 rounded border-gray-300 text-coral focus:ring-coral" />
          <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700">Available</label>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Formation / Credentials</label>
          <textarea name="formation" value={form.formation} onChange={handleChange} rows={2}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/40 focus:border-coral transition-all resize-none"
            placeholder="Degrees, certifications, specialties..." />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={2}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/40 focus:border-coral transition-all resize-none" />
        </div>
      </div>
      <div className="flex gap-3 mt-4">
        <Button onClick={() => onSave(form)} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

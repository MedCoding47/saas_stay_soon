import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/client';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import PageTransition from '../../components/animations/PageTransition';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

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

  if (loading) return <PageTransition><Navbar /><div className="min-h-screen pt-24 flex items-center justify-center"><LoadingSpinner /></div><Footer /></PageTransition>;
  if (!user) return null;

  const roleBadgeColor = {
    SuperAdmin: 'bg-purple-100 text-purple-700',
    Enterprise: 'bg-blue-100 text-blue-700',
    Client: 'bg-green-100 text-green-700',
    Veterinaire: 'bg-amber-100 text-amber-700',
  }[user.role] || 'bg-gray-100 text-gray-700';

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
      <main className="min-h-screen bg-warm pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <button onClick={() => navigate('/superadmin/dashboard')} className="text-sm text-coral hover:underline mb-4 inline-block">&larr; Back to Dashboard</button>

          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            <div className="bg-gradient-to-r from-coral to-coral-dark p-6 text-white flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                  {user.fullName?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{user.fullName}</h1>
                  <p className="text-white/80 text-sm">{user.email}</p>
                  <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-semibold ${roleBadgeColor}`}>{user.role}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit('user')} className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium transition-colors">Edit</button>
                <button onClick={handleDelete} disabled={deleting} className="px-3 py-1.5 bg-red-500/30 hover:bg-red-500/50 rounded-lg text-xs font-medium transition-colors">{deleting ? '...' : 'Deactivate'}</button>
              </div>
            </div>

            <div className="flex gap-1 px-6 pt-4 border-b border-warm-dark/20">
              {tabs.map((t) => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${tab === t.key ? 'bg-warm text-coral border-b-2 border-coral' : 'text-muted hover:text-gray-700'}`}>
                  {t.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">{error}</p>}

              {tab === 'overview' && (
                <div className="space-y-6">
                  {editing === 'user' ? (
                    <UserEditForm user={user} onSave={handleSaveUser} onCancel={() => setEditing(null)} saving={saving} />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-3">Account Info</h2>
                        <dl className="space-y-3 text-sm">
                          <Row label="Status" value={user.isActive ? 'Active' : 'Inactive'} className={user.isActive ? 'text-green-600' : 'text-red-500'} />
                          <Row label="Phone" value={user.phone || '—'} />
                          <Row label="Member since" value={new Date(user.createdAt).toLocaleDateString()} />
                          <Row label="Last updated" value={user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : '—'} />
                          <Row label="About" value={user.about || '—'} />
                        </dl>
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-3">Organization</h2>
                        <dl className="space-y-3 text-sm">
                          <Row label="Name" value={user.orgName || '—'} />
                          <Row label="Slug" value={user.orgSlug || '—'} />
                          {user.orgName && (
                            <div className="pt-2">
                              <Link to={`/superadmin/organizations/${user.organizationId}`} className="text-coral text-xs hover:underline">View Organization Details &rarr;</Link>
                            </div>
                          )}
                        </dl>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard label="Pets" value={user.petsCount} />
                    <StatCard label="Adoptions" value={user.adoptionsCount} />
                    <StatCard label="Favorites" value={user.favoritesCount} />
                    <StatCard label="Bookings" value={user.bookingsCount} />
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
                      <div className="mt-4 rounded-xl overflow-hidden border border-gray-200">
                        <iframe
                          src={`https://maps.google.com/maps?q=${user.companyProfile.latitude},${user.companyProfile.longitude}&z=15&output=embed`}
                          width="100%" height="200" style={{ border: 0 }} allowFullScreen loading="lazy"
                          title="Google Maps"
                        />
                      </div>
                    )}
                    {user.companyProfile.googleMapsUrl && (
                      <a href={user.companyProfile.googleMapsUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-teal hover:text-teal-dark mt-3 transition-colors">
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
                      { label: 'Available', key: 'isAvailable', render: (v) => v ? 'Yes' : 'No', className: (v) => v ? 'text-green-600' : 'text-red-500' },
                      { label: 'Formation', key: 'formation' },
                      { label: 'Description', key: 'description' },
                    ]} onEdit={() => handleEdit('vet')} />
                    {(user.veterinaireProfile.latitude != null && user.veterinaireProfile.longitude != null) && (
                      <div className="mt-4 rounded-xl overflow-hidden border border-gray-200">
                        <iframe
                          src={`https://maps.google.com/maps?q=${user.veterinaireProfile.latitude},${user.veterinaireProfile.longitude}&z=15&output=embed`}
                          width="100%" height="200" style={{ border: 0 }} allowFullScreen loading="lazy"
                          title="Google Maps"
                        />
                      </div>
                    )}
                    {user.veterinaireProfile.googleMapsUrl && (
                      <a href={user.veterinaireProfile.googleMapsUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-teal hover:text-teal-dark mt-3 transition-colors">
                        View on Google Maps &rarr;
                      </a>
                    )}
                  </>
              )}

              {tab === 'pets' && (
                pets.length === 0
                  ? <p className="text-center text-muted py-12">No pets found for this user.</p>
                  : <div className="grid gap-3">
                    {pets.map((p) => (
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

              {tab === 'adoptions' && (
                adoptions.length === 0
                  ? <p className="text-center text-muted py-12">No adoptions found.</p>
                  : <div className="space-y-3">
                    {adoptions.map((a) => (
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
      </main>
      <Footer />
    </PageTransition>
  );
}

function Row({ label, value, className }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className={`font-medium ${className || ''}`}>{value}</dd>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-warm rounded-xl p-4 text-center">
      <p className="text-2xl font-bold text-coral">{value}</p>
      <p className="text-xs text-muted mt-1">{label}</p>
    </div>
  );
}

function ProfileView({ data, fields, onEdit }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold text-gray-900">Details</h2>
        <button onClick={onEdit} className="text-sm text-coral hover:underline">Edit</button>
      </div>
      <div className="bg-warm rounded-xl p-4 text-sm grid grid-cols-1 md:grid-cols-2 gap-3">
        {fields.map((f) => (
          <div key={f.key}>
            <span className="text-muted">{f.label}: </span>
            <span className={`font-medium ${f.className ? f.className(data[f.key]) : ''}`}>
              {f.render ? f.render(data[f.key]) : (data[f.key] || '—')}
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
      <h2 className="text-lg font-bold text-gray-900 mb-3">Edit User</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} required />
        <Input label="Email" name="email" value={form.email} onChange={handleChange} required type="email" />
        <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} />
        <div className="flex items-center gap-3 pt-6">
          <input type="checkbox" id="isActive" name="isActive" checked={form.isActive} onChange={handleChange} className="w-4 h-4 rounded border-gray-300 text-coral focus:ring-coral" />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active</label>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">About</label>
          <textarea name="about" value={form.about} onChange={handleChange} rows={2}
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

function CompanyEditForm({ profile, onSave, onCancel, saving }) {
  const [form, setForm] = useState({
    companyName: profile.companyName, location: profile.location, description: profile.description || '',
    phone: profile.phone || '', email: profile.email || '', website: profile.website || '',
    googleMapsUrl: profile.googleMapsUrl || ''
  });
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-3">Edit Company Profile</h2>
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
      <h2 className="text-lg font-bold text-gray-900 mb-3">Edit Clinic Profile</h2>
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

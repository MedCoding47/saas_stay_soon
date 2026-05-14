import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/client';
import { useAuth } from '../../hooks/useAuth';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import PageTransition from '../../components/animations/PageTransition';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function EnterpriseDashboard() {
  const { uploadImage } = useAuth();
  const [pets, setPets] = useState([]);
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pets');

  /* ---- Add pet state ---- */
  const [showAddPet, setShowAddPet] = useState(false);
  const [petForm, setPetForm] = useState({ name: '', type: '', breed: '', age: 1, location: '', description: '' });
  const [petImageFile, setPetImageFile] = useState(null);
  const [savingPet, setSavingPet] = useState(false);
  const [petError, setPetError] = useState('');

  /* ---- Edit profile state ---- */
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ companyName: '', location: '', phone: '', email: '', description: '', website: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');

  const loadData = async () => {
    try {
      const [petsRes, profileRes] = await Promise.all([
        api.get('/enterprise/pets'),
        api.get('/enterprise/profile'),
      ]);
      setPets(petsRes.data || []);
      setProfile(profileRes.data);
      setProfileForm({
        companyName: profileRes.data?.companyName || '',
        location: profileRes.data?.location || '',
        phone: profileRes.data?.phone || '',
        email: profileRes.data?.email || '',
        description: profileRes.data?.description || '',
        website: profileRes.data?.website || '',
      });

      const prodMap = {};
      for (const pet of petsRes.data || []) {
        try {
          const { data } = await api.get(`/enterprise/pets/${pet.id}/products`);
          prodMap[pet.id] = data || [];
        } catch { prodMap[pet.id] = []; }
      }
      setProducts(prodMap);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  /* ---- Add pet handlers ---- */
  const handlePetImageChange = (e) => setPetImageFile(e.target.files[0]);

  const handleAddPet = async (e) => {
    e.preventDefault();
    setSavingPet(true);
    setPetError('');
    try {
      let imageUrl = null;
      if (petImageFile) {
        imageUrl = await uploadImage(petImageFile);
      }
      await api.post('/enterprise/pets', {
        name: petForm.name,
        type: petForm.type,
        breed: petForm.breed || null,
        age: parseInt(petForm.age) || 0,
        location: petForm.location,
        description: petForm.description || null,
        imageUrl,
      });
      setShowAddPet(false);
      setPetForm({ name: '', type: '', breed: '', age: 1, location: '', description: '' });
      setPetImageFile(null);
      setLoading(true);
      await loadData();
    } catch (err) {
      setPetError(err.response?.data?.message || 'Failed to add pet');
    }
    setSavingPet(false);
  };

  /* ---- Edit profile handlers ---- */
  const handleEditProfile = () => {
    setProfileForm({
      companyName: profile?.companyName || '',
      location: profile?.location || '',
      phone: profile?.phone || '',
      email: profile?.email || '',
      description: profile?.description || '',
      website: profile?.website || '',
    });
    setEditingProfile(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileError('');
    try {
      await api.put('/enterprise/profile', {
        companyName: profileForm.companyName,
        location: profileForm.location,
        phone: profileForm.phone || null,
        email: profileForm.email || null,
        description: profileForm.description || null,
        website: profileForm.website || null,
      });
      setEditingProfile(false);
      setLoading(true);
      await loadData();
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    }
    setSavingProfile(false);
  };

  if (loading) return <PageTransition><Navbar /><div className="min-h-screen pt-24 flex items-center justify-center"><LoadingSpinner /></div><Footer /></PageTransition>;

  return (
    <PageTransition>
      <Navbar />
      <main className="min-h-screen bg-warm pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Enterprise Dashboard</h1>

          {/* Tabs */}
          <div className="flex gap-2 mb-8">
            {[
              { key: 'pets', label: `My Pets (${pets.length}/6)` },
              { key: 'profile', label: 'Company Profile' },
              { key: 'adoptions', label: 'Adoption Requests' },
            ].map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-4 py-2 rounded-pill text-sm font-medium transition-all ${tab === t.key ? 'bg-coral text-white' : 'bg-white text-gray-700 hover:bg-warm-dark'}`}>
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'pets' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted">{pets.length}/6 pets used</p>
                {pets.length < 6 && <Button variant="primary" className="!rounded-pill" onClick={() => setShowAddPet(true)}>Add Pet</Button>}
              </div>
              {pets.length === 0 ? (
                <div className="text-center py-16 text-muted">No pets yet. Start by adding your first pet.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pets.map((pet) => (
                    <motion.div key={pet.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-xl shadow-card p-4">
                      {pet.imageUrl && (
                        <img src={pet.imageUrl} alt={pet.name} className="w-full h-36 object-cover rounded-lg mb-3" />
                      )}
                      <h3 className="font-bold text-gray-900">{pet.name}</h3>
                      <p className="text-xs text-muted">{pet.type}{pet.breed ? ` \u00B7 ${pet.breed}` : ''}</p>
                      <p className="text-xs text-muted-light mt-1">{pet.location}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${pet.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{pet.status}</span>
                        <span className="text-xs text-muted-light">{products[pet.id]?.length || 0}/4 products</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Add Pet Modal */}
              {showAddPet && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowAddPet(false)}>
                  <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Add a Pet</h2>
                    {petError && <p className="text-red-500 text-sm mb-3 bg-red-50 p-3 rounded-lg">{petError}</p>}
                    <form onSubmit={handleAddPet} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input className="input" value={petForm.name} onChange={(e) => setPetForm({ ...petForm, name: e.target.value })} required />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                          <select className="input" value={petForm.type} onChange={(e) => setPetForm({ ...petForm, type: e.target.value })} required>
                            <option value="">Select...</option>
                            <option value="Dog">Dog</option>
                            <option value="Cat">Cat</option>
                            <option value="Rabbit">Rabbit</option>
                            <option value="Bird">Bird</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
                          <input className="input" value={petForm.breed} onChange={(e) => setPetForm({ ...petForm, breed: e.target.value })} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Age (years)</label>
                          <input type="number" min="0" className="input" value={petForm.age} onChange={(e) => setPetForm({ ...petForm, age: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                          <input className="input" value={petForm.location} onChange={(e) => setPetForm({ ...petForm, location: e.target.value })} required />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea className="input" rows="2" value={petForm.description} onChange={(e) => setPetForm({ ...petForm, description: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                        <input type="file" accept="image/*" onChange={handlePetImageChange}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-pill file:border-0 file:text-sm file:font-semibold file:bg-coral file:text-white hover:file:bg-coral-dark" />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button type="submit" variant="primary" className="!rounded-pill" disabled={savingPet}>
                          {savingPet ? 'Adding...' : 'Add Pet'}
                        </Button>
                        <Button variant="outline" className="!rounded-pill" onClick={() => setShowAddPet(false)}>Cancel</Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'profile' && (
            <div className="bg-white rounded-2xl shadow-card p-6 max-w-lg">
              {profileError && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">{profileError}</p>}
              {editingProfile ? (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Edit Company Profile</h2>
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                      <input className="input" value={profileForm.companyName} onChange={(e) => setProfileForm({ ...profileForm, companyName: e.target.value })} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input className="input" value={profileForm.location} onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })} required />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input className="input" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" className="input" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                      <input className="input" value={profileForm.website} onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea className="input" rows="3" value={profileForm.description} onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })} />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button type="submit" variant="primary" className="!rounded-pill" disabled={savingProfile}>
                        {savingProfile ? 'Saving...' : 'Save'}
                      </Button>
                      <Button variant="outline" className="!rounded-pill" onClick={() => setEditingProfile(false)}>Cancel</Button>
                    </div>
                  </form>
                </div>
              ) : (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Company Information</h2>
                  {profile && (
                    <div className="space-y-3 text-sm">
                      <div><span className="text-muted">Name:</span> <span className="font-medium">{profile.companyName}</span></div>
                      <div><span className="text-muted">Location:</span> <span>{profile.location}</span></div>
                      <div><span className="text-muted">Phone:</span> <span>{profile.phone || '\u2014'}</span></div>
                      <div><span className="text-muted">Email:</span> <span>{profile.email || '\u2014'}</span></div>
                      {profile.description && <div><span className="text-muted">About:</span> <p className="text-gray-700 mt-1">{profile.description}</p></div>}
                    </div>
                  )}
                  <Button variant="primary" className="!rounded-pill mt-6" onClick={handleEditProfile}>Edit Profile</Button>
                </div>
              )}
            </div>
          )}

          {tab === 'adoptions' && (
            <div className="text-center py-16 text-muted">Adoption requests from clients will appear here.</div>
          )}
        </div>
      </main>
      <Footer />
    </PageTransition>
  );
}


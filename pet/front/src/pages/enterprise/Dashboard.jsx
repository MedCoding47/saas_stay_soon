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
  const [adoptions, setAdoptions] = useState([]);
  const [adoptionsLoading, setAdoptionsLoading] = useState(false);

  /* ---- Add pet state ---- */
  const [showAddPet, setShowAddPet] = useState(false);
  const [petForm, setPetForm] = useState({ name: '', type: '', breed: '', age: 1, location: '', description: '', isVaccinated: false, isSterilized: false, isDewormed: false, healthNotes: '', goodWithKids: false, goodWithDogs: false, goodWithCats: false, behaviorNotes: '', productIds: [] });
  const [petImageFile, setPetImageFile] = useState(null);
  const [savingPet, setSavingPet] = useState(false);
  const [petError, setPetError] = useState('');

  /* ---- Edit profile state ---- */
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ companyName: '', location: '', phone: '', email: '', description: '', website: '', logoUrl: '' });
  const [profileLogoFile, setProfileLogoFile] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');

  /* ---- Catalog state ---- */
  const [catalog, setCatalog] = useState([]);
  const [catalogForm, setCatalogForm] = useState({ name: '', description: '', price: '', imageUrl: '' });
  const [showAddCatalog, setShowAddCatalog] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(false);

  /* ---- Catalog products for pet product selector ---- */
  const [catalogProducts, setCatalogProducts] = useState([]);

  /* ---- Edit pet state ---- */
  const [editingPet, setEditingPet] = useState(null);
  const [editPetForm, setEditPetForm] = useState({ name: '', type: '', breed: '', age: 1, location: '', description: '', isVaccinated: false, isSterilized: false, isDewormed: false, healthNotes: '', goodWithKids: false, goodWithDogs: false, goodWithCats: false, behaviorNotes: '', productIds: [] });
  const [editPetImageFile, setEditPetImageFile] = useState(null);
  const [savingEditPet, setSavingEditPet] = useState(false);
  const [editPetError, setEditPetError] = useState('');

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
        logoUrl: profileRes.data?.logoUrl || '',
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

  const loadCatalog = async () => {
    setCatalogLoading(true);
    try {
      const { data } = await api.get('/enterprise/catalog');
      setCatalog(data || []);
    } catch {}
    setCatalogLoading(false);
  };

  const loadCatalogProducts = async () => {
    try {
      const { data } = await api.get('/enterprise/catalog');
      setCatalogProducts(data || []);
    } catch {
      setCatalogProducts([]);
    }
  };

  useEffect(() => {
    if (tab === 'catalog' && catalog.length === 0) loadCatalog();
  }, [tab]);

  const loadAdoptions = async () => {
    setAdoptionsLoading(true);
    try {
      const { data: pets } = await api.get('/enterprise/pets');
      const all = [];
      for (const pet of pets) {
        try {
          const { data } = await api.get(`/enterprise/pets/${pet.id}/adoptions`);
          all.push(...data.map(a => ({ ...a, petName: pet.name, petId: pet.id })));
        } catch {}
      }
      setAdoptions(all);
    } catch {}
    setAdoptionsLoading(false);
  };

  useEffect(() => {
    if (tab === 'adoptions' && adoptions.length === 0) loadAdoptions();
  }, [tab]);

  const handleRespondAdoption = async (adoptionId, status) => {
    try {
      await api.patch(`/enterprise/adoptions/${adoptionId}/status`, { status, notes: null });
      setAdoptions(prev => prev.map(a => a.id === adoptionId ? { ...a, status } : a));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update');
    }
  };

  /* ---- Add pet handlers ---- */
  const handlePetImageChange = (e) => setPetImageFile(e.target.files[0]);

  const handleOpenAddPet = async () => {
    await loadCatalogProducts();
    setShowAddPet(true);
  };

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
        isVaccinated: petForm.isVaccinated || null,
        isSterilized: petForm.isSterilized || null,
        isDewormed: petForm.isDewormed || null,
        healthNotes: petForm.healthNotes || null,
        goodWithKids: petForm.goodWithKids || null,
        goodWithDogs: petForm.goodWithDogs || null,
        goodWithCats: petForm.goodWithCats || null,
        behaviorNotes: petForm.behaviorNotes || null,
        productIds: petForm.productIds || [],
      });
      setShowAddPet(false);
      setPetForm({ name: '', type: '', breed: '', age: 1, location: '', description: '', isVaccinated: false, isSterilized: false, isDewormed: false, healthNotes: '', goodWithKids: false, goodWithDogs: false, goodWithCats: false, behaviorNotes: '', productIds: [] });
      setPetImageFile(null);
      setLoading(true);
      await loadData();
    } catch (err) {
      setPetError(err.response?.data?.message || 'Failed to add pet');
    }
    setSavingPet(false);
  };

  /* ---- Catalog handlers ---- */
  const handleAddCatalogProduct = async (e) => {
    e.preventDefault();
    try {
      await api.post('/enterprise/catalog', {
        name: catalogForm.name,
        description: catalogForm.description || null,
        price: parseFloat(catalogForm.price) || 0,
        imageUrl: catalogForm.imageUrl || null,
      });
      setShowAddCatalog(false);
      setCatalogForm({ name: '', description: '', price: '', imageUrl: '' });
      setCatalogLoading(true);
      await loadCatalog();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add product');
    }
  };

  const handleDeleteCatalogProduct = async (id) => {
    try {
      await api.delete('/enterprise/catalog/' + id);
      setCatalogLoading(true);
      await loadCatalog();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  /* ---- Edit pet handlers ---- */
  const handleEditPet = async (pet) => {
    setEditingPet(pet);
    setEditPetForm({
      name: pet.name || '',
      type: pet.type || '',
      breed: pet.breed || '',
      age: pet.age || 1,
      location: pet.location || '',
      description: pet.description || '',
      isVaccinated: pet.isVaccinated || false,
      isSterilized: pet.isSterilized || false,
      isDewormed: pet.isDewormed || false,
      healthNotes: pet.healthNotes || '',
      goodWithKids: pet.goodWithKids || false,
      goodWithDogs: pet.goodWithDogs || false,
      goodWithCats: pet.goodWithCats || false,
      behaviorNotes: pet.behaviorNotes || '',
      productIds: [],
    });
    setEditPetImageFile(null);
    setEditPetError('');
    try {
      const [catRes, prodRes] = await Promise.all([
        api.get('/enterprise/catalog'),
        api.get(`/enterprise/pets/${pet.id}/products`),
      ]);
      setCatalogProducts(catRes.data || []);
      setEditPetForm(prev => ({ ...prev, productIds: (prodRes.data || []).map(p => p.id) }));
    } catch {
      setCatalogProducts([]);
    }
  };

  const handleSaveEditPet = async (e) => {
    e.preventDefault();
    setSavingEditPet(true);
    setEditPetError('');
    try {
      let imageUrl = editingPet.imageUrl;
      if (editPetImageFile) {
        imageUrl = await uploadImage(editPetImageFile);
      }
      await api.put(`/enterprise/pets/${editingPet.id}`, {
        name: editPetForm.name,
        type: editPetForm.type,
        breed: editPetForm.breed || null,
        age: parseInt(editPetForm.age) || 0,
        location: editPetForm.location,
        description: editPetForm.description || null,
        imageUrl,
        isVaccinated: editPetForm.isVaccinated || null,
        isSterilized: editPetForm.isSterilized || null,
        isDewormed: editPetForm.isDewormed || null,
        healthNotes: editPetForm.healthNotes || null,
        goodWithKids: editPetForm.goodWithKids || null,
        goodWithDogs: editPetForm.goodWithDogs || null,
        goodWithCats: editPetForm.goodWithCats || null,
        behaviorNotes: editPetForm.behaviorNotes || null,
        productIds: editPetForm.productIds || [],
      });
      setEditingPet(null);
      setSavingEditPet(false);
      setLoading(true);
      await loadData();
    } catch (err) {
      setEditPetError(err.response?.data?.message || 'Failed to update pet');
      setSavingEditPet(false);
    }
  };

  /* ---- Delete pet handler ---- */
  const handleDeletePet = async (petId) => {
    if (!window.confirm('Are you sure you want to delete this pet? Active adoption requests will prevent deletion.')) return;
    try {
      await api.delete('/enterprise/pets/' + petId);
      setLoading(true);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Cannot delete this pet');
    }
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
      logoUrl: profile?.logoUrl || '',
    });
    setProfileLogoFile(null);
    setEditingProfile(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileError('');
    try {
      let logoUrl = profileForm.logoUrl;
      if (profileLogoFile) {
        logoUrl = await uploadImage(profileLogoFile);
      }
      await api.put('/enterprise/profile', {
        companyName: profileForm.companyName,
        location: profileForm.location,
        phone: profileForm.phone || null,
        email: profileForm.email || null,
        description: profileForm.description || null,
        website: profileForm.website || null,
        logoUrl: logoUrl || null,
      });
      setEditingProfile(false);
      setProfileLogoFile(null);
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
          <div className="flex gap-2 mb-8 flex-wrap">
            {[
              { key: 'pets', label: `My Pets (${pets.length}/6)` },
              { key: 'profile', label: 'Company Profile' },
              { key: 'catalog', label: 'Catalog' },
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
                {pets.length < 6 && <Button variant="primary" className="!rounded-pill" onClick={handleOpenAddPet}>Add Pet</Button>}
              </div>
              {pets.length === 0 ? (
                <div className="text-center py-16 text-muted">No pets yet. Start by adding your first pet.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pets.map((pet) => (
                    <motion.div key={pet.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-xl shadow-card p-4">
                      {pet.imageUrl && (
                        <div className="w-full aspect-[4/3] rounded-lg mb-3 overflow-hidden border border-warm-dark/20 flex items-center justify-center bg-warm/50">
                          <img src={pet.imageUrl} alt={pet.name} className="w-full h-full object-contain" />
                        </div>
                      )}
                      <h3 className="font-bold text-gray-900">{pet.name}</h3>
                      <p className="text-xs text-muted">{pet.type}{pet.breed ? ` \u00B7 ${pet.breed}` : ''}</p>
                      <p className="text-xs text-muted-light mt-1">{pet.location}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${pet.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{pet.status}</span>
                        <span className="text-xs text-muted-light">{products[pet.id]?.length || 0}/4 products</span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => handleEditPet(pet)}
                          className="text-xs px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium transition-colors">Edit</button>
                        <button onClick={() => handleDeletePet(pet.id)}
                          className="text-xs px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium transition-colors">Delete</button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Add Pet Modal */}
              {showAddPet && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowAddPet(false)}>
                  <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
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
                        <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Health</h4>
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-coral focus:ring-coral"
                              checked={petForm.isVaccinated} onChange={(e) => setPetForm({ ...petForm, isVaccinated: e.target.checked })} />
                            Vaccinated
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-coral focus:ring-coral"
                              checked={petForm.isSterilized} onChange={(e) => setPetForm({ ...petForm, isSterilized: e.target.checked })} />
                            Sterilized
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-coral focus:ring-coral"
                              checked={petForm.isDewormed} onChange={(e) => setPetForm({ ...petForm, isDewormed: e.target.checked })} />
                            Dewormed
                          </label>
                        </div>
                        <textarea className="input" rows="2" placeholder="Health notes (optional)" value={petForm.healthNotes} onChange={(e) => setPetForm({ ...petForm, healthNotes: e.target.value })} />
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Behavior</h4>
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-coral focus:ring-coral"
                              checked={petForm.goodWithKids} onChange={(e) => setPetForm({ ...petForm, goodWithKids: e.target.checked })} />
                            Good with kids
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-coral focus:ring-coral"
                              checked={petForm.goodWithDogs} onChange={(e) => setPetForm({ ...petForm, goodWithDogs: e.target.checked })} />
                            Good with dogs
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-coral focus:ring-coral"
                              checked={petForm.goodWithCats} onChange={(e) => setPetForm({ ...petForm, goodWithCats: e.target.checked })} />
                            Good with cats
                          </label>
                        </div>
                        <textarea className="input" rows="2" placeholder="Behavior notes (optional)" value={petForm.behaviorNotes} onChange={(e) => setPetForm({ ...petForm, behaviorNotes: e.target.value })} />
                      </div>

                      {catalogProducts.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Associated Products (optional)</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {catalogProducts.map(p => (
                              <label key={p.id} className="flex items-center gap-2 text-sm">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-coral focus:ring-coral"
                                  checked={petForm.productIds?.includes(p.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setPetForm({ ...petForm, productIds: [...(petForm.productIds || []), p.id] });
                                    } else {
                                      setPetForm({ ...petForm, productIds: (petForm.productIds || []).filter(id => id !== p.id) });
                                    }
                                  }} />
                                {p.name}
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

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

              {/* Edit Pet Modal */}
              {editingPet && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setEditingPet(null)}>
                  <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Edit Pet</h2>
                    {editPetError && <p className="text-red-500 text-sm mb-3 bg-red-50 p-3 rounded-lg">{editPetError}</p>}
                    <form onSubmit={handleSaveEditPet} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input className="input" value={editPetForm.name} onChange={(e) => setEditPetForm({ ...editPetForm, name: e.target.value })} required />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                          <select className="input" value={editPetForm.type} onChange={(e) => setEditPetForm({ ...editPetForm, type: e.target.value })} required>
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
                          <input className="input" value={editPetForm.breed} onChange={(e) => setEditPetForm({ ...editPetForm, breed: e.target.value })} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Age (years)</label>
                          <input type="number" min="0" className="input" value={editPetForm.age} onChange={(e) => setEditPetForm({ ...editPetForm, age: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                          <input className="input" value={editPetForm.location} onChange={(e) => setEditPetForm({ ...editPetForm, location: e.target.value })} required />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea className="input" rows="2" value={editPetForm.description} onChange={(e) => setEditPetForm({ ...editPetForm, description: e.target.value })} />
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Health</h4>
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-coral focus:ring-coral"
                              checked={editPetForm.isVaccinated} onChange={(e) => setEditPetForm({ ...editPetForm, isVaccinated: e.target.checked })} />
                            Vaccinated
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-coral focus:ring-coral"
                              checked={editPetForm.isSterilized} onChange={(e) => setEditPetForm({ ...editPetForm, isSterilized: e.target.checked })} />
                            Sterilized
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-coral focus:ring-coral"
                              checked={editPetForm.isDewormed} onChange={(e) => setEditPetForm({ ...editPetForm, isDewormed: e.target.checked })} />
                            Dewormed
                          </label>
                        </div>
                        <textarea className="input" rows="2" placeholder="Health notes (optional)" value={editPetForm.healthNotes} onChange={(e) => setEditPetForm({ ...editPetForm, healthNotes: e.target.value })} />
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Behavior</h4>
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-coral focus:ring-coral"
                              checked={editPetForm.goodWithKids} onChange={(e) => setEditPetForm({ ...editPetForm, goodWithKids: e.target.checked })} />
                            Good with kids
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-coral focus:ring-coral"
                              checked={editPetForm.goodWithDogs} onChange={(e) => setEditPetForm({ ...editPetForm, goodWithDogs: e.target.checked })} />
                            Good with dogs
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-coral focus:ring-coral"
                              checked={editPetForm.goodWithCats} onChange={(e) => setEditPetForm({ ...editPetForm, goodWithCats: e.target.checked })} />
                            Good with cats
                          </label>
                        </div>
                        <textarea className="input" rows="2" placeholder="Behavior notes (optional)" value={editPetForm.behaviorNotes} onChange={(e) => setEditPetForm({ ...editPetForm, behaviorNotes: e.target.value })} />
                      </div>

                      {catalogProducts.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Associated Products (optional)</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {catalogProducts.map(p => (
                              <label key={p.id} className="flex items-center gap-2 text-sm">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-coral focus:ring-coral"
                                  checked={editPetForm.productIds?.includes(p.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setEditPetForm({ ...editPetForm, productIds: [...(editPetForm.productIds || []), p.id] });
                                    } else {
                                      setEditPetForm({ ...editPetForm, productIds: (editPetForm.productIds || []).filter(id => id !== p.id) });
                                    }
                                  }} />
                                {p.name}
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                        <input type="file" accept="image/*" onChange={(e) => setEditPetImageFile(e.target.files[0])}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-pill file:border-0 file:text-sm file:font-semibold file:bg-coral file:text-white hover:file:bg-coral-dark" />
                        {editingPet.imageUrl && !editPetImageFile && (
                          <p className="text-xs text-muted mt-1">Current photo will be kept if no new file selected.</p>
                        )}
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button type="submit" variant="primary" className="!rounded-pill" disabled={savingEditPet}>
                          {savingEditPet ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button variant="outline" className="!rounded-pill" onClick={() => setEditingPet(null)}>Cancel</Button>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company Logo</label>
                      <input type="file" accept="image/*" onChange={(e) => setProfileLogoFile(e.target.files[0])}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-pill file:border-0 file:text-sm file:font-semibold file:bg-coral file:text-white hover:file:bg-coral-dark" />
                      {profile?.logoUrl && !profileLogoFile && (
                        <p className="text-xs text-muted mt-1">Current logo will be kept if no new file selected.</p>
                      )}
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
                        {profile.logoUrl && (
                          <div className="flex justify-center mb-4">
                            <div className="w-32 h-32 rounded-xl border-2 border-warm-dark/30 overflow-hidden flex items-center justify-center bg-white">
                              <img src={profile.logoUrl} alt={`${profile.companyName} logo`} className="max-w-full max-h-full object-contain" />
                            </div>
                          </div>
                        )}
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

          {tab === 'catalog' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted">{catalog.length} product{catalog.length !== 1 ? 's' : ''}</p>
                <Button variant="primary" className="!rounded-pill" onClick={() => setShowAddCatalog(true)}>Add Product</Button>
              </div>
              {catalogLoading ? (
                <div className="text-center py-16 text-muted">Loading...</div>
              ) : catalog.length === 0 ? (
                <div className="text-center py-16 text-muted">No products yet. Start by adding your first product.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {catalog.map((item) => (
                    <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-xl shadow-card p-4">
                      {item.imageUrl && (
                        <div className="w-full aspect-[4/3] rounded-lg mb-3 overflow-hidden border border-warm-dark/20 flex items-center justify-center bg-warm/50">
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" />
                        </div>
                      )}
                      <h3 className="font-bold text-gray-900">{item.name}</h3>
                      <p className="text-lg font-bold text-coral mt-1">${parseFloat(item.price).toFixed(2)}</p>
                      {item.description && <p className="text-sm text-muted mt-2">{item.description}</p>}
                      <div className="mt-3">
                        <button onClick={() => handleDeleteCatalogProduct(item.id)}
                          className="text-xs px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium transition-colors">Delete</button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Add Product Modal */}
              {showAddCatalog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowAddCatalog(false)}>
                  <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Add Product</h2>
                    <form onSubmit={handleAddCatalogProduct} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                        <input className="input" value={catalogForm.name} onChange={(e) => setCatalogForm({ ...catalogForm, name: e.target.value })} required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea className="input" rows="2" value={catalogForm.description} onChange={(e) => setCatalogForm({ ...catalogForm, description: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                        <input type="number" min="0" step="0.01" className="input" value={catalogForm.price} onChange={(e) => setCatalogForm({ ...catalogForm, price: e.target.value })} required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (optional)</label>
                        <input className="input" value={catalogForm.imageUrl} onChange={(e) => setCatalogForm({ ...catalogForm, imageUrl: e.target.value })} />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button type="submit" variant="primary" className="!rounded-pill">Add Product</Button>
                        <Button variant="outline" className="!rounded-pill" onClick={() => setShowAddCatalog(false)}>Cancel</Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'adoptions' && (
            <div>
              {adoptionsLoading ? (
                <div className="text-center py-16 text-muted">Loading...</div>
              ) : adoptions.length === 0 ? (
                <div className="text-center py-16 text-muted">No adoption requests yet.</div>
              ) : (
                <div className="space-y-3">
                  {adoptions.map((a) => (
                    <div key={a.id} className="bg-white rounded-xl shadow-card p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {a.adopterProfilePictureUrl ? (
                          <img src={a.adopterProfilePictureUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-warm-dark flex items-center justify-center text-sm font-bold text-muted">
                            {a.adopterName?.charAt(0) || '?'}
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-gray-900">{a.petName}</span>
                          <span className="text-muted text-sm ml-2">by {a.adopterName}</span>
                          <p className="text-xs text-muted-light mt-0.5">{new Date(a.createdAt).toLocaleDateString()}</p>
                          {a.applicationMessage && <p className="text-sm text-gray-600 mt-2 italic">"{a.applicationMessage}"</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${a.status === 'ApplicationReceived' ? 'bg-amber-100 text-amber-700' : a.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{a.status}</span>
                        {a.status === 'ApplicationReceived' && (
                          <>
                            <button onClick={() => handleRespondAdoption(a.id, 'Completed')}
                              className="text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium transition-colors">Approve</button>
                            <button onClick={() => handleRespondAdoption(a.id, 'Cancelled')}
                              className="text-xs px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium transition-colors">Reject</button>
                          </>
                        )}
                      </div>
                    </div>
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

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/client';
import { useAuth } from '../../hooks/useAuth';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import PageTransition from '../../components/animations/PageTransition';
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

  const availableCount = pets.filter(p => p.status === 'Available').length;
  const pendingAdoptions = adoptions.filter(a => a.status === 'ApplicationReceived').length;

  return (
    <PageTransition>
      <Navbar />
      <main className="bg-[#FAF7F2] min-h-screen pb-20">
        <div className="bg-white border-b border-[#E8E0D8] px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="font-display font-black text-3xl text-[#0D0D0D]">Enterprise Dashboard</h1>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-2 mb-8 flex-wrap">
            {[
              { key: 'pets', label: `My Pets (${pets.length}/6)` },
              { key: 'profile', label: 'Company Profile' },
              { key: 'catalog', label: 'Catalog' },
              { key: 'adoptions', label: 'Adoption Requests' },
            ].map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={tab === t.key ? 'bg-[#0D0D0D] text-[#FAF7F2] rounded-full px-5 py-2 text-sm font-semibold' : 'bg-[#FAF7F2] text-[#8c7e74] border border-[#E8E0D8] rounded-full px-5 py-2 text-sm font-semibold hover:border-[#0D0D0D] hover:text-[#0D0D0D] transition-colors'}>
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'pets' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-3xl border border-[#E8E0D8] p-8">
                  <div className="font-display font-black text-[56px] leading-none text-[#0D0D0D]">{pets.length}</div>
                  <div className="text-xs font-bold tracking-widest uppercase text-[#8c7e74] mt-2">Total Pets</div>
                </div>
                <div className="bg-white rounded-3xl border border-[#E8E0D8] p-8">
                  <div className="font-display font-black text-[56px] leading-none text-[#0D0D0D]">{availableCount}</div>
                  <div className="text-xs font-bold tracking-widest uppercase text-[#8c7e74] mt-2">Available</div>
                </div>
                <div className="bg-white rounded-3xl border border-[#E8E0D8] p-8">
                  <div className="font-display font-black text-[56px] leading-none text-[#0D0D0D]">{pendingAdoptions}</div>
                  <div className="text-xs font-bold tracking-widest uppercase text-[#8c7e74] mt-2">Pending Requests</div>
                </div>
              </div>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-[#8c7e74]">{pets.length}/6 pets used</p>
                {pets.length < 6 && <button className="btn-dark" onClick={handleOpenAddPet}>Add Pet</button>}
              </div>
              {pets.length === 0 ? (
                <div className="text-center py-16 text-[#8c7e74]">No pets yet. Start by adding your first pet.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pets.map((pet) => (
                    <motion.div key={pet.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-3xl border border-[#E8E0D8] overflow-hidden hover:-translate-y-1 hover:shadow-card-hover transition-all duration-300">
                      {pet.imageUrl && (
                        <div className="w-full aspect-[4/3] overflow-hidden border-b border-[#E8E0D8] flex items-center justify-center bg-[#FAF7F2]">
                          <img src={pet.imageUrl} alt={pet.name} className="w-full h-full object-contain" />
                        </div>
                      )}
                      <div className="p-5">
                        <h3 className="font-bold text-[#0D0D0D]">{pet.name}</h3>
                        <p className="text-xs text-[#8c7e74]">{pet.type}{pet.breed ? ` \u00B7 ${pet.breed}` : ''}</p>
                        <p className="text-xs text-[#b8aaa0] mt-1">{pet.location}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className={`tag ${pet.status === 'Available' ? 'tag-teal' : 'tag-outline'}`}>{pet.status}</span>
                          <span className="text-xs text-[#b8aaa0]">{products[pet.id]?.length || 0}/4 products</span>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <button onClick={() => handleEditPet(pet)}
                            className="text-xs px-4 py-2 bg-[#FAF7F2] text-[#0D0D0D] rounded-full hover:bg-[#0D0D0D] hover:text-[#FAF7F2] font-semibold transition-all duration-200">Edit</button>
                          <button onClick={() => handleDeletePet(pet.id)}
                            className="text-xs px-4 py-2 bg-[#fef2ef] text-[#D85A30] rounded-full hover:bg-[#D85A30] hover:text-white font-semibold transition-all duration-200">Delete</button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {showAddPet && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowAddPet(false)}>
                  <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                    <h2 className="text-lg font-bold text-[#0D0D0D] mb-6">Add a Pet</h2>
                    {petError && <p className="text-red-500 text-sm mb-4 bg-red-50 p-4 rounded-2xl">{petError}</p>}
                    <form onSubmit={handleAddPet} className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-[#0D0D0D] mb-1.5">Name</label>
                        <input className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" value={petForm.name} onChange={(e) => setPetForm({ ...petForm, name: e.target.value })} required />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-semibold text-[#0D0D0D] mb-1.5">Type</label>
                          <select className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" value={petForm.type} onChange={(e) => setPetForm({ ...petForm, type: e.target.value })} required>
                            <option value="">Select...</option>
                            <option value="Dog">Dog</option>
                            <option value="Cat">Cat</option>
                            <option value="Rabbit">Rabbit</option>
                            <option value="Bird">Bird</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[#0D0D0D] mb-1.5">Breed</label>
                          <input className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" value={petForm.breed} onChange={(e) => setPetForm({ ...petForm, breed: e.target.value })} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-semibold text-[#0D0D0D] mb-1.5">Age (years)</label>
                          <input type="number" min="0" className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" value={petForm.age} onChange={(e) => setPetForm({ ...petForm, age: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[#0D0D0D] mb-1.5">Location</label>
                          <input className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" value={petForm.location} onChange={(e) => setPetForm({ ...petForm, location: e.target.value })} required />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#0D0D0D] mb-1.5">Description</label>
                        <textarea className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" rows="2" value={petForm.description} onChange={(e) => setPetForm({ ...petForm, description: e.target.value })} />
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-[#8c7e74] uppercase tracking-wider mb-3">Health</h4>
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          <label className="flex items-center gap-2 text-sm text-[#0D0D0D]">
                            <input type="checkbox" className="w-4 h-4 rounded border-[#E8E0D8] text-[#0D0D0D] focus:ring-[#0D0D0D]"
                              checked={petForm.isVaccinated} onChange={(e) => setPetForm({ ...petForm, isVaccinated: e.target.checked })} />
                            Vaccinated
                          </label>
                          <label className="flex items-center gap-2 text-sm text-[#0D0D0D]">
                            <input type="checkbox" className="w-4 h-4 rounded border-[#E8E0D8] text-[#0D0D0D] focus:ring-[#0D0D0D]"
                              checked={petForm.isSterilized} onChange={(e) => setPetForm({ ...petForm, isSterilized: e.target.checked })} />
                            Sterilized
                          </label>
                          <label className="flex items-center gap-2 text-sm text-[#0D0D0D]">
                            <input type="checkbox" className="w-4 h-4 rounded border-[#E8E0D8] text-[#0D0D0D] focus:ring-[#0D0D0D]"
                              checked={petForm.isDewormed} onChange={(e) => setPetForm({ ...petForm, isDewormed: e.target.checked })} />
                            Dewormed
                          </label>
                        </div>
                        <textarea className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" rows="2" placeholder="Health notes (optional)" value={petForm.healthNotes} onChange={(e) => setPetForm({ ...petForm, healthNotes: e.target.value })} />
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-[#8c7e74] uppercase tracking-wider mb-3">Behavior</h4>
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          <label className="flex items-center gap-2 text-sm text-[#0D0D0D]">
                            <input type="checkbox" className="w-4 h-4 rounded border-[#E8E0D8] text-[#0D0D0D] focus:ring-[#0D0D0D]"
                              checked={petForm.goodWithKids} onChange={(e) => setPetForm({ ...petForm, goodWithKids: e.target.checked })} />
                            Good with kids
                          </label>
                          <label className="flex items-center gap-2 text-sm text-[#0D0D0D]">
                            <input type="checkbox" className="w-4 h-4 rounded border-[#E8E0D8] text-[#0D0D0D] focus:ring-[#0D0D0D]"
                              checked={petForm.goodWithDogs} onChange={(e) => setPetForm({ ...petForm, goodWithDogs: e.target.checked })} />
                            Good with dogs
                          </label>
                          <label className="flex items-center gap-2 text-sm text-[#0D0D0D]">
                            <input type="checkbox" className="w-4 h-4 rounded border-[#E8E0D8] text-[#0D0D0D] focus:ring-[#0D0D0D]"
                              checked={petForm.goodWithCats} onChange={(e) => setPetForm({ ...petForm, goodWithCats: e.target.checked })} />
                            Good with cats
                          </label>
                        </div>
                        <textarea className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" rows="2" placeholder="Behavior notes (optional)" value={petForm.behaviorNotes} onChange={(e) => setPetForm({ ...petForm, behaviorNotes: e.target.value })} />
                      </div>

                      {catalogProducts.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-[#8c7e74] uppercase tracking-wider mb-3">Associated Products (optional)</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {catalogProducts.map(p => (
                              <label key={p.id} className="flex items-center gap-2 text-sm text-[#0D0D0D]">
                                <input type="checkbox" className="w-4 h-4 rounded border-[#E8E0D8] text-[#0D0D0D] focus:ring-[#0D0D0D]"
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
                        <label className="block text-sm font-semibold text-[#0D0D0D] mb-1.5">Photo</label>
                        <input type="file" accept="image/*" onChange={handlePetImageChange}
                          className="block w-full text-sm text-[#8c7e74] file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#0D0D0D] file:text-[#FAF7F2] hover:file:bg-[#2A2A2A] file:cursor-pointer file:transition-colors" />
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button type="submit" className="btn-dark" disabled={savingPet}>
                          {savingPet ? 'Adding...' : 'Add Pet'}
                        </button>
                        <button className="btn-outline" onClick={() => setShowAddPet(false)}>Cancel</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {editingPet && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setEditingPet(null)}>
                  <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                    <h2 className="text-lg font-bold text-[#0D0D0D] mb-6">Edit Pet</h2>
                    {editPetError && <p className="text-red-500 text-sm mb-4 bg-red-50 p-4 rounded-2xl">{editPetError}</p>}
                    <form onSubmit={handleSaveEditPet} className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-[#0D0D0D] mb-1.5">Name</label>
                        <input className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" value={editPetForm.name} onChange={(e) => setEditPetForm({ ...editPetForm, name: e.target.value })} required />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-semibold text-[#0D0D0D] mb-1.5">Type</label>
                          <select className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" value={editPetForm.type} onChange={(e) => setEditPetForm({ ...editPetForm, type: e.target.value })} required>
                            <option value="">Select...</option>
                            <option value="Dog">Dog</option>
                            <option value="Cat">Cat</option>
                            <option value="Rabbit">Rabbit</option>
                            <option value="Bird">Bird</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[#0D0D0D] mb-1.5">Breed</label>
                          <input className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" value={editPetForm.breed} onChange={(e) => setEditPetForm({ ...editPetForm, breed: e.target.value })} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-semibold text-[#0D0D0D] mb-1.5">Age (years)</label>
                          <input type="number" min="0" className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" value={editPetForm.age} onChange={(e) => setEditPetForm({ ...editPetForm, age: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[#0D0D0D] mb-1.5">Location</label>
                          <input className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" value={editPetForm.location} onChange={(e) => setEditPetForm({ ...editPetForm, location: e.target.value })} required />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#0D0D0D] mb-1.5">Description</label>
                        <textarea className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" rows="2" value={editPetForm.description} onChange={(e) => setEditPetForm({ ...editPetForm, description: e.target.value })} />
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-[#8c7e74] uppercase tracking-wider mb-3">Health</h4>
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          <label className="flex items-center gap-2 text-sm text-[#0D0D0D]">
                            <input type="checkbox" className="w-4 h-4 rounded border-[#E8E0D8] text-[#0D0D0D] focus:ring-[#0D0D0D]"
                              checked={editPetForm.isVaccinated} onChange={(e) => setEditPetForm({ ...editPetForm, isVaccinated: e.target.checked })} />
                            Vaccinated
                          </label>
                          <label className="flex items-center gap-2 text-sm text-[#0D0D0D]">
                            <input type="checkbox" className="w-4 h-4 rounded border-[#E8E0D8] text-[#0D0D0D] focus:ring-[#0D0D0D]"
                              checked={editPetForm.isSterilized} onChange={(e) => setEditPetForm({ ...editPetForm, isSterilized: e.target.checked })} />
                            Sterilized
                          </label>
                          <label className="flex items-center gap-2 text-sm text-[#0D0D0D]">
                            <input type="checkbox" className="w-4 h-4 rounded border-[#E8E0D8] text-[#0D0D0D] focus:ring-[#0D0D0D]"
                              checked={editPetForm.isDewormed} onChange={(e) => setEditPetForm({ ...editPetForm, isDewormed: e.target.checked })} />
                            Dewormed
                          </label>
                        </div>
                        <textarea className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" rows="2" placeholder="Health notes (optional)" value={editPetForm.healthNotes} onChange={(e) => setEditPetForm({ ...editPetForm, healthNotes: e.target.value })} />
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-[#8c7e74] uppercase tracking-wider mb-3">Behavior</h4>
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          <label className="flex items-center gap-2 text-sm text-[#0D0D0D]">
                            <input type="checkbox" className="w-4 h-4 rounded border-[#E8E0D8] text-[#0D0D0D] focus:ring-[#0D0D0D]"
                              checked={editPetForm.goodWithKids} onChange={(e) => setEditPetForm({ ...editPetForm, goodWithKids: e.target.checked })} />
                            Good with kids
                          </label>
                          <label className="flex items-center gap-2 text-sm text-[#0D0D0D]">
                            <input type="checkbox" className="w-4 h-4 rounded border-[#E8E0D8] text-[#0D0D0D] focus:ring-[#0D0D0D]"
                              checked={editPetForm.goodWithDogs} onChange={(e) => setEditPetForm({ ...editPetForm, goodWithDogs: e.target.checked })} />
                            Good with dogs
                          </label>
                          <label className="flex items-center gap-2 text-sm text-[#0D0D0D]">
                            <input type="checkbox" className="w-4 h-4 rounded border-[#E8E0D8] text-[#0D0D0D] focus:ring-[#0D0D0D]"
                              checked={editPetForm.goodWithCats} onChange={(e) => setEditPetForm({ ...editPetForm, goodWithCats: e.target.checked })} />
                            Good with cats
                          </label>
                        </div>
                        <textarea className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" rows="2" placeholder="Behavior notes (optional)" value={editPetForm.behaviorNotes} onChange={(e) => setEditPetForm({ ...editPetForm, behaviorNotes: e.target.value })} />
                      </div>

                      {catalogProducts.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-[#8c7e74] uppercase tracking-wider mb-3">Associated Products (optional)</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {catalogProducts.map(p => (
                              <label key={p.id} className="flex items-center gap-2 text-sm text-[#0D0D0D]">
                                <input type="checkbox" className="w-4 h-4 rounded border-[#E8E0D8] text-[#0D0D0D] focus:ring-[#0D0D0D]"
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
                        <label className="block text-sm font-semibold text-[#0D0D0D] mb-1.5">Photo</label>
                        <input type="file" accept="image/*" onChange={(e) => setEditPetImageFile(e.target.files[0])}
                          className="block w-full text-sm text-[#8c7e74] file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#0D0D0D] file:text-[#FAF7F2] hover:file:bg-[#2A2A2A] file:cursor-pointer file:transition-colors" />
                        {editingPet.imageUrl && !editPetImageFile && (
                          <p className="text-xs text-[#8c7e74] mt-2">Current photo will be kept if no new file selected.</p>
                        )}
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button type="submit" className="btn-dark" disabled={savingEditPet}>
                          {savingEditPet ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button className="btn-outline" onClick={() => setEditingPet(null)}>Cancel</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'profile' && (
            <div className="bg-white rounded-3xl border border-[#E8E0D8] p-8 max-w-lg">
              {profileError && <p className="text-red-500 text-sm mb-4 bg-red-50 p-4 rounded-2xl">{profileError}</p>}
              {editingProfile ? (
                <div>
                  <h2 className="text-lg font-bold text-[#0D0D0D] mb-5">Edit Company Profile</h2>
                  <form onSubmit={handleSaveProfile} className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-[#0D0D0D] mb-1.5">Company Name</label>
                      <input className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" value={profileForm.companyName} onChange={(e) => setProfileForm({ ...profileForm, companyName: e.target.value })} required />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#0D0D0D] mb-1.5">Company Logo</label>
                      <input type="file" accept="image/*" onChange={(e) => setProfileLogoFile(e.target.files[0])}
                        className="block w-full text-sm text-[#8c7e74] file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#0D0D0D] file:text-[#FAF7F2] hover:file:bg-[#2A2A2A] file:cursor-pointer file:transition-colors" />
                      {profile?.logoUrl && !profileLogoFile && (
                        <p className="text-xs text-[#8c7e74] mt-2">Current logo will be kept if no new file selected.</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#0D0D0D] mb-1.5">Location</label>
                      <input className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" value={profileForm.location} onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })} required />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-[#0D0D0D] mb-1.5">Phone</label>
                        <input className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#0D0D0D] mb-1.5">Email</label>
                        <input type="email" className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#0D0D0D] mb-1.5">Website</label>
                      <input className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" value={profileForm.website} onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#0D0D0D] mb-1.5">Description</label>
                      <textarea className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" rows="3" value={profileForm.description} onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })} />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button type="submit" className="btn-dark" disabled={savingProfile}>
                        {savingProfile ? 'Saving...' : 'Save'}
                      </button>
                      <button className="btn-outline" onClick={() => setEditingProfile(false)}>Cancel</button>
                    </div>
                  </form>
                </div>
              ) : (
                <div>
                  <h2 className="text-lg font-bold text-[#0D0D0D] mb-5">Company Information</h2>
                  {profile && (
                    <div className="space-y-4 text-sm">
                      {profile.logoUrl && (
                        <div className="flex justify-center mb-6">
                          <div className="w-32 h-32 rounded-2xl border-2 border-[#E8E0D8] overflow-hidden flex items-center justify-center bg-white">
                            <img src={profile.logoUrl} alt={`${profile.companyName} logo`} className="max-w-full max-h-full object-contain" />
                          </div>
                        </div>
                      )}
                      <div><span className="text-[#8c7e74]">Name:</span> <span className="font-semibold text-[#0D0D0D]">{profile.companyName}</span></div>
                      <div><span className="text-[#8c7e74]">Location:</span> <span className="text-[#0D0D0D]">{profile.location}</span></div>
                      <div><span className="text-[#8c7e74]">Phone:</span> <span className="text-[#0D0D0D]">{profile.phone || '\u2014'}</span></div>
                      <div><span className="text-[#8c7e74]">Email:</span> <span className="text-[#0D0D0D]">{profile.email || '\u2014'}</span></div>
                      {profile.description && <div><span className="text-[#8c7e74]">About:</span> <p className="text-[#0D0D0D] mt-1 leading-relaxed">{profile.description}</p></div>}
                    </div>
                  )}
                  <button className="btn-dark mt-8" onClick={handleEditProfile}>Edit Profile</button>
                </div>
              )}
            </div>
          )}

          {tab === 'catalog' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-[#8c7e74]">{catalog.length} product{catalog.length !== 1 ? 's' : ''}</p>
                <button className="btn-dark" onClick={() => setShowAddCatalog(true)}>Add Product</button>
              </div>
              {catalogLoading ? (
                <div className="text-center py-16 text-[#8c7e74]">Loading...</div>
              ) : catalog.length === 0 ? (
                <div className="text-center py-16 text-[#8c7e74]">No products yet. Start by adding your first product.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {catalog.map((item) => (
                    <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-3xl border border-[#E8E0D8] overflow-hidden hover:-translate-y-1 hover:shadow-card-hover transition-all duration-300">
                      {item.imageUrl && (
                        <div className="w-full aspect-[4/3] overflow-hidden border-b border-[#E8E0D8] flex items-center justify-center bg-[#FAF7F2]">
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" />
                        </div>
                      )}
                      <div className="p-5">
                        <h3 className="font-bold text-[#0D0D0D]">{item.name}</h3>
                        <p className="text-lg font-bold text-[#D85A30] mt-1">${parseFloat(item.price).toFixed(2)}</p>
                        {item.description && <p className="text-sm text-[#8c7e74] mt-2 leading-relaxed">{item.description}</p>}
                        <div className="mt-4">
                          <button onClick={() => handleDeleteCatalogProduct(item.id)}
                            className="text-xs px-4 py-2 bg-[#fef2ef] text-[#D85A30] rounded-full hover:bg-[#D85A30] hover:text-white font-semibold transition-all duration-200">Delete</button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {showAddCatalog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowAddCatalog(false)}>
                  <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
                    <h2 className="text-lg font-bold text-[#0D0D0D] mb-6">Add Product</h2>
                    <form onSubmit={handleAddCatalogProduct} className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-[#0D0D0D] mb-1.5">Name *</label>
                        <input className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" value={catalogForm.name} onChange={(e) => setCatalogForm({ ...catalogForm, name: e.target.value })} required />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#0D0D0D] mb-1.5">Description</label>
                        <textarea className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" rows="2" value={catalogForm.description} onChange={(e) => setCatalogForm({ ...catalogForm, description: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#0D0D0D] mb-1.5">Price *</label>
                        <input type="number" min="0" step="0.01" className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" value={catalogForm.price} onChange={(e) => setCatalogForm({ ...catalogForm, price: e.target.value })} required />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#0D0D0D] mb-1.5">Image URL (optional)</label>
                        <input className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" value={catalogForm.imageUrl} onChange={(e) => setCatalogForm({ ...catalogForm, imageUrl: e.target.value })} />
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button type="submit" className="btn-dark">Add Product</button>
                        <button className="btn-outline" onClick={() => setShowAddCatalog(false)}>Cancel</button>
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
                <div className="text-center py-16 text-[#8c7e74]">Loading...</div>
              ) : adoptions.length === 0 ? (
                <div className="text-center py-16 text-[#8c7e74]">No adoption requests yet.</div>
              ) : (
                <div className="space-y-3">
                  {adoptions.map((a) => (
                    <div key={a.id} className="bg-white rounded-3xl border border-[#E8E0D8] p-5 flex items-center justify-between hover:-translate-y-0.5 hover:shadow-card-hover transition-all duration-300">
                      <div className="flex items-center gap-4">
                        {a.adopterProfilePictureUrl ? (
                          <img src={a.adopterProfilePictureUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#E8E0D8] flex items-center justify-center text-sm font-bold text-[#8c7e74]">
                            {a.adopterName?.charAt(0) || '?'}
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-[#0D0D0D]">{a.petName}</span>
                          <span className="text-[#8c7e74] text-sm ml-2">by {a.adopterName}</span>
                          <p className="text-xs text-[#b8aaa0] mt-0.5">{new Date(a.createdAt).toLocaleDateString()}</p>
                          {a.applicationMessage && <p className="text-sm text-[#0D0D0D] mt-2 italic">"{a.applicationMessage}"</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`tag ${a.status === 'ApplicationReceived' ? 'tag-coral' : a.status === 'Completed' ? 'tag-teal' : 'tag-outline'}`}>{a.status}</span>
                        {a.status === 'ApplicationReceived' && (
                          <>
                            <button onClick={() => handleRespondAdoption(a.id, 'Completed')}
                              className="text-xs px-4 py-2 bg-[#e6f7f4] text-[#1a8a7a] rounded-full hover:bg-[#1a8a7a] hover:text-white font-semibold transition-all duration-200">Approve</button>
                            <button onClick={() => handleRespondAdoption(a.id, 'Cancelled')}
                              className="text-xs px-4 py-2 bg-[#fef2ef] text-[#D85A30] rounded-full hover:bg-[#D85A30] hover:text-white font-semibold transition-all duration-200">Reject</button>
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

import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePets } from '../../hooks/usePets';
import Navbar from '../../components/layout/Navbar';
import AdminSidebar from '../../components/layout/AdminSidebar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PageTransition from '../../components/animations/PageTransition';

const speciesEmoji = {
  Dog: '🐕', Cat: '🐈', Rabbit: '🐰', Bird: '🐦', Parrot: '🦜',
  Hamster: '🐹', Fish: '🐟', Turtle: '🐢', Horse: '🐴',
};

const petStatus = (s) => {
  if (typeof s === 'number') return ({ 1: 'Available', 2: 'Adopted', 3: 'Pending' })[s] || 'Available';
  const map = { Available: 'Available', ApplicationReceived: 'Pending', UnderReview: 'Pending', Approved: 'Pending', Completed: 'Adopted' };
  return map[s] || s || 'Available';
};

const emptyForm = { name: '', type: '', breed: '', age: '', description: '', status: 'Available', imageUrl: '' };

export default function PetManagement() {
  const { pets, loading, createPet, updatePet, deletePet } = usePets();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [submitting, setSubmitting] = useState(false);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };

  const openEdit = (pet) => {
    setEditing(pet);
    setForm({
      name: pet.name || '',
      type: pet.type || '',
      breed: pet.breed || '',
      age: pet.age?.toString() || '',
      description: pet.description || '',
      status: typeof pet.status === 'number' ? pet.status : (pet.status === 'Available' ? 1 : pet.status === 'Adopted' ? 2 : 3),
      imageUrl: pet.imageUrl || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, age: form.age ? parseInt(form.age) : 0 };
      if (editing) await updatePet(editing.id, payload);
      else await createPet(payload);
      setModalOpen(false);
    } catch {} finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    await deletePet(confirmDelete.id);
    setConfirmDelete(null);
  };

  const statuses = ['All', 'Available', 'Pending', 'Adopted'];
  const filtered = statusFilter === 'All' ? pets : pets.filter((p) => petStatus(p.status) === statusFilter);
  const stagger = { initial: {}, animate: { transition: { staggerChildren: 0.05 } } };
  const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <AdminSidebar />
        <div className="pl-64 pt-16">
          <div className="max-w-7xl mx-auto px-8 py-8">
            <div className="flex items-center justify-between mb-8">
              <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold text-gray-900">
                Pet Management
              </motion.h1>
              <Button onClick={openCreate} className="!px-5 !py-2.5 text-sm">+ Add Pet</Button>
            </div>

            <div className="flex gap-2 mb-6 flex-wrap">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    statusFilter === s ? 'bg-coral text-white' : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm border border-gray-100'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {loading ? <LoadingSpinner />
            : filtered.length === 0 ? (
              <p className="text-center text-gray-400 py-16">No pets found</p>
            ) : (
              <motion.div variants={stagger} initial="initial" animate="animate" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((pet) => (
                  <motion.div key={pet.id} variants={fadeUp} className="card relative group">
                    <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(pet)} className="w-8 h-8 bg-white rounded-full shadow flex items-center justify-center text-sm hover:text-coral transition-colors">✎</button>
                      <button onClick={() => setConfirmDelete(pet)} className="w-8 h-8 bg-white rounded-full shadow flex items-center justify-center text-sm hover:text-red-500 transition-colors">✕</button>
                    </div>
                    <div className="h-40 bg-warm rounded-xl mb-4 flex items-center justify-center text-5xl overflow-hidden">
                      {pet.imageUrl ? <img src={pet.imageUrl} alt={pet.name} className="w-full h-full object-cover" /> : <span>{speciesEmoji[pet.type] || '🐾'}</span>}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{pet.name}</h3>
                    <p className="text-gray-500 text-sm mt-0.5">{pet.breed || 'Mixed Breed'} &middot; {pet.age != null ? `${pet.age}y` : '—'}</p>
                    <div className="mt-3"><Badge status={petStatus(pet.status)} /></div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Pet' : 'Add Pet'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input label="Type / Species" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="Dog, Cat..." required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Breed" value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} />
            <Input label="Age" type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="input" />
          </div>
          <Input label="Image URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input">
              <option value={1}>Available</option>
              <option value={2}>Adopted</option>
              <option value={3}>Pending</option>
            </select>
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Saving...' : editing ? 'Update Pet' : 'Create Pet'}
          </Button>
        </form>
      </Modal>

      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Confirm Delete">
        <p className="text-gray-600 mb-6">Are you sure you want to delete <strong>{confirmDelete?.name}</strong>? This cannot be undone.</p>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button className="flex-1 !bg-red-500 hover:!bg-red-600" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </PageTransition>
  );
}

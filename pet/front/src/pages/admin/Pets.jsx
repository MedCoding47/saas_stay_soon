import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePets } from '../../hooks/usePets';
import Navbar from '../../components/layout/Navbar';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';

export default function AdminPets() {
  const { pets, loading, createPet, updatePet, deletePet } = usePets();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', breed: '', age: '', status: 'Available', imageUrl: '' });

  const openCreate = () => { setEditing(null); setForm({ name: '', breed: '', age: '', status: 'Available', imageUrl: '' }); setModalOpen(true); };

  const openEdit = (pet) => { setEditing(pet); setForm({ name: pet.name, breed: pet.breed || '', age: pet.age?.toString() || '', status: pet.status || 'Available', imageUrl: pet.imageUrl || '' }); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, age: parseInt(form.age) || 0 };
    try {
      if (editing) { await updatePet(editing.id, payload); } else { await createPet(payload); }
      setModalOpen(false);
    } catch {}
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this pet?')) { await deletePet(id); }
  };

  return (
    <div className="min-h-screen bg-beige-light">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Pet Management</h1>
          <Button variant="primary" onClick={openCreate}>+ Add Pet</Button>
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-12">Loading pets...</p>
        ) : pets.length === 0 ? (
          <p className="text-center text-gray-400 py-12">No pets found. Add your first pet!</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map((pet, i) => (
              <motion.div key={pet.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card>
                  <div className="h-40 bg-beige rounded-xl mb-4 flex items-center justify-center text-5xl overflow-hidden">
                    {pet.imageUrl ? <img src={pet.imageUrl} alt={pet.name} className="w-full h-full object-cover" /> : '🐾'}
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-bold text-gray-800">{pet.name}</h3>
                    <Badge status={pet.status} />
                  </div>
                  <p className="text-sm text-gray-500 mb-1">{pet.breed || 'Mixed'} {pet.age ? `• ${pet.age} yr` : ''}</p>
                  <div className="flex gap-2 mt-3">
                    <Button variant="ghost" className="text-sm !px-3 !py-1" onClick={() => openEdit(pet)}>Edit</Button>
                    <Button variant="ghost" className="text-sm !px-3 !py-1 !text-red-500 hover:!bg-red-50" onClick={() => handleDelete(pet.id)}>Delete</Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Pet' : 'Add Pet'}>
        <form onSubmit={handleSubmit}>
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Breed" value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} />
          <Input label="Age" type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
          <Input label="Image URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input-field">
              <option value="Available">Available</option>
              <option value="Pending">Pending</option>
              <option value="Adopted">Adopted</option>
            </select>
          </div>
          <div className="flex gap-3 mt-6">
            <Button type="submit" variant="primary">{editing ? 'Update' : 'Create'}</Button>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

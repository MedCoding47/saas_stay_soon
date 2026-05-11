import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePets } from '../../hooks/usePets';
import Navbar from '../../components/layout/Navbar';
import AdminSidebar from '../../components/layout/AdminSidebar';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PageTransition from '../../components/animations/PageTransition';

const petStatus = (s) => {
  if (typeof s === 'number') return ({ 1:'Available',2:'Adopted',3:'Pending' })[s]||'Available';
  const map = { 'Available':'Available', 'ApplicationReceived':'Pending', 'UnderReview':'Pending', 'Approved':'Pending', 'Completed':'Adopted' };
  return map[s] || s || 'Available';
};
const emptyForm = { name: '', type: '', breed: '', age: '', description: '', status: 'Available', imageUrl: '' };

export default function PetManagement() {
  const { pets, loading, createPet, updatePet, deletePet } = usePets();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };

  const openEdit = (pet) => {
    setEditing(pet);
    setForm({
      name: pet.name || '',
      type: pet.type || '',
      breed: pet.breed || '',
      age: pet.age?.toString() || '',
      description: pet.description || '',
      status: pet.status || 1,
      imageUrl: pet.imageUrl || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, age: parseInt(form.age) || 0 };
    try {
      if (editing) await updatePet(editing.id, payload);
      else await createPet(payload);
      setModalOpen(false);
    } catch {}
  };

  const handleDelete = async (id) => {
    try { await deletePet(id); setConfirmDelete(null); } catch {}
  };

  if (loading) return <LoadingSpinner />;

  return (
    <PageTransition>
      <div className="min-h-screen bg-warm-light">
        <Navbar />
        <AdminSidebar />
        <div className="pl-64 pt-16">
          <div className="max-w-7xl mx-auto px-8 py-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Pet Management</h1>
              <Button variant="primary" onClick={openCreate}>+ Add Pet</Button>
            </div>

            {pets.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-400 mb-4">No pets yet</p>
                <Button variant="primary" onClick={openCreate}>Add Your First Pet</Button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {pets.map((pet, i) => (
                  <motion.div key={pet.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <Card>
                      <div className="h-44 bg-gradient-to-br from-warm to-warm-dark rounded-xl mb-4 flex items-center justify-center text-5xl overflow-hidden">
                        {pet.imageUrl ? <img src={pet.imageUrl} alt={pet.name} className="w-full h-full object-cover" /> : '🐾'}
                      </div>
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-lg font-bold text-gray-900">{pet.name}</h3>
                        <Badge status={petStatus(pet.status)} />
                      </div>
                      <p className="text-sm text-gray-500 mb-1">{pet.type || pet.species || ''} {pet.breed ? `• ${pet.breed}` : ''}</p>
                      {pet.age > 0 && <p className="text-xs text-gray-400 mb-3">{pet.age} year{pet.age > 1 ? 's' : ''} old</p>}
                      <div className="flex gap-2 mt-2">
                        <Button variant="ghost" className="text-sm !px-3 !py-1.5" onClick={() => openEdit(pet)}>Edit</Button>
                        <Button variant="ghost" className="text-sm !px-3 !py-1.5 !text-red-500 hover:!bg-red-50" onClick={() => setConfirmDelete(pet)}>Delete</Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Modal */}
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Pet' : 'Add New Pet'}>
          <form onSubmit={handleSubmit} className="space-y-1">
            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="Dog, Cat..." />
              <Input label="Breed" value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} />
            </div>
            <Input label="Age" type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea className="input min-h-[80px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <Input label="Photo URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input">
                <option value="Available">Available</option>
                <option value="ApplicationReceived">Applied</option>
                <option value="UnderReview">Under Review</option>
                <option value="Approved">Approved</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" variant="primary">{editing ? 'Update Pet' : 'Add Pet'}</Button>
              <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirm Modal */}
        <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete Pet">
          <p className="text-gray-600 mb-6">Are you sure you want to delete <strong>{confirmDelete?.name}</strong>? This cannot be undone.</p>
          <div className="flex gap-3">
            <Button variant="primary" className="!bg-red-500 hover:!bg-red-600" onClick={() => handleDelete(confirmDelete.id)}>Delete</Button>
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>Cancel</Button>
          </div>
        </Modal>
      </div>
    </PageTransition>
  );
}

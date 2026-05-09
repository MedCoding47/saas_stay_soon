import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import PostPetSection from './PostingPets';
import './AdminPetDashboard.css';

// Helper to get an emoji based on pet type
const getPetEmoji = (type) => {
  const emojis = { Dog: '🐕', Cat: '🐈', Rabbit: '🐰', Bird: '🐦', Fish: '🐟', Other: '🐾' };
  return emojis[type] || '🐾';
};

const AdminPetDashboard = () => {
  // Data & UI state
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPet, setEditingPet] = useState(null);
  const [view, setView] = useState('list'); // list | add | edit
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('All');

  // ---------------------------------------------------------------------
  // API: fetch pets
  // ---------------------------------------------------------------------
  const fetchPets = async () => {
    try {
      setLoading(true);
      const response = await api.get('/pets?pageNumber=1&pageSize=200');
      setPets(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching pets:', err);
      setError('Failed to load pets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  // ---------------------------------------------------------------------
  // Delete a pet (with confirmation)
  // ---------------------------------------------------------------------
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this pet?')) return;
    try {
      setLoading(true);
      await api.delete(`/pets/${id}`);
      setPets(pets.filter(p => p.id !== id));
      setSuccessMessage('Pet deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting pet:', err);
      setError('Failed to delete pet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------
  // Edit flow helpers
  // ---------------------------------------------------------------------
  const startEdit = (pet) => {
    setEditingPet(pet);
    setView('edit');
  };

  const handlePetSaved = () => {
    setView('list');
    setEditingPet(null);
    fetchPets();
  };

  // ---------------------------------------------------------------------
  // UI filtering
  // ---------------------------------------------------------------------
  const filteredPets = pets.filter(pet => {
    const matchesSearch = pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecies = speciesFilter === 'All' || pet.type === speciesFilter;
    return matchesSearch && matchesSpecies;
  });

  // ---------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------
  return (
    <div className="admin-pet-dashboard">
      {/* Header controls */}
      <div className="dashboard-header">
        <h2 className="dashboard-title">Pet Management</h2>
        <div className="dashboard-actions">
          <input
            type="text"
            placeholder="Search pets…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <select
            value={speciesFilter}
            onChange={e => setSpeciesFilter(e.target.value)}
            className="species-select"
          >
            <option value="All">All Species</option>
            <option value="Dog">Dog</option>
            <option value="Cat">Cat</option>
            <option value="Rabbit">Rabbit</option>
            <option value="Bird">Bird</option>
            <option value="Fish">Fish</option>
            <option value="Other">Other</option>
          </select>
          {view === 'list' && (
            <button className="add-pet-btn" onClick={() => setView('add')}>+ Add Pet</button>
          )}
        </div>
      </div>

      {/* Status messages */}
      {error && <div className="status-message error">{error}</div>}
      {successMessage && <div className="status-message success">{successMessage}</div>}

      {/* Main content */}
      {view === 'list' && (
        <>
          {loading ? (
            <div className="loading-state">Loading pets…</div>
          ) : (
            <div className="pet-grid">
              {filteredPets.length === 0 ? (
                <div className="empty-state">No pets match the criteria.</div>
              ) : (
                filteredPets.map(pet => {
                  const statusClass = pet.status?.toLowerCase() || 'available';
                  return (
                    <div key={pet.id} className="pet-card" onMouseEnter={e => e.currentTarget.classList.add('hover')} onMouseLeave={e => e.currentTarget.classList.remove('hover')}>
                      <div className="pet-avatar">{getPetEmoji(pet.type)}</div>
                      <div className="pet-name">{pet.name}</div>
                      <div className="pet-species">{pet.type}</div>
                      <div className={`status-badge ${statusClass}`}>{pet.status || 'Available'}</div>
                      <div className="card-actions">
                        <button className="edit-btn" onClick={() => startEdit(pet)}>✏️ Edit</button>
                        <button className="delete-btn" onClick={() => handleDelete(pet.id)}>🗑️ Delete</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </>
      )}

      {/* Add new pet view */}
      {view === 'add' && (
        <div className="modal-section">
          <PostPetSection onSuccess={handlePetSaved} />
          <button className="cancel-btn" onClick={() => setView('list')}>Cancel</button>
        </div>
      )}

      {/* Edit pet view */}
      {view === 'edit' && editingPet && (
        <div className="modal-section">
          <EditPetForm pet={editingPet} onSuccess={handlePetSaved} />
          <button className="cancel-btn" onClick={() => setView('list')}>Cancel</button>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// EditPetForm – unchanged logic, only markup classes are switched to CSS module
// ---------------------------------------------------------------------------
const EditPetForm = ({ pet, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: pet.name || '',
    age: pet.age || '',
    location: pet.location || '',
    type: pet.type || 'Dog',
    breed: pet.breed || '',
    picture: null,
  });
  const [fileName, setFileName] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFormData({ ...formData, picture: selected });
      setFileName(selected.name);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.name || !formData.age || !formData.location || formData.type === 'None') {
      setFormError('Please fill out all required fields.');
      return;
    }
    setIsSubmitting(true);
    const data = new FormData();
    data.append('name', formData.name);
    data.append('age', formData.age);
    data.append('location', formData.location);
    data.append('type', formData.type);
    if (formData.breed) data.append('breed', formData.breed);
    if (formData.picture) data.append('picture', formData.picture);
    data.append('_method', 'PUT');
    try {
      await api.put(`/pets/${pet.id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      onSuccess();
    } catch (error) {
      console.error('Error updating pet:', error);
      setFormError(error.response?.data?.message || 'Failed to update pet. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="edit-pet-form" onSubmit={handleSubmit}>
      <h3>Edit Pet</h3>
      {formError && <div className="form-error">{formError}</div>}
      <label>Name *</label>
      <input name="name" value={formData.name} onChange={handleChange} required />

      <label>Age *</label>
      <input type="number" name="age" value={formData.age} onChange={handleChange} min="0" required />

      <label>Location *</label>
      <input name="location" value={formData.location} onChange={handleChange} required />

      <label>Breed</label>
      <input name="breed" value={formData.breed} onChange={handleChange} />

      <label>Type *</label>
      <select name="type" value={formData.type} onChange={handleChange} required>
        <option value="Dog">Dog</option>
        <option value="Cat">Cat</option>
        <option value="Rabbit">Rabbit</option>
        <option value="Bird">Bird</option>
        <option value="Fish">Fish</option>
        <option value="Other">Other</option>
      </select>

      <label>Change Picture (optional)</label>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {pet.imageUrl && (
        <img src={pet.imageUrl.startsWith('http') ? pet.imageUrl : `/storage/${pet.imageUrl.replace('storage/', '')}`} alt={pet.name} className="preview-image" />
      )}

      <button type="submit" disabled={isSubmitting} className="save-btn">
        {isSubmitting ? 'Updating...' : 'Update Pet'}
      </button>
    </form>
  );
};

export default AdminPetDashboard;

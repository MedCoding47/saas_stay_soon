import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import PostPetSection from './PostingPets';
import './AdminPetDashboard.css';

const getPetEmoji = (type) => {
  const emojis = { Dog: '🐕', Cat: '🐈', Rabbit: '🐰', Bird: '🐦', Fish: '🐟', Other: '🐾' };
  return emojis[type] || '🐾';
};

const getStatusColor = (status) => {
  const colors = {
    Available: { bg: '#E1F5EE', color: '#1D9E75' },
    Pending: { bg: '#FFF8E1', color: '#F4B400' },
    Adopted: { bg: '#FAECE7', color: '#D85A30' }
  };
  return colors[status] || { bg: '#f0f0f0', color: '#333' };
};

const AdminPetDashboard = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPet, setEditingPet] = useState(null);
  const [view, setView] = useState('list'); // 'list', 'add', 'edit'
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch pets from API
  const fetchPets = async () => {
    try {
      setLoading(true);
      const response = await api.get('/pets?pageNumber=1&pageSize=50');
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

  // Handle delete pet
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this pet?')) return;

    try {
      setLoading(true);
      await api.delete(`/pets/${id}`);

      setPets(pets.filter(pet => pet.id !== id));
      setSuccessMessage('Pet deleted successfully!');

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting pet:', err);
      setError('Failed to delete pet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Start editing a pet
  const startEdit = (pet) => {
    setEditingPet(pet);
    setView('edit');
  };

  // Handle pet add/edit completion
  const handlePetSaved = () => {
    setView('list');
    setEditingPet(null);
    fetchPets();
  };

  // Filter pets based on search query
  const filteredPets = pets.filter(pet =>
    pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pet.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{padding:'24px',background:'var(--paw-primary-light)',minHeight:'100%'}}>
      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
        <h1 style={{fontSize:'22px',fontWeight:'700',color:'#333',margin:0}}>Pet Management</h1>
        {view === 'list' && (
          <button onClick={() => setView('add')} style={{background:'var(--paw-primary)',color:'white',border:'none',padding:'10px 20px',borderRadius:'8px',fontSize:'14px',fontWeight:'600',cursor:'pointer',display:'flex',alignItems:'center',gap:'6px'}}>
            <span style={{fontSize:'18px'}}>+</span> Add New Pet
          </button>
        )}
      </div>

      {error && <div style={{padding:'12px 16px',background:'#FFEBEE',borderRadius:'8px',fontSize:'13px',color:'#C62828',marginBottom:'16px'}}>{error}</div>}
      {successMessage && <div style={{padding:'12px 16px',background:'#E8F5E9',borderRadius:'8px',fontSize:'13px',color:'#2E7D32',marginBottom:'16px'}}>{successMessage}</div>}

      {/* Pet listing view */}
      {view === 'list' && (
        <div>
          {/* Search Bar */}
          <div style={{background:'white',padding:'12px 16px',borderRadius:'12px',marginBottom:'20px',display:'flex',alignItems:'center',gap:'8px',boxShadow:'0 2px 8px rgba(0,0,0,0.05)'}}>
            <span style={{fontSize:'16px'}}>🔍</span>
            <input
              type="text"
              placeholder="Search pets by name or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{flex:1,border:'none',outline:'none',fontSize:'14px',color:'#333'}}
            />
          </div>

          {loading ? (
            <div style={{textAlign:'center',padding:'40px',color:'#666'}}>Loading pets...</div>
          ) : (
            <div style={{display:'grid',gridTemplateColumns:'repeat(3, 1fr)',gap:'16px'}}>
              {filteredPets.length === 0 ? (
                <div style={{gridColumn:'1 / -1',textAlign:'center',padding:'40px',color:'#999'}}>No pets found</div>
              ) : (
                filteredPets.map(pet => {
                  const statusStyle = getStatusColor(pet.status);
                  return (
                    <div key={pet.id} style={{background:'white',borderRadius:'12px',padding:'20px',boxShadow:'0 2px 8px rgba(0,0,0,0.08)',transition:'transform 0.2s',cursor:'pointer'}}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      {/* Pet Avatar + Name */}
                      <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'12px'}}>
                        <div style={{width:'48px',height:'48px',borderRadius:'50%',background:'var(--paw-primary-light)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'24px'}}>
                          {getPetEmoji(pet.type)}
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:'600',fontSize:'15px',color:'#333'}}>{pet.name}</div>
                          <div style={{fontSize:'12px',color:'#999'}}>{pet.type}</div>
                        </div>
                      </div>

                      {/* Pet Details */}
                      <div style={{display:'flex',gap:'16px',marginBottom:'12px',fontSize:'12px',color:'#666'}}>
                        <span>🎂 {pet.age} years</span>
                        <span>📍 {pet.location}</span>
                      </div>

                      {/* Status Badge */}
                      <div style={{background:statusStyle.bg,color:statusStyle.color,padding:'4px 10px',borderRadius:'12px',fontSize:'11px',fontWeight:'600',display:'inline-block',marginBottom:'12px'}}>
                        {pet.status || 'Available'}
                      </div>

                      {/* Action Buttons */}
                      <div style={{display:'flex',gap:'8px',borderTop:'1px solid #f0f0f0',paddingTop:'12px'}}>
                        <button
                          onClick={() => startEdit(pet)}
                          style={{flex:1,padding:'8px',borderRadius:'6px',border:'1px solid var(--paw-primary)',background:'white',color:'var(--paw-primary)',cursor:'pointer',fontSize:'12px',fontWeight:'500',display:'flex',alignItems:'center',justifyContent:'center',gap:'4px'}}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(pet.id)}
                          style={{flex:1,padding:'8px',borderRadius:'6px',border:'1px solid #f44336',background:'white',color:'#f44336',cursor:'pointer',fontSize:'12px',fontWeight:'500',display:'flex',alignItems:'center',justifyContent:'center',gap:'4px'}}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Refresh Button */}
          <div style={{marginTop:'16px',textAlign:'center'}}>
            <button onClick={fetchPets} style={{background:'transparent',border:'1px solid #ddd',padding:'8px 16px',borderRadius:'8px',cursor:'pointer',fontSize:'13px',color:'#666'}}>
              🔄 Refresh
            </button>
          </div>
        </div>
      )}

      {/* Add new pet view */}
      {view === 'add' && (
        <div style={{background:'white',borderRadius:'12px',padding:'24px'}}>
          <PostPetSection onSuccess={handlePetSaved} />
          <button onClick={() => setView('list')} style={{marginTop:'12px',padding:'10px 20px',border:'1px solid #ddd',background:'white',borderRadius:'8px',cursor:'pointer',fontSize:'14px'}}>
            Cancel
          </button>
        </div>
      )}

      {/* Edit pet view */}
      {view === 'edit' && editingPet && (
        <div style={{background:'white',borderRadius:'12px',padding:'24px'}}>
          <EditPetForm pet={editingPet} onSuccess={handlePetSaved} />
          <button onClick={() => setView('list')} style={{marginTop:'12px',padding:'10px 20px',border:'1px solid #ddd',background:'white',borderRadius:'8px',cursor:'pointer',fontSize:'14px'}}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

// Edit Pet Form Component
const EditPetForm = ({ pet, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: pet.name || '', age: pet.age || '', location: pet.location || '', type: pet.type || 'Dog', breed: pet.breed || '', picture: null
  });
  const [fileName, setFileName] = useState("");
  const [formError, setFormError] = useState(""); const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) { setFormData({...formData, picture: selectedFile}); setFileName(selectedFile.name); }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setFormError("");
    if (!formData.name || !formData.age || !formData.location || formData.type === "None") {
      setFormError("Please fill out all required fields."); return;
    }
    setIsSubmitting(true);
    const data = new FormData();
    data.append("name", formData.name); data.append("age", formData.age);
    data.append("location", formData.location); data.append("type", formData.type);
    if (formData.breed) data.append("breed", formData.breed);
    if (formData.picture) data.append("picture", formData.picture);
    data.append("_method", "PUT");
    try {
      await api.put(`/pets/${pet.id}`, data, { headers: { "Content-Type": "multipart/form-data" } });
      onSuccess();
    } catch (error) {
      console.error("Error updating pet:", error);
      setFormError(error.response?.data?.message || "Failed to update pet. Please try again.");
    } finally { setIsSubmitting(false); }
  };

  return (
    <div>
      <h2 style={{fontSize:'18px',fontWeight:'600',color:'#333',marginBottom:'16px'}}>Edit Pet</h2>
      {formError && <div style={{padding:'12px 16px',background:'#FFEBEE',borderRadius:'8px',fontSize:'13px',color:'#C62828',marginBottom:'16px'}}>{formError}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{marginBottom:'12px'}}>
          <label style={{display:'block',fontSize:'13px',color:'#666',marginBottom:'4px'}}>Name *</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required
            style={{width:'100%',padding:'10px 12px',border:'1px solid #e0e0e0',borderRadius:'8px',fontSize:'14px'}} />
        </div>
        <div style={{marginBottom:'12px'}}>
          <label style={{display:'block',fontSize:'13px',color:'#666',marginBottom:'4px'}}>Pet Age *</label>
          <input type="number" name="age" value={formData.age} onChange={handleChange} min="0" required
            style={{width:'100%',padding:'10px 12px',border:'1px solid #e0e0e0',borderRadius:'8px',fontSize:'14px'}} />
        </div>
        <div style={{marginBottom:'12px'}}>
          <label style={{display:'block',fontSize:'13px',color:'#666',marginBottom:'4px'}}>Location *</label>
          <input type="text" name="location" value={formData.location} onChange={handleChange} required
            style={{width:'100%',padding:'10px 12px',border:'1px solid #e0e0e0',borderRadius:'8px',fontSize:'14px'}} />
        </div>
        <div style={{marginBottom:'12px'}}>
          <label style={{display:'block',fontSize:'13px',color:'#666',marginBottom:'4px'}}>Breed</label>
          <input type="text" name="breed" value={formData.breed} onChange={handleChange}
            style={{width:'100%',padding:'10px 12px',border:'1px solid #e0e0e0',borderRadius:'8px',fontSize:'14px'}} />
        </div>
        <div style={{marginBottom:'12px'}}>
          <label style={{display:'block',fontSize:'13px',color:'#666',marginBottom:'4px'}}>Type *</label>
          <select name="type" value={formData.type} onChange={handleChange} required
            style={{width:'100%',padding:'10px 12px',border:'1px solid #e0e0e0',borderRadius:'8px',fontSize:'14px'}}>
            <option value="Dog">Dog</option>
            <option value="Cat">Cat</option>
            <option value="Rabbit">Rabbit</option>
            <option value="Bird">Bird</option>
            <option value="Fish">Fish</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div style={{marginBottom:'16px'}}>
          <label style={{display:'block',fontSize:'13px',color:'#666',marginBottom:'4px'}}>Change Picture (leave empty to keep current)</label>
          <input type="file" accept="image/*" onChange={handleFileChange} style={{fontSize:'13px'}} />
          {pet.imageUrl && (
            <div style={{marginTop:'8px'}}>
              <img src={pet.imageUrl.startsWith('http') ? pet.imageUrl : `/storage/${pet.imageUrl.replace('storage/', '')}`} alt={pet.name} style={{width:'80px',height:'80px',objectFit:'cover',borderRadius:'8px'}} />
            </div>
          )}
        </div>
        <button type="submit" disabled={isSubmitting}
          style={{width:'100%',padding:'12px',background:'var(--paw-primary)',color:'white',border:'none',borderRadius:'8px',fontSize:'14px',fontWeight:'600',cursor:'pointer'}}>
          {isSubmitting ? 'Updating...' : 'Update Pet'}
        </button>
      </form>
    </div>
  );
};

export default AdminPetDashboard;

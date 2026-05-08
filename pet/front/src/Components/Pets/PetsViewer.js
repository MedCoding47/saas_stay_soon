import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdoptForm from '../AdoptForm/AdoptForm';
import { formatDistanceToNow } from 'date-fns';
import './PetsViewer.css';

const PetsViewer = ({ pets }) => {
  const [showPopup, setShowPopup] = useState(null);
  const navigate = useNavigate();

  const togglePopup = (petId) => {
    setShowPopup(showPopup === petId ? null : petId);
  };

  const formatTimeAgo = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "recently";
    }
  };

  const getImageUrl = (pet) => {
    if (!pet.image) return '';
    if (pet.image.startsWith('http')) return pet.image;
    return `${pet.imageUrl || '/placeholder-pet.png'}`;
  };

  const handleDetailsClick = (petId) => {
    navigate(`/pets/${petId}`);
  };

  if (!Array.isArray(pets)) {
    return <p>Loading pets...</p>;
  }

  return (
    <div className="pets-container">
      {pets.map((pet) => (
        <div className="pet-view-card" key={pet.id}>
          <div className="pet-card-pic">
            <img
              src={getImageUrl(pet)}
              alt={pet.name}
              onError={(e) => {
                console.error("Image loading error:", e.target.src);
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
            />
          </div>

          <div className="pet-card-details">
            <h2>{pet.name}</h2>
            <p><b>Type:</b> {pet.type}</p>
            <p><b>Age:</b> {pet.age}</p>
            <p><b>Location:</b> {pet.location}</p>
            <p>Updated {formatTimeAgo(pet.updatedAt)}</p>
          </div>

          <div className="details-btn">
            <button onClick={() => handleDetailsClick(pet.id)}>
              Details <i className="fa fa-info-circle"></i>
            </button>
          </div>

          {showPopup === pet.id && (
            <div className='popup-overlay'>
              <div className='popup-content'>
                <AdoptForm closeForm={() => togglePopup(null)} pet={pet} />
                <button
                  onClick={() => togglePopup(null)}
                  className='close-btn'
                  aria-label="Close adoption form"
                >
                  <i className="fa fa-times"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PetsViewer;
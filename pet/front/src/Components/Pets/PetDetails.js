import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdoptForm from '../AdoptForm/AdoptForm';
import './PetDetails.css';

const PetDetails = ({ pets }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  const pet = pets.find(p => p.id === id);

  if (!pet) {
    return <div className="pet-not-found">Animal non trouvé</div>;
  }

  return (
    <div className="pet-details-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        &larr; Retour à la liste
      </button>
      
      <div className="pet-card">
        <div className="pet-info">
          {/* Header */}
          <div className="pet-header">
            <h1>{pet.name.toUpperCase()}</h1>
          </div>

          {/* Nom */}
          <div className="info-group">
            <h2 className="info-label">NOM</h2>
            <p className="info-value">{pet.name}</p>
          </div>

          {/* Type */}
          <div className="info-group">
            <h2 className="info-label">TYPE</h2>
            <p className="info-value">{pet.type}</p>
          </div>

          {/* Age */}
          <div className="info-group">
            <h2 className="info-label">ÂGE</h2>
            <p className="info-value">{pet.age} ans</p>
          </div>

          {/* Localisation */}
          <div className="info-group">
            <h2 className="info-label">LOCALISATION</h2>
            <p className="info-value">{pet.location}</p>
          </div>

          {/* Bouton */}
          <button 
            className="interest-button"
            onClick={() => setShowForm(true)}
          >
            Show Interest
          </button>
        </div>

        <div className="pet-image-container">
          <img src={pet.image} alt={pet.name} className="pet-image" />
        </div>
      </div>

      {showForm && (
        <div className='popup-overlay'>
          <div className='popup-content'>
            <AdoptForm closeForm={() => setShowForm(false)} pet={pet} />
            <button
              onClick={() => setShowForm(false)}
              className='close-btn'
              aria-label="Fermer le formulaire"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PetDetails;
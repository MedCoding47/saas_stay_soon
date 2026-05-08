import React, { useState } from "react";
import api from '../../config/api';

function AdoptForm(props) {
  const [formData, setFormData] = useState({
    email: "",
    phoneNo: "",
    livingSituation: "",
    previousExperience: "",
    familyComposition: "",
    adoption_reason: ""
  });
  const [formError, setFormError] = useState(false);
  const [errMessage, setErrMessage] = useState("");
  const [succPopup, setSuccPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(false);
    setErrMessage("");
  
    const token = localStorage.getItem('pawfinds-token');
  
    if (!token) {
      setFormError(true);
      setErrMessage("Vous devez être connecté pour soumettre ce formulaire.");
      return;
    }
  
    if (!formData.email || !formData.phoneNo || !formData.adoption_reason) {
      setFormError(true);
      setErrMessage("Veuillez remplir tous les champs obligatoires.");
      return;
    }
  
    try {
      setIsSubmitting(true);
  
      const response = await api.post("/adoptions", {
        pet_id: props.pet.id,
        ...formData
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
  
      if (response.status === 201) {
        setSuccPopup(true);
        setFormData({
          email: "",
          phoneNo: "",
          livingSituation: "",
          previousExperience: "",
          familyComposition: "",
          adoption_reason: ""
        });
      }
    } catch (err) {
      setFormError(true);
      if (err.response && err.response.status === 403) {
        setErrMessage("Vous avez déjà soumis une demande d'adoption. Une seule demande est autorisée.");
      } else if (err.response) {
        setErrMessage(err.response.data.message || "Erreur lors de la soumission du formulaire.");
      } else {
        setErrMessage("Impossible de se connecter au serveur.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  

  return (
    <div className="adopt-form-container">
      <h2 className="form-title">Formulaire d'Adoption</h2>
      <div className="form-pet-wrapper">
        <div className="pet-details-card">
          <div className="pet-image-container">
            <img src={`//storage/${props.pet.image}`} alt={props.pet.name} className="pet-image" />
          </div>
          <div className="pet-info-container">
            <h2 className="pet-name">{props.pet.name}</h2>
            <p className="pet-attribute"><span className="attribute-label">Type:</span> {props.pet.type}</p>
            <p className="pet-attribute"><span className="attribute-label">Âge:</span> {props.pet.age}</p>
            <p className="pet-attribute"><span className="attribute-label">Localisation:</span> {props.pet.area}</p>
          </div>
        </div>

        <div className="form-container">
          {formError && <div className="error-banner"> <p style={{ color: 'red' }}>{errMessage}</p></div>}

          <form onSubmit={handleSubmit} className="adoption-form">
            <div className="form-group">
              <label>Email: *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input" required />
            </div>
            <div className="form-group">
              <label>Numéro de téléphone: *</label>
              <input type="tel" name="phoneNo" value={formData.phoneNo} onChange={handleChange} className="form-input" required />
            </div>
            <div className="form-group">
              <label>Situation de logement:</label>
              <input type="text" name="livingSituation" value={formData.livingSituation} onChange={handleChange} className="form-input" />
            </div>
            <div className="form-group">
              <label>Expérience avec les animaux:</label>
              <input type="text" name="previousExperience" value={formData.previousExperience} onChange={handleChange} className="form-input" />
            </div>
            <div className="form-group">
              <label>Autres animaux:</label>
              <input type="text" name="familyComposition" value={formData.familyComposition} onChange={handleChange} className="form-input" />
            </div>
            <div className="form-group">
              <label>Raison d'adoption: *</label>
              <textarea name="adoption_reason" value={formData.adoption_reason} onChange={handleChange} className="form-textarea" rows="4" required />
            </div>

            <p className="required-fields-note">* Champs obligatoires</p>
            <button disabled={isSubmitting} type="submit" className="submit-button">
              {isSubmitting ? 'Soumission en cours...' : 'Soumettre'}
            </button>
          </form>
        </div>
      </div>

      {succPopup && (
        <div className="modal-overlay">
          <div className="modal-content success">
            <h4>Demande envoyée !</h4>
            <p>Votre demande d'adoption pour {props.pet.name} a été soumise avec succès. Nous vous contacterons bientôt.</p>
            <button onClick={() => {
              setSuccPopup(false);
              props.closeForm && props.closeForm();
            }} className="modal-close-button">
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdoptForm;

import React, { useState } from "react";
import api from '../../config/api';
import './PostPetSection.css';

const PostPetSection = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    location: "",
    type: "Dog",
    breed: "",
    picture: null
  });
  const [fileName, setFileName] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFormData({...formData, picture: selectedFile});
      setFileName(selectedFile.name);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({...formData, [name]: value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSuccessMessage("");

    // Validate form fields
    if (!formData.name || !formData.age || !formData.location || formData.type === "None" || !formData.picture) {
      setFormError("Please fill out all required fields.");
      return;
    }

    setIsSubmitting(true);

    const data = new FormData();
    data.append("name", formData.name);
    data.append("age", formData.age);
    data.append("location", formData.location);
    data.append("type", formData.type);
    data.append("picture", formData.picture);
    if (formData.breed) data.append("breed", formData.breed);

    try {
      const token = localStorage.getItem('pawfinds-token');
      const response = await api.post("/pets", data, {
          headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status !== 201) {
        throw new Error("Failed to submit form");
      }

      // Reset form
      setFormData({
        name: "",
        age: "",
        location: "",
        type: "Dog",
        breed: "",
        picture: null
      });
      setFileName("");
      setSuccessMessage("Pet posted successfully!");
      
      // Call onSuccess callback if provided
      if (onSuccess && typeof onSuccess === 'function') {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setFormError(error.response?.data?.message || "Failed to post pet. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="post-pet-container">
      <h2 className="section-title">Add New Pet</h2>

      {formError && <div className="alert error">{formError}</div>}
      {successMessage && <div className="alert success">{successMessage}</div>}

      <form onSubmit={handleSubmit} className="pet-form">
        <div className="form-group">
          <label>Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label>Pet Age *</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            min="0"
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label>Location *</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label>Breed</label>
          <input
            type="text"
            name="breed"
            value={formData.breed}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Type *</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="form-select"
            required
          >
            <option value="Dog">Dog</option>
            <option value="Cat">Cat</option>
            <option value="Rabbit">Rabbit</option>
            <option value="Bird">Bird</option>
            <option value="Fish">Fish</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Picture *</label>
          <div className="file-input-container">
            <label className="file-input-label">
              <span className="file-input-text">
                {fileName || "Choose a Picture"}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="file-input-hidden"
                required
              />
            </label>
          </div>
        </div>

        <button 
          type="submit" 
          className="submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner"></span> Submitting...
            </>
          ) : (
            "Add Pet"
          )}
        </button>
      </form>
    </div>
  );
};

export default PostPetSection;
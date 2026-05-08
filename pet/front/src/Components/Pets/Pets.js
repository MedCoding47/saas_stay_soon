import React, { useEffect, useState } from "react";
import PetsViewer from "./PetsViewer";
import api from '../../config/api';
import './Pets.css';

const Pets = () => {
  const [filter, setFilter] = useState("all");
  const [petsData, setPetsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPets = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get("/pets");
        
        if (response.status !== 200) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        if (!response.data || !Array.isArray(response.data)) {
          throw new Error("Invalid data format received");
        }

        const validatedPets = response.data.map(pet => ({
          id: pet.id || Math.random().toString(36).substr(2, 9),
          name: pet.name || "Unnamed Pet",
          type: pet.type || "Unknown",
          age: pet.age || "Unknown",
          area: pet.area || pet.location || "Unknown",
          image: pet.image || null,
          updated_at: pet.updated_at || new Date().toISOString()
        }));

        setPetsData(validatedPets);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message || "Failed to load pets");
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, []);

  const filteredPets = petsData.filter(pet => 
    filter === "all" || pet.type.toLowerCase() === filter.toLowerCase()
  );

  return (
    <div className="pets-page">
      <div className="filter-selection">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          aria-label="Filter pets by type"
        >
          <option value="all">All Pets</option>
          <option value="Dog">Dogs</option>
          <option value="Cat">Cats</option>
          <option value="Rabbit">Rabbits</option>
          <option value="Bird">Birds</option>
          <option value="Fish">Fish</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}

      <div className="pet-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading pets...</p>
          </div>
        ) : filteredPets.length > 0 ? (
          filteredPets.map(pet => (
            <PetsViewer pet={pet} key={pet.id} />
          ))
        ) : (
          <div className="no-pets-message">
            <p>No pets available matching your criteria</p>
            {filter !== "all" && (
              <button onClick={() => setFilter("all")}>
                Show all pets
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Pets;
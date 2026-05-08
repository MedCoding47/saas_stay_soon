import React, { useState, useEffect } from 'react';
import api from '../../config/api'; // Import the Axios instance
import AdoptedCards from './AdoptedCards';

const AdoptedHistory = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdoptedPets = async () => {
    try {
      const response = await api.get('/adoptions?status=Completed&pageNumber=1&pageSize=50');
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching adopted pets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdoptedPets();
  }, []);

  return (
    <div className='pet-container'>
      {loading ? (
        <p>Loading...</p>
      ) : requests.length > 0 ? (
        requests.map((request) => (
          <AdoptedCards
            key={request.id}
            pet={request}
            updateCards={fetchAdoptedPets}
            deleteBtnText="Delete History"
            approveBtn={false}
          />
        ))
      ) : (
        <p>No Adopted Pets available</p>
      )}
    </div>
  );
};

export default AdoptedHistory;
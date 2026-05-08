import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from '../../config/api';

const FeaturedPets = () => {
  const [featuredPets, setFeaturedPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedPets = async () => {
      try {
        const response = await api.get("/pets?limit=3");
        setFeaturedPets(response.data.slice(0, 3));
      } catch (err) {
        console.error("Error fetching featured pets:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedPets();
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '60px 0'
      }}>
        <div className="loading-spinner" style={{
          width: '50px',
          height: '50px',
          border: '5px solid #f3f3f3',
          borderTop: '5px solid #2E8B57',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  return (
    <section style={{
      padding: '80px 20px',
      backgroundColor: '#F8F9FA',
      textAlign: 'center'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h2 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          color: '#2E8B57',
          marginBottom: '40px'
        }}>
          Meet Our Furry Friends Awaiting Adoption
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px',
          marginBottom: '40px'
        }}>
          {featuredPets.map(pet => (
            <div key={pet.id} style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease',
              ':hover': {
                transform: 'translateY(-5px)'
              }
            }}>
              <div style={{
                height: '250px',
                overflow: 'hidden'
              }}>
                {pet.image && (
                  <img 
                    src={pet.image.startsWith('http') ? pet.image : `//storage/${pet.image}`}
                    alt={pet.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.5s ease'
                    }}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x200?text=Pet+Image';
                    }}
                  />
                )}
              </div>
              
              <div style={{
                padding: '20px',
                textAlign: 'left'
              }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  marginBottom: '10px',
                  color: '#333'
                }}>
                  {pet.name}
                </h3>
                
                <div style={{
                  display: 'flex',
                  gap: '15px',
                  marginBottom: '15px'
                }}>
                  <span style={{
                    backgroundColor: '#E1EEBC',
                    color: '#333',
                    padding: '5px 10px',
                    borderRadius: '20px',
                    fontSize: '0.9rem'
                  }}>
                    {pet.type}
                  </span>
                  <span style={{
                    backgroundColor: '#FFD700',
                    color: '#333',
                    padding: '5px 10px',
                    borderRadius: '20px',
                    fontSize: '0.9rem'
                  }}>
                    {pet.age} years
                  </span>
                </div>
                
                <Link 
                  to={`/pets/${pet.id}`}
                  style={{
                    display: 'inline-block',
                    padding: '10px 20px',
                    backgroundColor: '#2E8B57',
                    color: 'white',
                    borderRadius: '5px',
                    textDecoration: 'none',
                    fontWeight: '500',
                    transition: 'background-color 0.3s',
                    ':hover': {
                      backgroundColor: '#1E6B47'
                    }
                  }}
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        <Link 
          to="/pets"
          style={{
            display: 'inline-block',
            padding: '15px 35px',
            backgroundColor: '#FF6347',
            color: 'white',
            borderRadius: '50px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '1.1rem',
            transition: 'background-color 0.3s',
            marginTop: '20px',
            ':hover': {
              backgroundColor: '#E5533D'
            }
          }}
        >
          See All Pets
        </Link>
      </div>
    </section>
  );
};

export default FeaturedPets;
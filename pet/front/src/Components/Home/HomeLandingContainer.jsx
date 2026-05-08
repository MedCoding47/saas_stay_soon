import React from "react";
import { Link } from "react-router-dom";
import heroImage from "./images/5.jpg";

const HomeLandingContainer = () => {
  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '80vh',
      width: '100%'
    }}>
      {/* Left Section */}
      <div style={{
        flex: 1,
        backgroundColor: '#2E8B57', // Rich green color
        padding: '80px 60px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        color: 'white'
      }}>
        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: '700',
          lineHeight: '1.2',
          marginBottom: '20px',
          fontFamily: '"Arial", sans-serif'
        }}>
          Embrace Endless Love<br />
          with Your New Furry<br />
          Best Friend.
        </h1>
        
        <p style={{
          fontSize: '1.2rem',
          marginBottom: '30px',
          maxWidth: '500px',
          lineHeight: '1.6'
        }}>
          Embrace endless love with your new furry best friend.<br />
          Accept never and start creating unforgettable memories together.
        </p>

        <div style={{ marginBottom: '40px' }}>
          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: '600',
            marginBottom: '20px'
          }}>
            Find Your New Best Friend
          </h2>
          
          <div style={{
            display: 'flex',
            gap: '10px',
            maxWidth: '500px'
          }}>
            <select style={{
              flex: 1,
              padding: '12px 15px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '1rem',
              backgroundColor: '#F8F8F8',
              color: '#333'
            }}>
              <option>Select Animal Type</option>
              <option>Dog</option>
              <option>Cat</option>
              <option>Rabbit</option>
              <option>Bird</option>
              <option>Other</option>
            </select>
            
            <button style={{
              padding: '12px 25px',
              borderRadius: '8px',
              backgroundColor: '#3D90D7', // Gold color
              color: '#333',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#FFC000'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#FFD700'}
            >
              Search
            </button>
          </div>
        </div>

        <Link 
          to="/pets" 
          style={{
            display: 'inline-block',
            padding: '15px 35px',
            fontSize: '1.1rem',
            fontWeight: '600',
            borderRadius: '50px',
            backgroundColor: '#3D90D7', // Tomato color
            color: 'white',
            textDecoration: 'none',
            transition: 'all 0.3s',
            textAlign: 'center',
            maxWidth: '300px',
            border: 'none'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#3D90D7'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#3D90D7'}
          onClick={scrollToTop}
        >
          Browse All Pets
        </Link>
      </div>

      {/* Right Image Section */}
      <div style={{
        flex: 1,
        backgroundImage: `url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '500px'
      }}></div>
    </div>
  );
};

export default HomeLandingContainer;
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./navbar.css";
import { useClientAuth } from "../ClientPanel/ClientAuthContext";

const Navbar = (props) => {
  const { isAuthenticated, client, logout } = useClientAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef(null);

  // Handle scroll event to add background on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Clean up event listener
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleUserDropdown = () => {
    setUserDropdownOpen(!userDropdownOpen);
  };

  return (
    <>
      <nav className={`navbar-main ${isScrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          <div className="logo-section">
            <Link to="/" className="logo-container">
              <h1 className="logo-text">Adopt<span className="logo-accent">one.</span></h1>
            </Link>
            <button className="menu-toggle" onClick={toggleMobileMenu}>
              <span className={`menu-icon ${mobileMenuOpen ? 'open' : ''}`}></span>
            </button>
          </div>

          <div className={`navbar-menu ${mobileMenuOpen ? 'open' : ''}`}>
            <ul className="navbar-links">
              <li><Link to="/">Accueil</Link></li>
              <li><Link to="/about">À propos</Link></li>
              <li><Link to="/pets">Animaux</Link></li>
              <li><Link to="/services">Nos refuges</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div className="navbar-actions">
           
            
            <div className="auth-section">
              {!isAuthenticated ? (
                <Link to="/connexion">
                  <button className="btn-auth">Connexion</button>
                </Link>
              ) : (
                <div className="user-menu" ref={dropdownRef}>
                  <button className="btn-user" onClick={toggleUserDropdown}>
                    <span className="user-greeting">Bonjour, {client?.name}</span>
                    <i className={`fa fa-chevron-${userDropdownOpen ? 'up' : 'down'}`}></i>
                  </button>
                  {userDropdownOpen && (
                    <div className="dropdown-menu">
                      <Link to="/client/dashboard" className="dropdown-item">
                        <i className="fa fa-user dropdown-icon"></i>
                        Mon compte
                      </Link>
                      <Link to="/client/favorites" className="dropdown-item">
                        <i className="fa fa-heart dropdown-icon"></i>
                        Mes favoris
                      </Link>
                      <Link to="/client/applications" className="dropdown-item">
                        <i className="fa fa-file-text dropdown-icon"></i>
                        Mes demandes
                      </Link>
                      <button onClick={logout} className="dropdown-item logout-item">
                        <i className="fa fa-sign-out dropdown-icon"></i>
                        Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

           
          </div>
        </div>
      </nav>
      <div className="navbar-spacer"></div>
    </>
  );
};

export default Navbar;
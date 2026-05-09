import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSignOutAlt,
  faUsers,
  faPaw,
  faClipboardList,
  faHistory,
  faPlus,
  faTachometerAlt,
  faBars
} from '@fortawesome/free-solid-svg-icons';
import './AdminNavBar.css';

const AdminNavBar = ({ setCurrentScreen }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('pawfinds-token');
    navigate('/auth/login');
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <nav className="admin-sidebar" aria-label="Admin navigation">
      <div className="sidebar-header">
        <button className="hamburger" onClick={toggleMenu} aria-label="Toggle navigation menu">
          <FontAwesomeIcon icon={faBars} />
        </button>
        <h2 className="logo-text">🐾 PawFinds</h2>
        <button className="add-pet-btn" onClick={() => setCurrentScreen('postPet')} aria-label="Add new pet">
          + Add Pet
        </button>
      </div>
      <ul className={menuOpen ? "nav-menu open" : "nav-menu closed"}>
        <li className="nav-item">
          <button onClick={() => setCurrentScreen('dashboard')} aria-label="Dashboard">
            <FontAwesomeIcon icon={faTachometerAlt} />
            <span>Dashboard</span>
          </button>
        </li>
        <li className="nav-item">
          <button onClick={() => setCurrentScreen('approvedRequests')} aria-label="Approved Pets">
            <FontAwesomeIcon icon={faPaw} />
            <span>Approved Pets</span>
          </button>
        </li>
        <li className="nav-item">
          <button onClick={() => setCurrentScreen('adoptingPet')} aria-label="Adoption Requests">
            <FontAwesomeIcon icon={faClipboardList} />
            <span>Adoption Requests</span>
          </button>
        </li>
        <li className="nav-item">
          <button onClick={() => setCurrentScreen('adoptedHistory')} aria-label="Adopted History">
            <FontAwesomeIcon icon={faHistory} />
            <span>Adopted History</span>
          </button>
        </li>
        <li className="nav-item">
          <button onClick={() => setCurrentScreen('ListerUtilisateurs')} aria-label="User Management">
            <FontAwesomeIcon icon={faUsers} />
            <span>Users</span>
          </button>
        </li>
        <li className="nav-item">
          <button onClick={() => setCurrentScreen('AdminPetDashboard')} aria-label="Pet Management">
            <span>Pet Management</span>
          </button>
        </li>
        <li className="nav-item">
          <button onClick={() => setCurrentScreen('AdminAdoptionList')} aria-label="Adoption List">
            <span>Adoption List</span>
          </button>
        </li>
      </ul>
      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn" aria-label="Log out">
          <FontAwesomeIcon icon={faSignOutAlt} /> Logout
        </button>
      </div>
    </nav>
  );
};

export default AdminNavBar;
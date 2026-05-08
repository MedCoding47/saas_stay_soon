import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSignOutAlt, 
  faUsers, 
  faPaw, 
  faClipboardList, 
  faHistory, 
  faPlus,
  faTachometerAlt
} from '@fortawesome/free-solid-svg-icons';

const AdminNavBar = ({ setCurrentScreen }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('pawfinds-token');
    navigate('/auth/login');
  };

  return (
    <div className="sidebar">
      <div className="logo">
        <h2><span>Pet</span>Admin</h2>
      </div>
      <ul className="nav-menu">
        <li className="nav-item">
          <button onClick={() => setCurrentScreen('dashboard')}>
            <FontAwesomeIcon icon={faTachometerAlt} />
            <span>Dashboard</span>
          </button>
        </li>
        <li className="nav-item">
          <button onClick={() => setCurrentScreen('approvedRequests')}>
            <FontAwesomeIcon icon={faPaw} />
            <span>Approved Pets</span>
          </button>
        </li>
        <li className="nav-item">
          <button onClick={() => setCurrentScreen('adoptingPet')}>
            <FontAwesomeIcon icon={faClipboardList} />
            <span>Adoption Requests</span>
          </button>
        </li>
        <li className="nav-item">
          <button onClick={() => setCurrentScreen('adoptedHistory')}>
            <FontAwesomeIcon icon={faHistory} />
            <span>Adopted History</span>
          </button>
        </li>
        <li className="nav-item">
          <button onClick={() => setCurrentScreen('postPet')}>
            <FontAwesomeIcon icon={faPlus} />
            <span>Post a Pet</span>
          </button>
        </li>
        <li className="nav-item">
          <button onClick={() => setCurrentScreen('ListerUtilisateurs')}>
            <FontAwesomeIcon icon={faUsers} />
            <span>Users</span>
          </button>
        </li>
        <li className="nav-item">
          <button onClick={() => setCurrentScreen('AdminPetDashboard')}>
           <span>pet management</span>
          </button>
        </li>
        <li className="nav-item">
          <button onClick={() => setCurrentScreen('AdminAdoptionList')}>
           <span>AdminAdoptionList</span>
          </button>
        </li>
      </ul>
      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn">
          <FontAwesomeIcon icon={faSignOutAlt} /> Logout
        </button>
      </div>
    </div>
  );
};

export default AdminNavBar;
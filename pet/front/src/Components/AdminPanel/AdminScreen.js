import React from 'react';
import PostingPets from './PostingPets';
import AdoptingRequests from './AdoptingRequests';
import AdoptedHistory from './AdoptedHistory';
import ApprovedRequests from './ApprovedRequests';
import ListerUtilisateurs from './UserManagement';
import AdminPetDashboard from './AdminPetDashboard';
import AdminAdoptionList from './AdminAdoptionList';
import Dashboard from './Dashboard';
import './AdminScreen.css';

const AdminScreen = ({ currentScreen }) => {
  return (
    <div className="admin-screen">
      {currentScreen === 'dashboard' && <Dashboard />}
      {currentScreen === 'postPet' && <PostingPets />}
      {currentScreen === 'approvedRequests' && <ApprovedRequests />}
      {currentScreen === 'adoptingPet' && <AdoptingRequests />}
      {currentScreen === 'adoptedHistory' && <AdoptedHistory />}
      {currentScreen === 'ListerUtilisateurs' && <ListerUtilisateurs />}
      {currentScreen === 'AdminPetDashboard' && <AdminPetDashboard />}
      {currentScreen === 'AdminAdoptionList' && <AdminAdoptionList />}
    </div>
  );
};

export default AdminScreen;
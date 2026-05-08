import React, { useState } from 'react';
import AdminNavBar from "./AdminNavBar";
import AdminScreen from './AdminScreen';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus } from '@fortawesome/free-solid-svg-icons';
import './AdminPanel.css';

const AdminPanel = () => {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const adminRole = localStorage.getItem('pawfinds-role') || 'Admin';

  return (
    <div style={{minHeight:'100vh',background:'var(--paw-primary-light)',display:'flex',flexDirection:'column'}}>
      {/* Top Navbar */}
      <div style={{background:'white',padding:'12px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',boxShadow:'0 2px 8px rgba(0,0,0,0.08)',position:'sticky',top:0,zIndex:100}}>
        {/* Logo */}
        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
          <span style={{fontSize:'24px'}}>🐾</span>
          <span style={{fontSize:'20px',fontWeight:'700',color:'var(--paw-primary)',letterSpacing:'-0.5px'}}>PawFinds</span>
        </div>

        {/* Search Bar */}
        <div style={{flex:1,maxWidth:'400px',margin:'0 24px',position:'relative'}}>
          <FontAwesomeIcon icon={faSearch} style={{position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',color:'#999'}} />
          <input
            type="text"
            placeholder="Search..."
            style={{width:'100%',padding:'8px 12px 8px 36px',border:'1px solid #e0e0e0',borderRadius:'20px',fontSize:'13px',background:'#f8f9fa'}}
          />
        </div>

        {/* Right Side - Add Pet Button + User */}
        <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
          <button
            onClick={() => setCurrentScreen('postPet')}
            style={{background:'var(--paw-primary)',color:'white',border:'none',padding:'8px 16px',borderRadius:'20px',fontSize:'13px',fontWeight:'600',cursor:'pointer',display:'flex',alignItems:'center',gap:'6px',transition:'all 0.2s'}}
          >
            <FontAwesomeIcon icon={faPlus} /> Add Pet
          </button>

          <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
            <div style={{width:'32px',height:'32px',borderRadius:'50%',background:'var(--paw-primary)',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px',fontWeight:'600'}}>
              {adminRole.charAt(0).toUpperCase()}
            </div>
            <span style={{fontSize:'13px',fontWeight:'500',color:'#333'}}>{adminRole}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{flex:1,padding:'24px',overflowY:'auto'}}>
        <AdminScreen currentScreen={currentScreen} />
      </div>
    </div>
  );
};

export default AdminPanel;

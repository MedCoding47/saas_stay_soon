import React, { useState, useEffect, useRef } from 'react';
import api from '../../config/api';
import Notifications from '../msg/Notifications';
import Messaging from '../msg/Messaging';

function ClientDashboard() {
  const [clientInfo, setClientInfo] = useState(null);
  const [adoptionRequests, setAdoptionRequests] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: ''
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessaging, setShowMessaging] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const userName = clientInfo?.name || localStorage.getItem('pawfinds-role') || 'Client';
  const userRole = localStorage.getItem('pawfinds-role') || 'Adopter';

  // Fetch client information
  useEffect(() => {
    const fetchClientInfo = async () => {
      const token = localStorage.getItem('pawfinds-token');
      if (!token) {
        setError("Vous devez être connecté pour voir vos informations.");
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        setClientInfo(res.data);
        setFormData({
          name: res.data.name || '', email: res.data.email || '', password: '', confirmPassword: ''
        });
        if (!localStorage.getItem('pawfinds-userId')) {
          localStorage.setItem('pawfinds-userId', res.data.id);
        }
      } catch (err) {
        setError("Erreur lors du chargement de vos informations.");
        console.error("API Error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchClientInfo();
  }, []);

  // Fetch adoption requests
  useEffect(() => {
    const fetchAdoptions = async () => {
      const token = localStorage.getItem('pawfinds-token');
      if (!token) return;

      try {
        const res = await api.get("/adoptions?pageNumber=1&pageSize=50");
        setAdoptionRequests(res.data.requests || []);
      } catch (err) {
        console.error("Erreur API:", err);
      }
    };

    if (activeTab === 'my-requests') {
      fetchAdoptions();
    }
  }, [activeTab]);

  // Check for unread notifications
  useEffect(() => {
    const checkUnreadNotifications = async () => {
      const token = localStorage.getItem('pawfinds-token');
      if (!token) return;

      try {
        const res = await api.get('/notifications?pageNumber=1&pageSize=50');
        setUnreadCount(res.data.length);
      } catch (err) {
        console.error("Erreur API:", err);
      }
    };

    checkUnreadNotifications();
    const interval = setInterval(checkUnreadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    const userId = localStorage.getItem('pawfinds-userId');

    try {
      const dataToSend = {
        name: formData.name,
        email: formData.email,
        ...(formData.password && { password: formData.password })
      };

      await api.put(`/organizations/users/${userId}`, dataToSend);

      setSuccessMessage("Profil mis à jour avec succès!");
      setIsEditing(false);

      setClientInfo({
        ...clientInfo,
        name: formData.name,
        email: formData.email
      });

      setFormData({
        ...formData,
        password: '',
        confirmPassword: ''
      });

      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || "Erreur lors de la mise à jour du profil.");
      } else {
        setError("Erreur lors de la mise à jour du profil.");
      }
      console.error("Erreur API:", err);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) {
      const userId = localStorage.getItem('pawfinds-userId');

      try {
        await api.delete(`/organizations/users/${userId}`);
        localStorage.removeItem('pawfinds-token');
        localStorage.removeItem('pawfinds-userId');
        window.location.href = '/';
      } catch (err) {
        setError("Erreur lors de la suppression du compte.");
        console.error("Erreur API:", err);
      }
    }
  };

  const renderContent = () => {
    if (activeTab === 'overview') {
      return (
        <div style={{padding:'24px'}}>
          <h2 style={{fontSize:'20px',fontWeight:'600',color:'#333',marginBottom:'16px'}}>Overview</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3, 1fr)',gap:'16px',marginBottom:'24px'}}>
            <div style={{background:'white',padding:'20px',borderRadius:'12px',boxShadow:'0 2px 8px rgba(0,0,0,0.08)'}}>
              <div style={{fontSize:'13px',color:'#666',marginBottom:'8px'}}>My Requests</div>
              <div style={{fontSize:'28px',fontWeight:'700',color:'var(--paw-primary)'}}>{adoptionRequests.length}</div>
            </div>
            <div style={{background:'white',padding:'20px',borderRadius:'12px',boxShadow:'0 2px 8px rgba(0,0,0,0.08)'}}>
              <div style={{fontSize:'13px',color:'#666',marginBottom:'8px'}}>Approved</div>
              <div style={{fontSize:'28px',fontWeight:'700',color:'var(--paw-accent)'}}>
                {adoptionRequests.filter(r => r.status === 'approved').length}
              </div>
            </div>
            <div style={{background:'white',padding:'20px',borderRadius:'12px',boxShadow:'0 2px 8px rgba(0,0,0,0.08)'}}>
              <div style={{fontSize:'13px',color:'#666',marginBottom:'8px'}}>Pending</div>
              <div style={{fontSize:'28px',fontWeight:'700',color:'var(--paw-amber)'}}>
                {adoptionRequests.filter(r => r.status === 'pending').length}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'my-requests') {
      return (
        <div style={{padding:'24px'}}>
          <h2 style={{fontSize:'20px',fontWeight:'600',color:'#333',marginBottom:'16px'}}>My Adoption Requests</h2>
          {adoptionRequests.length === 0 ? (
            <div style={{padding:'30px',textAlign:'center',color:'#999'}}>You haven't submitted any adoption requests yet.</div>
          ) : (
            <div>
              {adoptionRequests.map((request) => (
                <div key={request.id} style={{background:'#f9f9f9',padding:'16px',borderRadius:'8px',borderLeft:'4px solid var(--paw-primary)',marginBottom:'12px'}}>
                  <div style={{fontWeight:'600',fontSize:'14px',color:'#333',marginBottom:'8px'}}>🐾 {request.pet?.name || "Unknown pet"}</div>
                  <div style={{display:'flex',gap:'16px',fontSize:'12px',color:'#666'}}>
                    <span>Status: <strong style={{color: request.status === 'approved' ? 'var(--paw-accent)' : request.status === 'rejected' ? 'var(--paw-warning)' : 'var(--paw-amber)'}}>{request.status}</strong></span>
                    <span>Date: {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  {request.adminResponse && (
                    <div style={{marginTop:'8px',padding:'8px',background:'#E1F5EE',borderRadius:'4px',fontSize:'12px'}}>
                      <strong>Admin response:</strong> {request.adminResponse}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (activeTab === 'settings') {
      return (
        <div style={{padding:'24px'}}>
          <h2 style={{fontSize:'20px',fontWeight:'600',color:'#333',marginBottom:'16px'}}>Settings</h2>
          {isEditing ? (
            <form onSubmit={handleUpdateProfile} style={{background:'white',padding:'24px',borderRadius:'12px'}}>
              <div style={{marginBottom:'16px'}}>
                <label style={{display:'block',fontSize:'13px',color:'#666',marginBottom:'6px'}}>Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required
                  style={{width:'100%',padding:'10px 12px',border:'1px solid #e0e0e0',borderRadius:'8px',fontSize:'14px'}} />
              </div>
              <div style={{marginBottom:'16px'}}>
                <label style={{display:'block',fontSize:'13px',color:'#666',marginBottom:'6px'}}>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required
                  style={{width:'100%',padding:'10px 12px',border:'1px solid #e0e0e0',borderRadius:'8px',fontSize:'14px'}} />
              </div>
              <div style={{marginBottom:'16px'}}>
                <label style={{display:'block',fontSize:'13px',color:'#666',marginBottom:'6px'}}>New Password (leave blank to keep current)</label>
                <input type="password" name="password" value={formData.password} onChange={handleInputChange}
                  style={{width:'100%',padding:'10px 12px',border:'1px solid #e0e0e0',borderRadius:'8px',fontSize:'14px'}} />
              </div>
              <div style={{marginBottom:'16px'}}>
                <label style={{display:'block',fontSize:'13px',color:'#666',marginBottom:'6px'}}>Confirm Password</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange}
                  style={{width:'100%',padding:'10px 12px',border:'1px solid #e0e0e0',borderRadius:'8px',fontSize:'14px'}} />
              </div>
              <div style={{display:'flex',gap:'10px'}}>
                <button type="submit" style={{padding:'10px 20px',background:'var(--paw-primary)',color:'white',border:'none',borderRadius:'8px',cursor:'pointer'}}>Save</button>
                <button type="button" onClick={() => setIsEditing(false)} style={{padding:'10px 20px',background:'#e0e0e0',border:'none',borderRadius:'8px',cursor:'pointer'}}>Cancel</button>
              </div>
            </form>
          ) : (
            <div style={{background:'white',padding:'24px',borderRadius:'12px'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:'12px'}}>
                <span style={{color:'#666',fontSize:'13px'}}>Name:</span>
                <span style={{fontWeight:'500'}}>{clientInfo?.name}</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:'12px'}}>
                <span style={{color:'#666',fontSize:'13px'}}>Email:</span>
                <span style={{fontWeight:'500'}}>{clientInfo?.email}</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:'12px'}}>
                <span style={{color:'#666',fontSize:'13px'}}>Role:</span>
                <span style={{fontWeight:'500'}}>{userRole}</span>
              </div>
              <div style={{display:'flex',gap:'10px',marginTop:'16px'}}>
                <button onClick={() => setIsEditing(true)} style={{padding:'10px 20px',background:'var(--paw-primary)',color:'white',border:'none',borderRadius:'8px',cursor:'pointer'}}>Edit Profile</button>
                <button onClick={handleDeleteAccount} style={{padding:'10px 20px',background:'#f44336',color:'white',border:'none',borderRadius:'8px',cursor:'pointer'}}>Delete Account</button>
              </div>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  if (isLoading) return <div style={{padding:'40px',textAlign:'center',color:'#666'}}>Loading dashboard...</div>;

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'var(--paw-primary-light)'}}>
      {/* Sidebar */}
      <div style={{width:'240px',background:'white',boxShadow:'2px 0 8px rgba(0,0,0,0.05)',display:'flex',flexDirection:'column'}}>
        {/* User Info */}
        <div style={{padding:'24px',borderBottom:'1px solid #f0f0f0',textAlign:'center'}}>
          <div style={{width:'48px',height:'48px',borderRadius:'50%',background:'var(--paw-primary)',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',fontWeight:'600',margin:'0 auto 8px'}}>
            {userName.charAt(0).toUpperCase()}
          </div>
          <div style={{fontWeight:'600',fontSize:'14px',color:'#333'}}>{userName}</div>
          <div style={{fontSize:'11px',color:'var(--paw-primary)',background:'var(--paw-primary-light)',padding:'2px 8px',borderRadius:'12px',display:'inline-block',marginTop:'4px'}}>{userRole}</div>
        </div>

        {/* Nav Items */}
        <nav style={{padding:'16px 0',flex:'1'}}>
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'my-requests', label: 'My Requests', icon: '📋' },
            { id: 'messages', label: 'Messages', icon: '✉️' },
            { id: 'notifications', label: 'Notifications', icon: '🔔' },
            { id: 'settings', label: 'Settings', icon: '⚙️' }
          ].map(item => (
            <div key={item.id}
              onClick={() => {
                if (item.id === 'messages') {
                  setShowMessaging(true);
                } else if (item.id === 'notifications') {
                  setShowNotifications(true);
                } else {
                  setActiveTab(item.id);
                }
              }}
              style={{
                padding:'10px 20px',cursor:'pointer',fontSize:'13px',color: activeTab === item.id ? 'var(--paw-primary)' : '#666',
                background: activeTab === item.id ? 'var(--paw-primary-light)' : 'transparent',
                borderLeft: activeTab === item.id ? '3px solid var(--paw-primary)' : '3px solid transparent',
                fontWeight: activeTab === item.id ? '600' : '400',
                display:'flex',alignItems:'center',gap:'10px'
              }}
            >
              <span>{item.icon}</span> {item.label}
              {item.id === 'notifications' && unreadCount > 0 && (
                <span style={{background:'var(--paw-warning)',color:'white',borderRadius:'50%',fontSize:'10px',padding:'1px 6px',marginLeft:'auto'}}>{unreadCount}</span>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div style={{flex:'1',overflowY:'auto'}}>
        <div style={{padding:'20px',borderBottom:'1px solid #e0e0e0',background:'white'}}>
          <h1 style={{fontSize:'22px',fontWeight:'600',color:'#333'}}>Dashboard</h1>
        </div>
        {renderContent()}
      </div>

      {/* Notifications modal */}
      {showNotifications && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.5)',display:'flex',justifyContent:'center',alignItems:'center',zIndex:1000}}>
          <div style={{background:'white',borderRadius:'8px',maxHeight:'90vh',overflowY:'auto',boxShadow:'0 0 20px rgba(0,0,0,0.2)',width:'400px'}}>
            <Notifications onClose={() => setShowNotifications(false)} />
          </div>
        </div>
      )}

      {/* Messaging modal */}
      {showMessaging && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.5)',display:'flex',justifyContent:'center',alignItems:'center',zIndex:1000}}>
          <div style={{background:'white',borderRadius:'8px',maxHeight:'90vh',overflowY:'auto',boxShadow:'0 0 20px rgba(0,0,0,0.2)',width:'400px'}}>
            <Messaging recipientId={1} recipientName="Administrator" onClose={() => setShowMessaging(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientDashboard;

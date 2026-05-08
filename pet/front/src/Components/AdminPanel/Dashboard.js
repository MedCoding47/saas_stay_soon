import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPets: 0,
    pending: 0,
    adopted: 0,
    activeUsers: 0
  });
  const [recentPets, setRecentPets] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [petsRes, adoptionsRes, usersRes, notifRes] = await Promise.all([
          api.get('/pets?pageNumber=1&pageSize=50'),
          api.get('/adoptions?pageNumber=1&pageSize=50'),
          api.get('/organizations/users?pageNumber=1&pageSize=50'),
          api.get('/notifications?pageNumber=1&pageSize=4')
        ]);

        const pets = petsRes.data.data || petsRes.data || [];
        const adoptions = adoptionsRes.data.requests || adoptionsRes.data || [];
        const users = usersRes.data.data || usersRes.data || [];
        const notifs = notifRes.data.data || notifRes.data || [];

        const pending = adoptions.filter(a => a.status === 'pending').length;
        const adopted = adoptions.filter(a => a.status === 'approved').length;

        setStats({
          totalPets: pets.length,
          pending,
          adopted,
          activeUsers: users.filter(u => u.isActive !== false).length
        });

        setRecentPets(pets.slice(0, 5));
        setActivities(notifs);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { label: 'Total Pets', value: stats.totalPets, color: '#D85A30', bg: '#FAECE7' },
    { label: 'Pending', value: stats.pending, color: '#FAEEDA', bg: '#FFF8E1' },
    { label: 'Adopted', value: stats.adopted, color: '#1D9E75', bg: '#E1F5EE' },
    { label: 'Active Users', value: stats.activeUsers, color: '#D85A30', bg: '#FAECE7' }
  ];

  if (loading) return <div style={{padding:'40px',textAlign:'center',color:'#666'}}>Loading dashboard...</div>;

  return (
    <div style={{padding:'24px',background:'var(--paw-primary-light)',minHeight:'100%'}}>
      {/* Stat Cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4, 1fr)',gap:'16px',marginBottom:'24px'}}>
        {statCards.map((card, i) => (
          <div key={i} style={{background: card.bg,padding:'20px',borderRadius:'12px',boxShadow:'0 2px 8px rgba(0,0,0,0.08)'}}>
            <div style={{fontSize:'13px',color:'#666',marginBottom:'8px',fontWeight:'500'}}>{card.label}</div>
            <div style={{fontSize:'28px',fontWeight:'700',color: card.color}}>{card.value}</div>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px'}}>
        {/* Recent Pets */}
        <div style={{background:'white',borderRadius:'12px',padding:'20px',boxShadow:'0 2px 8px rgba(0,0,0,0.08)'}}>
          <h3 style={{fontSize:'16px',fontWeight:'600',color:'#333',marginBottom:'16px'}}>Recent Pets</h3>
          {recentPets.length === 0 ? (
            <div style={{padding:'20px',textAlign:'center',color:'#999'}}>No pets found</div>
          ) : (
            <div>
              {recentPets.map(pet => (
                <div key={pet.id} style={{display:'flex',alignItems:'center',gap:'12px',padding:'10px 0',borderBottom:'1px solid #f0f0f0'}}>
                  <span style={{fontSize:'24px'}}>🐾</span>
                  <div>
                    <div style={{fontWeight:'500',fontSize:'13px',color:'#333'}}>{pet.name}</div>
                    <div style={{fontSize:'11px',color:'#999'}}>{pet.type} • {pet.age} years</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <div style={{background:'white',borderRadius:'12px',padding:'20px',boxShadow:'0 2px 8px rgba(0,0,0,0.08)'}}>
          <h3 style={{fontSize:'16px',fontWeight:'600',color:'#333',marginBottom:'16px'}}>Recent Activity</h3>
          {activities.length === 0 ? (
            <div style={{padding:'20px',textAlign:'center',color:'#999'}}>No recent activity</div>
          ) : (
            <div>
              {activities.map(activity => (
                <div key={activity.id} style={{padding:'10px 0',borderBottom:'1px solid #f0f0f0'}}>
                  <div style={{fontSize:'13px',color:'#333'}}>{activity.content}</div>
                  <div style={{fontSize:'11px',color:'#999',marginTop:'4px'}}>
                    {activity.createdAt ? new Date(activity.createdAt).toLocaleDateString() : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

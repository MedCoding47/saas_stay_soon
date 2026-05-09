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

  // Fetch data once on mount
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
    { label: 'Total Pets', value: stats.totalPets },
    { label: 'Pending Requests', value: stats.pending },
    { label: 'Adopted', value: stats.adopted },
    { label: 'Active Users', value: stats.activeUsers }
  ];

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard…</div>;
  }

  return (
    <div className="dashboard-wrapper">
      {/* Stat cards */}
      <div className="stat-cards">
        {statCards.map((card, idx) => (
          <div key={idx} className="stat-card">
            <div className="stat-label">{card.label}</div>
            <div className="stat-value">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Main sections */}
      <div className="dashboard-main">
        {/* Recent Pets */}
        <section className="card recent-pets">
          <h3 className="section-title">Recent Pets</h3>
          {recentPets.length === 0 ? (
            <div className="empty-state">No pets found</div>
          ) : (
            <ul className="pet-list">
              {recentPets.map(pet => (
                <li key={pet.id} className="pet-item">
                  <span className="pet-emoji">🐾</span>
                  <div className="pet-info">
                    <div className="pet-name">{pet.name}</div>
                    <div className="pet-meta">{pet.type} • {pet.age} years</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Activity Feed */}
        <section className="card activity-feed">
          <h3 className="section-title">Recent Activity</h3>
          {activities.length === 0 ? (
            <div className="empty-state">No recent activity</div>
          ) : (
            <ul className="activity-list">
              {activities.map(act => (
                <li key={act.id} className="activity-item">
                  <div className="activity-content">{act.content}</div>
                  <div className="activity-date">{act.createdAt ? new Date(act.createdAt).toLocaleDateString() : ''}</div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;

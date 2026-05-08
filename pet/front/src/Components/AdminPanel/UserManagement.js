import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus, faSearch } from '@fortawesome/free-solid-svg-icons';
import api from '../../config/api';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Staff'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/organizations/users', {
        headers: {
        }
      });
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch users: ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEdit = (user) => {
    setCurrentUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role || 'Staff'
    });
    setShowModal(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/organizations/users/${userId}`, {
          headers: {
          }
        });
        setUsers(users.filter(user => user.id !== userId));
        setError('');
      } catch (err) {
        setError('Failed to delete user: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: {
        }
      };

      if (currentUser) {
        // Remove password field if empty to avoid updating with empty password
        const dataToSend = {...formData};
        if (!dataToSend.password) {
          delete dataToSend.password;
        }
        
        await api.put(
          `/organizations/users/${currentUser.id}`,
          dataToSend,
          config
        );
      } else {
        await api.post(
          '/organizations/users',
          formData,
          config
        );
      }
      
      await fetchUsers();
      setShowModal(false);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="loading-spinner">Loading users...</div>;

  return (
    <div className="user-management">
      <div className="card">
        <div className="card-header">
          <h3 className="chart-title">User Management</h3>
          <div className="header-actions">
            <button className="button-primary" onClick={() => {
              setCurrentUser(null);
              setFormData({ name: '', email: '', password: '', role: false });
              setShowModal(true);
            }}>
              <FontAwesomeIcon icon={faPlus} /> Add New User
            </button>
          </div>
        </div>
        
        {error && (
          <div className="alert-danger">
            <p>{error}</p>
            <button onClick={() => setError('')}>×</button>
          </div>
        )}

        <div className="search-control">
          <div className="search-input-wrapper">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${user.role ? 'badge-danger' : 'badge-success'}`}>
                        {user.role ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="button-edit"
                          onClick={() => handleEdit(user)}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button 
                          className="button-delete"
                          onClick={() => handleDelete(user.id)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{currentUser ? 'Edit User' : 'Create User'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder={currentUser ? "Leave blank to keep current password" : ""}
                    required={!currentUser}
                  />
                </div>
                <div className="form-group switch-group">
                  <label>
                    <input
                      type="checkbox"
                      name="role"
                      checked={formData.role}
                      onChange={handleInputChange}
                    />
                    <span className="switch-label">Admin Privileges</span>
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="button-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="button-primary">
                  {currentUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
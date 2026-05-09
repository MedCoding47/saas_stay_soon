import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from '../../config/api';
import './AdminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("admin");
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setShowError(false);
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('pawfinds-token', response.data.token);
      localStorage.setItem('pawfinds-role', response.data.role);
      localStorage.setItem('pawfinds-userId', response.data.userId);
      localStorage.setItem('pawfinds-orgId', response.data.organizationId);
      navigate('/admin/panel');
    } catch {
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        {/* Left panel */}
        <div className="panel-left">
          <div className="logo-section">
            <div className="logo-emoji">🐾</div>
            <h2 className="logo-title">Find your perfect furry companion</h2>
            <p className="logo-subtitle">Connect shelters with loving families. Every pet deserves a home.</p>
          </div>
          <div className="pet-types">
            {['🐕 Dogs','🐈 Cats','🐰 Rabbits','🐦 Birds'].map(b => (
              <span key={b} className="pet-type-badge">{b}</span>
            ))}
          </div>
        </div>
        {/* Right panel */}
        <div className="panel-right">
          <h3 className="welcome-title">Welcome back</h3>
          <p className="welcome-subtitle">Sign in to continue to PawFinds</p>
          <div className="tabs">
            {['admin','adopter'].map(tab => (
              <button
                key={tab}
                type="button"
                className={`tab-button ${activeTab===tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'admin' ? 'Admin / Staff' : 'Adopter'}
              </button>
            ))}
          </div>
          <form className="login-form" onSubmit={handleLogin}>
            <label className="input-label">Email address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="input-field"
            />
            <label className="input-label">Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="input-field"
              />
              <span className="toggle-visibility" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? '🙈' : '👁'}
              </span>
            </div>
            {showError && <div className="error-msg">⚠️ Invalid email or password.</div>}
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

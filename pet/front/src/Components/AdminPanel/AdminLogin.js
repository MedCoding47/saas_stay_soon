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
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--color-background-tertiary)',padding:'1rem'}}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',maxWidth:'820px',width:'100%',borderRadius:'24px',overflow:'hidden',border:'0.5px solid var(--color-border-tertiary)'}}>

        {/* Left panel */}
        <div style={{background:'#FAECE7',padding:'2.5rem',display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
          <div>
            <div style={{fontSize:'36px',marginBottom:'1rem'}}>🐾</div>
            <div style={{fontSize:'22px',fontWeight:'500',color:'#4A1B0C',lineHeight:'1.4',marginBottom:'0.5rem'}}>Find your perfect furry companion</div>
            <div style={{fontSize:'13px',color:'#993C1D',lineHeight:'1.6'}}>Connect shelters with loving families. Every pet deserves a home.</div>
          </div>
          <div style={{display:'flex',gap:'8px',flexWrap:'wrap',marginTop:'2rem'}}>
            {['🐕 Dogs','🐈 Cats','🐰 Rabbits','🐦 Birds'].map(b => (
              <div key={b} style={{padding:'6px 12px',background:'#fff',borderRadius:'20px',fontSize:'12px',color:'#993C1D'}}>{b}</div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div style={{background:'var(--color-background-primary)',padding:'2.5rem'}}>
          <div style={{fontSize:'18px',fontWeight:'500',marginBottom:'0.25rem'}}>Welcome back</div>
          <div style={{fontSize:'13px',color:'var(--color-text-secondary)',marginBottom:'1.5rem'}}>Sign in to continue to PawFinds</div>

          <div style={{display:'flex',gap:'6px',marginBottom:'1.5rem'}}>
            {['admin','adopter'].map(tab => (
              <div key={tab} onClick={() => setActiveTab(tab)} style={{flex:1,padding:'7px',borderRadius:'8px',fontSize:'12px',fontWeight:'500',textAlign:'center',cursor:'pointer',border: activeTab===tab ? '0.5px solid #F0997B' : '0.5px solid var(--color-border-tertiary)',background: activeTab===tab ? '#FAECE7' : 'transparent',color: activeTab===tab ? '#993C1D' : 'var(--color-text-secondary)'}}>
                {tab === 'admin' ? 'Admin / Staff' : 'Adopter'}
              </div>
            ))}
          </div>

          <form onSubmit={handleLogin}>
            <div style={{marginBottom:'1rem'}}>
              <label style={{fontSize:'12px',color:'var(--color-text-secondary)',display:'block',marginBottom:'5px'}}>Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{width:'100%',padding:'9px 12px',border:'0.5px solid var(--color-border-secondary)',borderRadius:'10px',fontSize:'13px',background:'var(--color-background-secondary)',color:'var(--color-text-primary)'}} />
            </div>
            <div style={{marginBottom:'1rem',position:'relative'}}>
              <label style={{fontSize:'12px',color:'var(--color-text-secondary)',display:'block',marginBottom:'5px'}}>Password</label>
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required style={{width:'100%',padding:'9px 40px 9px 12px',border:'0.5px solid var(--color-border-secondary)',borderRadius:'10px',fontSize:'13px',background:'var(--color-background-secondary)',color:'var(--color-text-primary)'}} />
              <span onClick={() => setShowPassword(!showPassword)} style={{position:'absolute',right:'12px',top:'30px',cursor:'pointer',fontSize:'13px',color:'var(--color-text-secondary)'}}>{showPassword ? '🙈' : '👁'}</span>
            </div>
            {showError && <div style={{padding:'8px 12px',background:'#FCEBEB',borderRadius:'8px',fontSize:'12px',color:'#A32D2D',marginBottom:'1rem'}}>⚠️ Invalid email or password.</div>}
            <button type="submit" disabled={loading} style={{width:'100%',padding:'10px',borderRadius:'10px',background:'#D85A30',color:'#fff',fontSize:'14px',fontWeight:'500',border:'none',cursor:'pointer',opacity: loading ? 0.7 : 1}}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

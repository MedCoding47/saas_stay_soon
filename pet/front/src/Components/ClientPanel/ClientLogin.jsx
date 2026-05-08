import { useState } from 'react';
import { useClientAuth } from './ClientAuthContext';
import { Link, useNavigate } from 'react-router-dom';
import './ClientAuth.css';
// Import the dog image
import"./images/1.jpg";

const ClientLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useClientAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Email ou mot de passe incorrect');
    }
  };

  return (
    <div className="client-auth-container">
      <div className="client-auth-sidebar">
        {/* Use the imported image or a placeholder */}
        <img src="/src/images/1.jpg" alt="Dog adoption" />
        <div className="overlay">
          <div className="brand-logo">AdoptOne.</div>
          <h1>Adopt a new friend</h1>
          <p>Connectez-vous pour accéder à votre compte et découvrir votre futur compagnon</p>
        </div>
      </div>
      
      <div className="client-auth-form">
        <div className="client-auth-card">
          <h2>Connexion Client</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-control"
                placeholder="votre@email.com"
              />
            </div>
            
            <div className="form-group">
              <label>Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-control"
                placeholder="••••••••"
              />
            </div>
            
            <button type="submit" className="btn btn-primary">
              Se connecter
            </button>
          </form>
          
          <div className="auth-footer">
            <p>Pas encore de compte ? <Link to="/client/register">Créer un compte</Link></p>
            <p><Link to="/">Retour à l'accueil</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientLogin;
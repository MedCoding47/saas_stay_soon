import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Navbar({ transparent = false }) {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('pawfinds-user') || 'null');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('pawfinds-token');
    localStorage.removeItem('pawfinds-user');
    navigate('/');
  };

  const baseClass = scrolled
    ? 'bg-dark/80 backdrop-blur-xl border-b border-white/10 shadow-lg'
    : transparent
      ? 'bg-transparent border-b border-transparent'
      : 'bg-white/80 backdrop-blur-xl border-b border-gray-100';

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${baseClass}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold">
          <span className={transparent && !scrolled ? 'text-white' : 'text-coral'}>🐾</span>
          <span className={transparent && !scrolled ? 'text-white' : 'text-gray-900'}>PawFinds</span>
        </Link>

        <div className="flex items-center gap-4 text-sm font-medium">
          <Link to="/" className={`hover:text-coral transition-colors ${transparent && !scrolled ? 'text-white/70' : 'text-gray-600'}`}>Home</Link>
          <Link to="/pets" className={`hover:text-coral transition-colors ${transparent && !scrolled ? 'text-white/70' : 'text-gray-600'}`}>Browse Pets</Link>

          {user?.role === 'Admin' && (
            <>
              <Link to="/admin/dashboard" className="text-gray-600 hover:text-coral">Dashboard</Link>
              <button onClick={handleLogout} className="btn-primary text-sm px-4 py-2">Logout</button>
            </>
          )}
          {user?.role === 'SuperAdmin' && (
            <>
              <Link to="/superadmin/dashboard" className="text-gray-600 hover:text-coral">Dashboard</Link>
              <button onClick={handleLogout} className="btn-primary text-sm px-4 py-2">Logout</button>
            </>
          )}
          {user?.role === 'Applicant' && (
            <>
              <Link to="/client/dashboard" className="text-gray-600 hover:text-coral">Dashboard</Link>
              <button onClick={handleLogout} className="btn-outline text-sm px-4 py-2">Logout</button>
            </>
          )}
          {!user && (
            <>
              <Link to="/client/login" className={`hover:text-coral transition-colors ${transparent && !scrolled ? 'text-white/70' : 'text-gray-600'}`}>Sign In</Link>
              <Link to="/client/register" className="btn-primary text-sm px-4 py-2">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}

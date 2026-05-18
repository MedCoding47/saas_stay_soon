import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('sh-user') || 'null');
  const role = localStorage.getItem('sh-role');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('sh-token');
    localStorage.removeItem('sh-role');
    localStorage.removeItem('sh-user');
    navigate('/');
  };

  const navClass = scrolled
    ? 'bg-white/80 backdrop-blur-xl border-b border-warm-dark/20 shadow-sm'
    : 'bg-transparent';

  const textClass = scrolled ? 'text-dark' : 'text-white/80';
  const textClassHover = scrolled ? 'hover:text-coral' : 'hover:text-white';

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navClass}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold">
          <span className="text-coral">🐾</span>
          <span className={`${scrolled ? 'text-dark' : 'text-white'} transition-colors`}>Paw</span>
          <span className="text-coral">Finds</span>
        </Link>

        <button className="lg:hidden text-2xl" onClick={() => setMenuOpen(!menuOpen)} style={{ color: scrolled ? '#1a1a2e' : 'rgba(255,255,255,0.8)' }}>
          {menuOpen ? '✕' : '☰'}
        </button>

        <div className="hidden lg:flex items-center gap-6 text-sm font-medium">
          {user?.profilePictureUrl && (
            <img src={user.profilePictureUrl} alt="" className="w-8 h-8 rounded-full object-cover border-2 border-coral/50" />
          )}
          <Link to="/" className={`${textClass} ${textClassHover} transition-colors`}>Home</Link>
          <Link to="/pets" className={`${textClass} ${textClassHover} transition-colors`}>Browse</Link>
          <Link to="/doctors" className={`${textClass} ${textClassHover} transition-colors`}>Doctors</Link>

          {role === 'SuperAdmin' && (
            <>
              <Link to="/superadmin/dashboard" className={`${textClass} ${textClassHover} transition-colors`}>Dashboard</Link>
              <Link to="/superadmin/create-account" className={`${textClass} ${textClassHover} transition-colors`}>Create Account</Link>
              <button onClick={handleLogout} className="btn-primary text-sm px-4 py-2">Logout</button>
            </>
          )}
          {role === 'Enterprise' && (
            <>
              <Link to="/enterprise/dashboard" className={`${textClass} ${textClassHover} transition-colors`}>Dashboard</Link>
              <button onClick={handleLogout} className={`btn-outline text-sm px-4 py-2 ${scrolled ? 'border-coral/30 text-coral hover:bg-coral hover:text-white' : ''}`}>Logout</button>
            </>
          )}
          {role === 'Veterinaire' && (
            <>
              <Link to="/veterinaire/dashboard" className={`${textClass} ${textClassHover} transition-colors`}>Dashboard</Link>
              <button onClick={handleLogout} className={`btn-outline text-sm px-4 py-2 ${scrolled ? 'border-coral/30 text-coral hover:bg-coral hover:text-white' : ''}`}>Logout</button>
            </>
          )}
          {role === 'Client' && (
            <>
              <Link to="/client/dashboard" className={`${textClass} ${textClassHover} transition-colors`}>Dashboard</Link>
              <button onClick={handleLogout} className={`btn-outline text-sm px-4 py-2 ${scrolled ? 'border-coral/30 text-coral hover:bg-coral hover:text-white' : ''}`}>Logout</button>
            </>
          )}
          {!user && (
            <>
              <Link to="/login" className={`${textClass} ${textClassHover} transition-colors`}>Sign In</Link>
              <Link to="/login/client" className="btn-primary text-sm px-4 py-2">Get Started</Link>
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-warm-dark/20 px-4 py-4 space-y-3 shadow-glass"
          >
            <Link to="/" onClick={() => setMenuOpen(false)} className="block text-dark/70 hover:text-coral">Home</Link>
            <Link to="/pets" onClick={() => setMenuOpen(false)} className="block text-dark/70 hover:text-coral">Browse</Link>
            <Link to="/doctors" onClick={() => setMenuOpen(false)} className="block text-dark/70 hover:text-coral">Doctors</Link>
            {role === 'SuperAdmin' && (
              <>
                <Link to="/superadmin/dashboard" onClick={() => setMenuOpen(false)} className="block text-dark/70 hover:text-coral">Dashboard</Link>
                <Link to="/superadmin/create-account" onClick={() => setMenuOpen(false)} className="block text-dark/70 hover:text-coral">Create Account</Link>
              </>
            )}
            {role === 'Enterprise' && (
              <Link to="/enterprise/dashboard" onClick={() => setMenuOpen(false)} className="block text-dark/70 hover:text-coral">Dashboard</Link>
            )}
            {role === 'Veterinaire' && (
              <Link to="/veterinaire/dashboard" onClick={() => setMenuOpen(false)} className="block text-dark/70 hover:text-coral">Dashboard</Link>
            )}
            {role === 'Client' && (
              <Link to="/client/dashboard" onClick={() => setMenuOpen(false)} className="block text-dark/70 hover:text-coral">Dashboard</Link>
            )}
            {!user && (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="block text-dark/70 hover:text-coral">Sign In</Link>
                <Link to="/login/client" onClick={() => setMenuOpen(false)} className="block text-dark/70 hover:text-coral">Get Started</Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

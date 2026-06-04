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
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('sh-token');
    localStorage.removeItem('sh-role');
    localStorage.removeItem('sh-user');
    navigate('/');
  };

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#E8E0D8] shadow-sm'
          : 'bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#E8E0D8]'
      }`}
    >
      <div className="max-w-6xl mx-auto px-8 h-16 flex items-center justify-between">
        <Link to="/" className="font-display font-black text-xl text-[#0D0D0D]">
          Nino
        </Link>

        <button className="lg:hidden text-xl text-[#8c7e74] hover:text-[#0D0D0D]" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>

        <div className="hidden lg:flex items-center gap-8 text-sm font-medium">
          <Link to="/" className="text-[#8c7e74] hover:text-[#0D0D0D] transition-colors">Home</Link>
          <Link to="/pets" className="text-[#8c7e74] hover:text-[#0D0D0D] transition-colors">Browse</Link>
          <Link to="/doctors" className="text-[#8c7e74] hover:text-[#0D0D0D] transition-colors">Doctors</Link>

          {role === 'SuperAdmin' && (
            <>
              <Link to="/superadmin/dashboard" className="text-[#8c7e74] hover:text-[#0D0D0D] transition-colors">Dashboard</Link>
              <Link to="/superadmin/create-account" className="text-[#8c7e74] hover:text-[#0D0D0D] transition-colors">Create Account</Link>
              <button onClick={handleLogout} className="btn-dark text-sm px-5 py-2">Logout</button>
            </>
          )}
          {role === 'Enterprise' && (
            <>
              <Link to="/enterprise/dashboard" className="text-[#8c7e74] hover:text-[#0D0D0D] transition-colors">Dashboard</Link>
              <button onClick={handleLogout} className="btn-dark text-sm px-5 py-2">Logout</button>
            </>
          )}
          {role === 'Veterinaire' && (
            <>
              <Link to="/veterinaire/dashboard" className="text-[#8c7e74] hover:text-[#0D0D0D] transition-colors">Dashboard</Link>
              <button onClick={handleLogout} className="btn-dark text-sm px-5 py-2">Logout</button>
            </>
          )}
          {role === 'Client' && (
            <>
              <Link to="/client/dashboard" className="text-[#8c7e74] hover:text-[#0D0D0D] transition-colors">Dashboard</Link>
              <button onClick={handleLogout} className="btn-dark text-sm px-5 py-2">Logout</button>
            </>
          )}
          {!user && (
            <>
              <Link to="/login" className="text-[#8c7e74] hover:text-[#0D0D0D] transition-colors">Sign In</Link>
              <Link to="/login/client" className="btn-dark text-sm px-5 py-2">Get Started</Link>
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
            className="lg:hidden bg-white border-t border-[#E8E0D8] px-8 py-6 space-y-4"
          >
            <Link to="/" onClick={() => setMenuOpen(false)} className="block text-lg font-medium text-[#0D0D0D] hover:text-coral transition-colors">Home</Link>
            <Link to="/pets" onClick={() => setMenuOpen(false)} className="block text-lg font-medium text-[#0D0D0D] hover:text-coral transition-colors">Browse</Link>
            <Link to="/doctors" onClick={() => setMenuOpen(false)} className="block text-lg font-medium text-[#0D0D0D] hover:text-coral transition-colors">Doctors</Link>

            <div className="w-full h-px bg-[#E8E0D8]" />

            {role === 'SuperAdmin' && (
              <>
                <Link to="/superadmin/dashboard" onClick={() => setMenuOpen(false)} className="block text-lg font-medium text-[#0D0D0D] hover:text-coral transition-colors">Dashboard</Link>
                <Link to="/superadmin/create-account" onClick={() => setMenuOpen(false)} className="block text-lg font-medium text-[#0D0D0D] hover:text-coral transition-colors">Create Account</Link>
              </>
            )}
            {role === 'Enterprise' && (
              <Link to="/enterprise/dashboard" onClick={() => setMenuOpen(false)} className="block text-lg font-medium text-[#0D0D0D] hover:text-coral transition-colors">Dashboard</Link>
            )}
            {role === 'Veterinaire' && (
              <Link to="/veterinaire/dashboard" onClick={() => setMenuOpen(false)} className="block text-lg font-medium text-[#0D0D0D] hover:text-coral transition-colors">Dashboard</Link>
            )}
            {role === 'Client' && (
              <Link to="/client/dashboard" onClick={() => setMenuOpen(false)} className="block text-lg font-medium text-[#0D0D0D] hover:text-coral transition-colors">Dashboard</Link>
            )}
            {!user && (
              <>
                <div className="pt-2">
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="block w-full text-center bg-[#0D0D0D] text-[#FAF7F2] rounded-full py-3 font-semibold hover:bg-[#2A2A2A] transition-colors">Sign In</Link>
                </div>
                <Link to="/login/client" onClick={() => setMenuOpen(false)} className="block w-full text-center border-2 border-[#0D0D0D] rounded-full py-3 font-semibold text-[#0D0D0D] hover:bg-[#0D0D0D] hover:text-[#FAF7F2] transition-colors">Get Started</Link>
              </>
            )}
            {user && (
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="block w-full text-center bg-[#0D0D0D] text-[#FAF7F2] rounded-full py-3 font-semibold hover:bg-[#2A2A2A] transition-colors">Logout</button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

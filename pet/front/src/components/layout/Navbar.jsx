import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { t, i18n } = useTranslation();
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

  const switchLang = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
    window.dispatchEvent(new Event('languageChanged'));
  };

  const currentLang = i18n.language?.startsWith('ar') ? 'ar' : i18n.language?.startsWith('fr') ? 'fr' : 'en';

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
        <Link to="/" className="font-display font-black text-xl text-[#0D0D0D] flex-shrink-0">
          Nino
        </Link>

        <button className="lg:hidden text-xl text-[#8c7e74] hover:text-[#0D0D0D]" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>

        <div className="hidden lg:flex items-center gap-8 text-sm font-medium">
          <Link to="/" className="text-[#8c7e74] hover:text-[#0D0D0D] transition-colors">{t('navbar.home')}</Link>
          <Link to="/pets" className="text-[#8c7e74] hover:text-[#0D0D0D] transition-colors">{t('navbar.browse')}</Link>
          <Link to="/doctors" className="text-[#8c7e74] hover:text-[#0D0D0D] transition-colors">{t('navbar.doctors')}</Link>

          {role === 'SuperAdmin' && (
            <>
              <Link to="/superadmin/dashboard" className="text-[#8c7e74] hover:text-[#0D0D0D] transition-colors">{t('navbar.dashboard')}</Link>
              <Link to="/superadmin/create-account" className="text-[#8c7e74] hover:text-[#0D0D0D] transition-colors">{t('navbar.createAccount')}</Link>
              <button onClick={handleLogout} className="btn-dark text-sm px-5 py-2">{t('navbar.logout')}</button>
            </>
          )}
          {role === 'Enterprise' && (
            <>
              <Link to="/enterprise/dashboard" className="text-[#8c7e74] hover:text-[#0D0D0D] transition-colors">{t('navbar.dashboard')}</Link>
              <button onClick={handleLogout} className="btn-dark text-sm px-5 py-2">{t('navbar.logout')}</button>
            </>
          )}
          {role === 'Veterinaire' && (
            <>
              <Link to="/veterinaire/dashboard" className="text-[#8c7e74] hover:text-[#0D0D0D] transition-colors">{t('navbar.dashboard')}</Link>
              <button onClick={handleLogout} className="btn-dark text-sm px-5 py-2">{t('navbar.logout')}</button>
            </>
          )}
          {role === 'Client' && (
            <>
              <Link to="/client/dashboard" className="text-[#8c7e74] hover:text-[#0D0D0D] transition-colors">{t('navbar.dashboard')}</Link>
              <button onClick={handleLogout} className="btn-dark text-sm px-5 py-2">{t('navbar.logout')}</button>
            </>
          )}
          {!user && (
            <>
              <Link to="/login" className="text-[#8c7e74] hover:text-[#0D0D0D] transition-colors">{t('navbar.signIn')}</Link>
              <Link to="/login/client" className="btn-dark text-sm px-5 py-2">{t('navbar.getStarted')}</Link>
            </>
          )}

          {/* Language Switcher */}
          <div className="flex items-center gap-1 border-l border-[#E8E0D8] pl-6">
            {['en', 'fr', 'ar'].map((l) => (
              <button
                key={l}
                onClick={() => switchLang(l)}
                className={`text-xs font-bold px-2 py-1 rounded-full transition-all ${
                  currentLang === l
                    ? 'bg-[#0D0D0D] text-[#FAF7F2]'
                    : 'text-[#8c7e74] hover:text-[#0D0D0D]'
                }`}
              >
                {l === 'en' ? 'EN' : l === 'fr' ? 'FR' : 'AR'}
              </button>
            ))}
          </div>
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
            <Link to="/" onClick={() => setMenuOpen(false)} className="block text-lg font-medium text-[#0D0D0D] hover:text-coral transition-colors">{t('navbar.home')}</Link>
            <Link to="/pets" onClick={() => setMenuOpen(false)} className="block text-lg font-medium text-[#0D0D0D] hover:text-coral transition-colors">{t('navbar.browse')}</Link>
            <Link to="/doctors" onClick={() => setMenuOpen(false)} className="block text-lg font-medium text-[#0D0D0D] hover:text-coral transition-colors">{t('navbar.doctors')}</Link>

            <div className="w-full h-px bg-[#E8E0D8]" />

            {role === 'SuperAdmin' && (
              <>
                <Link to="/superadmin/dashboard" onClick={() => setMenuOpen(false)} className="block text-lg font-medium text-[#0D0D0D] hover:text-coral transition-colors">{t('navbar.dashboard')}</Link>
                <Link to="/superadmin/create-account" onClick={() => setMenuOpen(false)} className="block text-lg font-medium text-[#0D0D0D] hover:text-coral transition-colors">{t('navbar.createAccount')}</Link>
              </>
            )}
            {role === 'Enterprise' && (
              <Link to="/enterprise/dashboard" onClick={() => setMenuOpen(false)} className="block text-lg font-medium text-[#0D0D0D] hover:text-coral transition-colors">{t('navbar.dashboard')}</Link>
            )}
            {role === 'Veterinaire' && (
              <Link to="/veterinaire/dashboard" onClick={() => setMenuOpen(false)} className="block text-lg font-medium text-[#0D0D0D] hover:text-coral transition-colors">{t('navbar.dashboard')}</Link>
            )}
            {role === 'Client' && (
              <Link to="/client/dashboard" onClick={() => setMenuOpen(false)} className="block text-lg font-medium text-[#0D0D0D] hover:text-coral transition-colors">{t('navbar.dashboard')}</Link>
            )}
            {!user && (
              <>
                <div className="pt-2">
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="block w-full text-center bg-[#0D0D0D] text-[#FAF7F2] rounded-full py-3 font-semibold hover:bg-[#2A2A2A] transition-colors">{t('navbar.signIn')}</Link>
                </div>
                <Link to="/login/client" onClick={() => setMenuOpen(false)} className="block w-full text-center border-2 border-[#0D0D0D] rounded-full py-3 font-semibold text-[#0D0D0D] hover:bg-[#0D0D0D] hover:text-[#FAF7F2] transition-colors">{t('navbar.getStarted')}</Link>
              </>
            )}
            {user && (
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="block w-full text-center bg-[#0D0D0D] text-[#FAF7F2] rounded-full py-3 font-semibold hover:bg-[#2A2A2A] transition-colors">{t('navbar.logout')}</button>
            )}

            {/* Mobile Language Switcher */}
            <div className="flex items-center justify-center gap-2 pt-4 border-t border-[#E8E0D8]">
              {['en', 'fr', 'ar'].map((l) => (
                <button
                  key={l}
                  onClick={() => { switchLang(l); setMenuOpen(false); }}
                  className={`text-sm font-bold px-4 py-2 rounded-full transition-all ${
                    currentLang === l
                      ? 'bg-[#0D0D0D] text-[#FAF7F2]'
                      : 'bg-[#FAF7F2] text-[#8c7e74]'
                  }`}
                >
                  {l === 'en' ? 'English' : l === 'fr' ? 'Français' : 'العربية'}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

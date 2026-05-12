import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const links = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/admin/pets', label: 'Pets', icon: '🐾' },
  { to: '/admin/adoptions', label: 'Adoptions', icon: '📋' },
  { to: '/admin/conversations', label: 'Messages', icon: '💬' },
];

export default function AdminSidebar() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('sh-token');
    localStorage.removeItem('sh-role');
    localStorage.removeItem('sh-user');
    navigate('/');
  };

  return (
    <motion.aside
      initial={{ x: -260 }}
      animate={{ x: 0 }}
      className="w-64 min-h-screen bg-white border-r border-warm-dark/30 fixed left-0 top-0 pt-20 z-40 shadow-sm"
    >
      <div className="px-6 pb-4 mb-4 border-b border-warm-dark/20">
        <span className="text-lg font-bold">
          <span className="text-coral">🐾</span>{' '}
          <span className="text-dark">Paw</span>
          <span className="text-coral">Finds</span>
        </span>
        <p className="text-xs text-muted mt-1">Admin Panel</p>
      </div>
      <nav className="px-3 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive ? 'bg-coral-light text-coral' : 'text-muted hover:bg-warm-alt hover:text-dark'
              }`
            }
          >
            <span>{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-light hover:bg-red-50 hover:text-red-500 w-full transition-all duration-200 mt-8">
          <span>🚪</span> Logout
        </button>
      </nav>
    </motion.aside>
  );
}

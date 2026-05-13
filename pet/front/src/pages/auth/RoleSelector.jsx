import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageTransition from '../../components/animations/PageTransition';

const roles = [
  {
    key: 'organization',
    title: 'Organization',
    description: 'For pet adoption agencies and shelters. Sign in with your work account.',
    icon: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
    ),
    path: '/login/organization',
    color: 'from-teal-500 to-emerald-600',
  },
  {
    key: 'veterinaire',
    title: 'Veterinaire',
    description: 'For veterinary professionals. Sign in with your clinic account.',
    icon: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
    path: '/login/veterinaire',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    key: 'client',
    title: 'Normal User',
    description: 'For individuals looking to adopt. Sign in or create your personal account.',
    icon: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    ),
    path: '/login/client',
    color: 'from-coral to-rose-500',
  },
];

export default function RoleSelector() {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--sh-warm)' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-4xl"
        >
          <div className="text-center mb-10">
            <div className="text-5xl mb-3">🐾</div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome to <span className="text-coral">PawFinds</span>
            </h1>
            <p className="text-gray-500 mt-2">Choose your account type to continue</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {roles.map((role, index) => (
              <motion.div
                key={role.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => navigate(role.path)}
              >
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${role.color} flex items-center justify-center text-white mb-5`}>
                  {role.icon}
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">{role.title}</h2>
                <p className="text-gray-500 text-sm mb-6 flex-1">{role.description}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(role.path); }}
                  className={`w-full py-2.5 rounded-xl text-white font-medium text-sm bg-gradient-to-r ${role.color} hover:opacity-90 transition-opacity`}
                >
                  {role.key === 'client' ? 'Sign In / Register' : 'Sign In'}
                </button>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => navigate('/admin')}
              className="text-sm text-gray-400 hover:text-coral transition-colors"
            >
              Admin Login
            </button>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}

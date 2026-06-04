import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageTransition from '../../components/animations/PageTransition';

const roles = [
  {
    key: 'client',
    title: 'Adopter',
    description: 'For individuals looking to adopt. Sign in or create your personal account.',
    emoji: '🐾',
    path: '/login/client',
  },
  {
    key: 'organization',
    title: 'Shelter',
    description: 'For pet adoption agencies and shelters. Sign in with your work account.',
    emoji: '🏢',
    path: '/login/organization',
  },
  {
    key: 'veterinaire',
    title: 'Veterinarian',
    description: 'For veterinary professionals. Sign in with your clinic account.',
    emoji: '🩺',
    path: '/login/veterinaire',
  },
];

export default function RoleSelector() {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-4xl"
        >
          <div className="text-center mb-12">
            <button onClick={() => navigate('/')} className="font-display font-black text-3xl text-[#0D0D0D] mb-4 inline-block">Nino</button>
            <h1 className="font-display font-black text-[56px] leading-tight text-[#0D0D0D] tracking-tight">
              Who are you?
            </h1>
            <p className="text-[#8c7e74] text-lg mt-3">Choose your account type to continue</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {roles.map((role, index) => (
              <motion.div
                key={role.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-3xl border border-[#E8E0D8] p-8 flex flex-col items-center text-center hover:-translate-y-1 hover:shadow-card-hover transition-all duration-300 cursor-pointer"
                onClick={() => navigate(role.path)}
              >
                <div className="text-6xl mb-5">{role.emoji}</div>
                <h2 className="text-xl font-bold text-[#0D0D0D] mb-2">{role.title}</h2>
                <p className="text-[#8c7e74] text-sm mb-6 flex-1 leading-relaxed">{role.description}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(role.path); }}
                  className="btn-dark w-full text-sm"
                >
                  {role.key === 'client' ? 'Sign In / Register' : 'Sign In'}
                </button>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <button onClick={() => navigate('/admin')} className="text-sm text-[#8c7e74] hover:text-coral transition-colors">
              Admin Login
            </button>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}

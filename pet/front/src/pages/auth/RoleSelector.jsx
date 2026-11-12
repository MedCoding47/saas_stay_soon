import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import PageTransition from '../../components/animations/PageTransition';

const roles = [
  {
    key: 'client',
    titleKey: 'auth.roleSelector.client',
    descriptionKey: 'auth.roleSelector.clientDesc',
    emoji: '🐾',
    ctaPath: '/login/client',
    ctaLabelKey: 'auth.roleSelector.signInRegister',
  },
  {
    key: 'organization',
    titleKey: 'auth.roleSelector.enterprise',
    descriptionKey: 'auth.roleSelector.enterpriseDesc',
    emoji: '🏢',
    ctaPath: '/register/organization',
    ctaLabelKey: 'auth.orgRegister.createAccount',
    secondaryPath: '/login/organization',
    secondaryLabelKey: 'auth.orgRegister.hasAccount',
  },
  {
    key: 'veterinaire',
    titleKey: 'auth.roleSelector.vet',
    descriptionKey: 'auth.roleSelector.vetDesc',
    emoji: '🩺',
    ctaPath: '/login/veterinaire',
    ctaLabelKey: 'common.signIn',
  },
];

export default function RoleSelector() {
  const { t } = useTranslation();
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
            <button onClick={() => navigate('/')} className="mb-4 inline-block"><img src="/logo.png" alt="Nino" className="h-10 w-auto mx-auto" /></button>
            <h1 className="font-display font-black text-[56px] leading-tight text-[#0D0D0D] tracking-tight">
              {t('auth.roleSelector.title')}
            </h1>
            <p className="text-[#8c7e74] text-lg mt-3">{t('auth.roleSelector.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {roles.map((role, index) => (
              <motion.div
                key={role.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-3xl border border-[#E8E0D8] p-8 flex flex-col items-center text-center hover:-translate-y-1 hover:shadow-card-hover transition-all duration-300 cursor-pointer"
                onClick={() => navigate(role.ctaPath)}
              >
                <div className="text-6xl mb-5">{role.emoji}</div>
                <h2 className="text-xl font-bold text-[#0D0D0D] mb-2">{t(role.titleKey)}</h2>
                <p className="text-[#8c7e74] text-sm mb-6 flex-1 leading-relaxed">{t(role.descriptionKey)}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(role.ctaPath); }}
                  className="btn-dark w-full text-sm"
                >
                  {t(role.ctaLabelKey)}
                </button>
                {role.secondaryPath && (
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(role.secondaryPath); }}
                    className="text-xs text-[#8c7e74] hover:text-coral mt-3 transition-colors underline decoration-dotted underline-offset-2"
                  >
                    {t(role.secondaryLabelKey)}
                  </button>
                )}
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <button onClick={() => navigate('/admin')} className="text-sm text-[#8c7e74] hover:text-coral transition-colors">
              {t('auth.roleSelector.adminLogin')}
            </button>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}

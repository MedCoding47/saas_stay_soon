import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import PageTransition from '../../components/animations/PageTransition';

export default function OrganizationLogin() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      if (user.role === 'Enterprise') navigate('/enterprise/dashboard');
      else navigate('/login/organization');
    } catch {}
  };

  return (
    <PageTransition>
      <div className="flex min-h-screen">
        <div className="w-full md:w-1/2 bg-[#FAF7F2] flex flex-col justify-center px-8 md:px-16 py-12 min-h-screen">
          <div className="flex items-center justify-between mb-16">
            <button onClick={() => navigate('/')}><img src="/logo.png" alt="Nino" className="h-8 w-auto" /></button>
            <button onClick={() => navigate('/login')} className="text-sm text-[#8c7e74]">
              <span className="text-[#8c7e74]">{t('auth.login.roleLabel')}</span>
            </button>
          </div>

          <div className="max-w-sm">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display font-black text-[48px] leading-tight text-[#0D0D0D] tracking-tight"
            >
              {t('auth.orgLogin.title')}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-[#8c7e74] text-lg mt-2 mb-10"
            >
              {t('auth.orgLogin.subtitle')}
            </motion.p>

            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onSubmit={handleSubmit}
            >
              <div className="mb-5">
                <label className="text-xs font-bold tracking-widest uppercase text-[#8c7e74] mb-2 block">{t('common.email')}</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('common.emailPlaceholder')} required className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" />
              </div>
              <div className="mb-5">
                <label className="text-xs font-bold tracking-widest uppercase text-[#8c7e74] mb-2 block">{t('common.password')}</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('common.passwordPlaceholder')} required className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" />
              </div>
              {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg border border-red-200">{error}</p>}
              <button type="submit" disabled={loading} className="w-full btn-dark py-4 text-base rounded-2xl mt-6">
                {loading ? t('common.loading') : t('common.signIn')}
              </button>
            </motion.form>

            <p className="text-center text-xs text-[#8c7e74] mt-8">
              {t('auth.orgLogin.adminNote')}
            </p>
          </div>
        </div>

        <div className="hidden md:flex w-1/2 bg-[#0D0D0D] min-h-screen flex-col items-center justify-center p-16 relative overflow-hidden">
          <span className="font-display font-black text-[18vw] text-white/5 absolute select-none pointer-events-none">Nino</span>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-10 text-center relative z-10 max-w-sm">
            <div className="text-7xl mb-4">🏢</div>
            <h3 className="font-display font-bold text-white text-3xl">{t('auth.orgLogin.rightTitle')}</h3>
            <p className="text-white/50 text-base mt-2 leading-relaxed">
              {t('auth.orgLogin.rightDesc')}
            </p>
          </div>
          <div className="flex gap-4 absolute bottom-10">
            <span className="tag px-4 py-2 rounded-full border border-white/20 text-white/70 text-xs font-semibold">{t('common.petsCount')}</span>
            <span className="tag px-4 py-2 rounded-full border border-white/20 text-white/70 text-xs font-semibold">{t('common.sheltersCount')}</span>
            <span className="tag px-4 py-2 rounded-full border border-white/20 text-white/70 text-xs font-semibold">{t('common.successRate')}</span>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

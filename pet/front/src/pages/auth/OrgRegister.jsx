import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import PageTransition from '../../components/animations/PageTransition';

const slugify = (value) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

export default function OrgRegister() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    orgName: '',
    orgSlug: '',
    location: '',
    password: '',
    confirmPassword: '',
  });
  const { registerOrganization, loading, error } = useAuth();
  const navigate = useNavigate();

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleOrgNameChange = (value) => {
    const slug = slugify(value);
    setForm((prev) => ({
      ...prev,
      orgName: value,
      orgSlug: !prev.orgSlugEdited ? slug : prev.orgSlug,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return;
    try {
      const user = await registerOrganization({
        fullName: form.fullName,
        email: form.email,
        phoneNumber: form.phoneNumber || null,
        orgName: form.orgName,
        orgSlug: slugify(form.orgSlug) || 'shelter',
        location: form.location || null,
        password: form.password,
      });
      if (user.role === 'Enterprise') navigate('/enterprise/dashboard');
    } catch {}
  };

  return (
    <PageTransition>
      <div className="flex min-h-screen">
        <div className="w-full md:w-1/2 bg-[#FAF7F2] flex flex-col justify-center px-8 md:px-16 py-12 min-h-screen">
          <div className="flex items-center justify-between mb-16">
            <button onClick={() => navigate('/')}><img src="/logo.png" alt="Nino" className="h-8 w-auto" /></button>
            <p className="text-sm text-[#8c7e74]">
              {t('auth.register.alreadyAccount')}{' '}
              <button onClick={() => navigate('/login/organization')} className="text-coral font-semibold hover:underline">{t('common.signIn')}</button>
            </p>
          </div>

          <div className="max-w-sm">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display font-black text-[48px] leading-tight text-[#0D0D0D] tracking-tight"
            >
              {t('auth.orgRegister.title')}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-[#8c7e74] text-lg mt-2 mb-10"
            >
              {t('auth.orgRegister.subtitle')}
            </motion.p>

            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onSubmit={handleSubmit}
            >
              <div className="mb-5">
                <label className="text-xs font-bold tracking-widest uppercase text-[#8c7e74] mb-2 block">{t('auth.orgRegister.orgName')}</label>
                <input type="text" value={form.orgName} onChange={(e) => handleOrgNameChange(e.target.value)} required className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" />
              </div>
              <div className="mb-5">
                <label className="text-xs font-bold tracking-widest uppercase text-[#8c7e74] mb-2 block">{t('auth.orgRegister.orgSlug')}</label>
                <input type="text" value={form.orgSlug} onChange={(e) => setForm((prev) => ({ ...prev, orgSlug: e.target.value, orgSlugEdited: true }))} required className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" />
              </div>
              <div className="mb-5">
                <label className="text-xs font-bold tracking-widest uppercase text-[#8c7e74] mb-2 block">{t('auth.register.name')}</label>
                <input type="text" value={form.fullName} onChange={(e) => setField('fullName', e.target.value)} required className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" />
              </div>
              <div className="mb-5">
                <label className="text-xs font-bold tracking-widest uppercase text-[#8c7e74] mb-2 block">{t('common.email')}</label>
                <input type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} required className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" />
              </div>
              <div className="mb-5">
                <label className="text-xs font-bold tracking-widest uppercase text-[#8c7e74] mb-2 block">{t('common.phone')}</label>
                <input type="tel" value={form.phoneNumber} onChange={(e) => setField('phoneNumber', e.target.value)} className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" />
              </div>
              <div className="mb-5">
                <label className="text-xs font-bold tracking-widest uppercase text-[#8c7e74] mb-2 block">{t('common.location')}</label>
                <input type="text" value={form.location} onChange={(e) => setField('location', e.target.value)} className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" />
              </div>
              <div className="mb-5">
                <label className="text-xs font-bold tracking-widest uppercase text-[#8c7e74] mb-2 block">{t('common.password')}</label>
                <input type="password" value={form.password} onChange={(e) => setField('password', e.target.value)} required minLength={6} className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" />
              </div>
              <div className="mb-5">
                <label className="text-xs font-bold tracking-widest uppercase text-[#8c7e74] mb-2 block">{t('auth.register.confirmPassword')}</label>
                <input type="password" value={form.confirmPassword} onChange={(e) => setField('confirmPassword', e.target.value)} required minLength={6} className="w-full px-5 py-4 rounded-2xl border-2 border-[#E8E0D8] bg-white text-[#0D0D0D] text-sm outline-none focus:border-[#0D0D0D] transition-colors" />
              </div>
              {form.password !== form.confirmPassword && form.confirmPassword && (
                <p className="text-red-500 text-sm mb-4">{t('auth.register.passwordMismatch')}</p>
              )}
              {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg border border-red-200">{error}</p>}
              <button type="submit" disabled={loading} className="w-full btn-dark py-4 text-base rounded-2xl mt-6">
                {loading ? t('common.loading') : t('auth.orgRegister.createAccount')}
              </button>
            </motion.form>
          </div>
        </div>

        <div className="hidden md:flex w-1/2 bg-[#0D0D0D] min-h-screen flex-col items-center justify-center p-16 relative overflow-hidden">
          <img src="/src/assets/logo.png" alt="Nino" className="h-16 w-auto object-contain brightness-0 invert mx-auto mb-8" />
          <div className="bg-white/5 border border-white/10 rounded-3xl p-10 text-center relative z-10 max-w-sm">
            <div className="text-7xl mb-4">🏢</div>
            <h3 className="font-display font-bold text-white text-3xl">{t('auth.orgRegister.rightTitle')}</h3>
            <p className="text-white/50 text-base mt-2 leading-relaxed">
              {t('auth.orgRegister.rightDesc')}
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
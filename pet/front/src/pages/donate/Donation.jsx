import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import PageTransition from '../../components/animations/PageTransition';

const PAYPAL_URL = 'https://paypal.me/Medmoney642';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } }),
};

const IMPACT_ITEMS = [
  { icon: '🏠', key: 'donate.impact.items.shelter' },
  { icon: '💉', key: 'donate.impact.items.vet' },
  { icon: '🍲', key: 'donate.impact.items.food' },
  { icon: '🚚', key: 'donate.impact.items.rescue' },
];

const FAQ_ITEMS = [
  { q: 'donate.faq.q1', a: 'donate.faq.a1' },
  { q: 'donate.faq.q2', a: 'donate.faq.a2' },
  { q: 'donate.faq.q3', a: 'donate.faq.a3' },
  { q: 'donate.faq.q4', a: 'donate.faq.a4' },
];

export default function Donation() {
  const { t } = useTranslation();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterDone, setNewsletterDone] = useState(false);

  const handleNewsletter = () => {
    if (newsletterEmail) setNewsletterDone(true);
  };

  return (
    <PageTransition>
      <Navbar />

      {/* HERO + PAYPAL CARD */}
      <section className="bg-[#0D0D0D] pt-32 pb-32 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="tag tag-coral mb-6 inline-block">
            {t('donate.hero.badge')}
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="font-display font-black text-display-md text-white leading-[0.92] tracking-tight">
            {t('donate.hero.title_line1')}<br />
            <em className="not-italic text-coral">{t('donate.hero.title_line2')}</em>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-white/50 text-lg mt-6 max-w-xl mx-auto leading-relaxed mb-14">
            {t('donate.hero.subtitle')}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <a
              href={PAYPAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-4 bg-white text-[#0D0D0D] rounded-full px-10 py-4 font-bold text-lg hover:bg-coral hover:text-white transition-all duration-300 shadow-lg"
            >
              <span className="text-2xl">🅿️</span>
              {t('donate.payment.button')}
            </a>
          </motion.div>
        </div>
      </section>

      {/* IMPACT STRIP */}
      <section className="bg-white py-20 px-8 border-t border-[#E8E0D8]">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="font-display font-black text-display-sm text-[#0D0D0D] leading-[0.92] mb-4">
            {t('donate.impact.title')}
          </motion.h2>
          <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} className="text-[#8c7e74] text-lg max-w-xl mx-auto mb-14">
            {t('donate.impact.subtitle')}
          </motion.p>
          <div className="grid md:grid-cols-4 gap-6">
            {IMPACT_ITEMS.map((item, i) => (
              <motion.div
                key={i}
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i + 1}
                className="bg-[#FAF7F2] rounded-3xl p-8 border border-[#E8E0D8]"
              >
                <span className="text-4xl block mb-4">{item.icon}</span>
                <p className="text-sm text-[#0D0D0D] font-semibold leading-relaxed">{t(item.key)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TAX INFO */}
      <section className="bg-[#0D0D0D] py-20 px-8">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="font-display font-black text-display-sm text-white leading-[0.92] mb-6">
            {t('donate.taxSection.title')}
          </motion.h2>
          <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} className="text-white/60 text-lg leading-relaxed max-w-2xl mx-auto">
            {t('donate.taxSection.description')}
          </motion.p>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[#FAF7F2] py-20 px-8">
        <div className="max-w-3xl mx-auto">
          <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="font-display font-black text-display-sm text-[#0D0D0D] leading-[0.92] mb-14 text-center">
            {t('donate.faq.title')}
          </motion.h2>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <motion.details
                key={i}
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
                className="bg-white border border-[#E8E0D8] rounded-2xl p-5 group cursor-pointer [&[open]]:border-coral/30 transition-colors"
              >
                <summary className="font-bold text-sm text-[#0D0D0D] list-none flex items-center justify-between gap-4">
                  {t(item.q)}
                  <span className="text-xs text-[#8c7e74] group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-4 text-sm text-[#8c7e74] leading-relaxed">{t(item.a)}</p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="bg-coral py-20 px-8">
        <div className="max-w-lg mx-auto text-center">
          <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="font-display font-black text-display-sm text-white leading-[0.92] mb-4">
            {t('donate.newsletter.title')}
          </motion.h2>
          <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} className="text-white/70 text-lg mb-10">
            {t('donate.newsletter.subtitle')}
          </motion.p>
          {newsletterDone ? (
            <motion.p initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-white text-lg font-semibold">
              {t('donate.newsletter.success')}
            </motion.p>
          ) : (
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2} className="flex items-center gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder={t('donate.newsletter.placeholder')}
                className="flex-1 px-5 py-3.5 rounded-xl text-sm outline-none text-[#0D0D0D] placeholder:text-[#b8aaa0]"
              />
              <button onClick={handleNewsletter} className="btn-dark whitespace-nowrap rounded-xl px-7 text-sm">
                {t('donate.newsletter.cta')}
              </button>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </PageTransition>
  );
}

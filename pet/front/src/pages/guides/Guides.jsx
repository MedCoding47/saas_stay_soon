import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import PageTransition from '../../components/animations/PageTransition';

const SPECIES = ['dog', 'cat', 'rabbit', 'bird', 'other'];

const SECTIONS = [
  { key: 'overview', icon: '📖', label: 'Overview' },
  { key: 'nutrition', icon: '🍽️', label: 'Nutrition' },
  { key: 'health', icon: '🏥', label: 'Health' },
  { key: 'grooming', icon: '✂️', label: 'Grooming' },
  { key: 'behavior', icon: '🧠', label: 'Behavior' },
  { key: 'housing', icon: '🏠', label: 'Housing' },
];

const HERO_IMAGES = {
  dog: 'https://images.unsplash.com/photo-1544568100-847a948585b9?w=800&q=80',
  cat: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&q=80',
  rabbit: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=800&q=80',
  bird: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800&q=80',
  other: 'https://images.unsplash.com/photo-1583511655826-05700d52f4d9?w=800&q=80',
};

const OTHER_PETS = [
  { key: 'hamster', emoji: '🐹', name: 'Hamster' },
  { key: 'guineaPig', emoji: '🐹', name: 'Guinea Pig' },
  { key: 'fish', emoji: '🐟', name: 'Fish' },
  { key: 'reptile', emoji: '🦎', name: 'Reptile' },
];

const ICONS = { dog: '🐕', cat: '🐈', rabbit: '🐇', bird: '🦜', other: '🐹' };

export default function Guides() {
  const { t, i18n } = useTranslation();
  const [activeSpecies, setActiveSpecies] = useState('dog');
  const [activeSection, setActiveSection] = useState('overview');
  const isRTL = i18n.language === 'ar';

  return (
    <PageTransition>
      <Navbar />

      <section className="relative min-h-[75vh] flex items-center overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1400&q=80"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/60 to-[#0D0D0D]/20" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-8 pt-32 pb-24 text-center">
          <motion.span
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="tag tag-coral mb-6 inline-block"
          >
            🐾 {t('navbar.guides')}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="font-display font-black text-display-md md:text-display-xl text-white mb-6 leading-tight"
          >
            {t('guides.hero.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24 }}
            className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
          >
            {t('guides.hero.subtitle')}
          </motion.p>
        </div>
      </section>

      <div className="sticky top-0 z-30 bg-[#0D0D0D] border-b border-white/10" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-5xl mx-auto px-8 py-4">
          <div className="flex gap-3 justify-center overflow-x-auto no-scrollbar">
            {SPECIES.map((s) => (
              <button
                key={s}
                onClick={() => { setActiveSpecies(s); setActiveSection('overview'); }}
                className={`group relative flex-shrink-0 px-6 py-3.5 rounded-full text-sm font-bold tracking-wider uppercase transition-all duration-300 ${
                  activeSpecies === s
                    ? 'bg-[#D85A30] text-white shadow-lg shadow-coral/30 scale-105'
                    : 'bg-white/10 text-white/60 hover:text-white hover:bg-white/20 border border-white/10'
                }`}
              >
                <span className={isRTL ? 'ml-2' : 'mr-2'}>{ICONS[s]}</span>
                {t(`guides.section.${s}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="bg-[#FAF7F2] py-20 px-8" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSpecies}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4 }}
            >
              <div className="relative rounded-4xl overflow-hidden mb-12 min-h-[320px] md:min-h-[420px] shadow-card">
                <img
                  src={HERO_IMAGES[activeSpecies]}
                  alt=""
                  className="w-full h-full absolute inset-0 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D]/90 via-[#0D0D0D]/30 to-transparent" />
                <div className="relative z-10 h-full flex items-end p-8 md:p-12">
                  <div>
                    <span className="text-5xl md:text-7xl mb-3 block drop-shadow-lg">
                      {ICONS[activeSpecies]}
                    </span>
                    <h2 className="font-display font-black text-display-sm md:text-display-md text-white drop-shadow-lg">
                      {t(`guides.${activeSpecies}.title`)}
                    </h2>
                  </div>
                </div>
              </div>

              {activeSpecies !== 'other' && (
                <div className="flex flex-wrap gap-2 mb-10 justify-center">
                  {SECTIONS.map((s) => (
                    <button
                      key={s.key}
                      onClick={() => setActiveSection(s.key)}
                      className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
                        activeSection === s.key
                          ? 'bg-[#0D0D0D] text-white shadow-lg'
                          : 'bg-white text-[#8c7e74] border border-[#E8E0D8] hover:border-[#D85A30] hover:text-[#D85A30]'
                      }`}
                    >
                      {s.icon} {s.label}
                    </button>
                  ))}
                </div>
              )}

              {activeSpecies !== 'other' ? (
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <div className="bg-white rounded-3xl p-8 md:p-12 shadow-card border border-[#E8E0D8]">
                    <div className="flex items-start gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-[#FAF7F2] flex items-center justify-center flex-shrink-0 text-2xl shadow-sm">
                        {SECTIONS.find(s => s.key === activeSection)?.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display font-bold text-2xl text-[#0D0D0D] mb-4">
                          {SECTIONS.find(s => s.key === activeSection)?.label}
                        </h3>
                        <p className="text-[#8c7e74] text-lg leading-relaxed">
                          {t(`guides.${activeSpecies}.${activeSection}`)}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {OTHER_PETS.map((pet, i) => (
                    <motion.div
                      key={pet.key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.35 }}
                      className="bg-white rounded-3xl p-8 shadow-card border border-[#E8E0D8] hover:shadow-card-hover transition-shadow duration-300"
                    >
                      <span className="text-3xl mb-3 block">{pet.emoji}</span>
                      <h3 className="font-display font-bold text-xl text-[#0D0D0D] mb-3">
                        {pet.name}
                      </h3>
                      <p className="text-[#8c7e74] leading-relaxed">
                        {t(`guides.other.${pet.key}`)}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <Footer />
    </PageTransition>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import PageTransition from '../../components/animations/PageTransition';
import InteractiveBentoGallery from '../../components/ui/interactive-bento-gallery';
import GLSLHills from '../../components/ui/glsl-hills';

const galleryItems = [
  { id: 1, type: 'image', title: 'Bella', desc: 'Sweet dog looking for a home', url: '/images/bella.jpg', span: 'md:col-span-1 md:row-span-3 sm:col-span-1 sm:row-span-2' },
  { id: 2, type: 'image', title: 'Max', desc: 'Playful pup full of energy', url: '/images/max.jpg', span: 'md:col-span-2 md:row-span-2 sm:col-span-2 sm:row-span-2' },
  { id: 3, type: 'image', title: 'Luna', desc: 'Elegant feline exploring nature', url: '/images/luna.jpg', span: 'md:col-span-1 md:row-span-3 sm:col-span-2 sm:row-span-2' },
  { id: 4, type: 'image', title: 'Charlie', desc: 'Friendly dog enjoying the sun', url: '/images/charlie.jpg', span: 'md:col-span-2 md:row-span-2 sm:col-span-1 sm:row-span-2' },
  { id: 5, type: 'image', title: 'Coco', desc: 'Cheerful companion ready to play', url: '/images/coco.jpg', span: 'md:col-span-1 md:row-span-3 sm:col-span-1 sm:row-span-2' },
  { id: 6, type: 'image', title: 'Daisy', desc: 'Gentle soul looking for love', url: '/images/daisy.jpg', span: 'md:col-span-2 md:row-span-2 sm:col-span-1 sm:row-span-2' },
  { id: 7, type: 'image', title: 'Rocky', desc: 'Majestic dog in the field', url: '/images/rocky.jpg', span: 'md:col-span-1 md:row-span-3 sm:col-span-1 sm:row-span-2' },
];

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
        <div className="absolute inset-0 bg-[#0D0D0D]">
          <GLSLHills width="100%" height="100%" cameraZ={120} planeSize={200} speed={0.3} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/60 to-transparent z-[2]" />
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
        <div className="container mx-auto px-4 max-w-6xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSpecies}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4 }}
            >
              <div className="grid md:grid-cols-2 gap-8 md:gap-12 relative overflow-x-hidden">
                <div className="md:order-2 relative">
                  <div className="absolute -z-10 w-72 h-72 rounded-full bg-[#f8b3c4] blur-3xl opacity-20 -top-10 -left-10" />
                  <img
                    src={HERO_IMAGES[activeSpecies]}
                    alt={t(`guides.${activeSpecies}.title`)}
                    className="rounded-2xl shadow-2xl w-full h-[400px] md:h-[600px] object-cover filter brightness-105"
                  />
                </div>

                <div className="md:order-1 flex flex-col justify-between">
                  <div className="flex flex-col h-full justify-between">
                    <h1 className="text-5xl md:text-7xl font-bold text-[#0D0D0D] leading-tight tracking-tighter">
                      {t(`guides.${activeSpecies}.title`)}
                    </h1>

                    {activeSpecies !== 'other' ? (
                      <>
                        <ul className="space-y-2 tracking-tighter text-lg text-[#0D0D0D]/90 mt-8 md:mt-12">
                          {SECTIONS.map((s, index) => (
                            <motion.li
                              key={s.key}
                              initial={{ opacity: 0.8 }}
                              whileHover={{
                                opacity: 1,
                                y: -3,
                                transition: { duration: 0.4, ease: 'easeOut' },
                              }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <button
                                onClick={() => setActiveSection(s.key)}
                                className={`cursor-pointer transition-all duration-300 ${
                                  activeSection === s.key
                                    ? 'text-[#D85A30] font-bold'
                                    : 'text-[#0D0D0D]/70 hover:text-[#0D0D0D]'
                                }`}
                              >
                                <span className={isRTL ? 'ml-3' : 'mr-3'}>{s.icon}</span>
                                {s.label}
                              </button>
                            </motion.li>
                          ))}
                        </ul>

                        <div className="mt-auto pt-8 md:pt-12">
                          <h2 className="text-sm font-semibold text-[#D85A30] tracking-[0.2em] uppercase">
                            {t('guides.sectionLabel', 'CARE GUIDE')} 2025
                          </h2>
                          <motion.p
                            key={activeSection}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="text-base md:text-lg text-[#0D0D0D]/80 max-w-md pt-4 tracking-tight leading-relaxed"
                          >
                            {t(`guides.${activeSpecies}.${activeSection}`)}
                          </motion.p>
                        </div>
                      </>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 md:mt-12">
                        {OTHER_PETS.map((pet, i) => (
                          <motion.div
                            key={pet.key}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1, duration: 0.35 }}
                            className="bg-white rounded-2xl p-6 shadow-card border border-[#E8E0D8] hover:shadow-card-hover transition-shadow duration-300"
                          >
                            <span className="text-3xl mb-2 block">{pet.emoji}</span>
                            <h3 className="font-display font-bold text-lg text-[#0D0D0D] mb-2">
                              {pet.name}
                            </h3>
                            <p className="text-[#8c7e74] text-sm leading-relaxed">
                              {t(`guides.other.${pet.key}`)}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* GALLERY SECTION */}
      <section className="bg-white border-t border-[#E8E0D8] py-16 px-8">
        <div className="max-w-6xl mx-auto">
          <InteractiveBentoGallery
            mediaItems={galleryItems}
            title={t('guides.gallery.title', 'Pet Gallery')}
            description={t('guides.gallery.description', 'Drag and explore our collection of pet moments')}
          />
        </div>
      </section>

      <Footer />
    </PageTransition>
  );
}

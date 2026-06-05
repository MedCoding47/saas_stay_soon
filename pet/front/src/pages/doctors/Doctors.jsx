import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../../api/client';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import PageTransition from '../../components/animations/PageTransition';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function Doctors() {
  const { t } = useTranslation();
  const [vets, setVets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.get('/public/veterinaires').then(({ data }) => {
      if (!cancelled) setVets(data || []);
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <PageTransition><Navbar /><div className="min-h-screen pt-24 flex items-center justify-center bg-[#FAF7F2]"><LoadingSpinner /></div><Footer /></PageTransition>;

  return (
    <PageTransition>
      <Navbar />
      <main className="min-h-screen bg-[#FAF7F2]">
        {/* HERO */}
        <section className="bg-[#0D0D0D] py-16 px-8">
          <div className="max-w-6xl mx-auto">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display font-black text-[56px] text-white leading-[0.9]">
              {t('doctors.hero.title')}
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-white/50 text-lg mt-4 max-w-lg">
              {t('doctors.hero.subtitle')}
            </motion.p>
          </div>
        </section>

        {/* VET CARDS */}
        <section className="max-w-6xl mx-auto px-8 py-16">
          {vets.length === 0 ? (
            <div className="text-center py-20 text-[#8c7e74]">{t('doctors.noResults')}</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {vets.map((vet, i) => (
                <motion.div key={vet.clinicName + i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-3xl border border-[#E8E0D8] overflow-hidden hover:-translate-y-1 hover:shadow-card-hover transition-all duration-300 cursor-pointer"
                >
                  <div className="bg-[#FAF7F2] p-6 flex items-center gap-4">
                    {vet.profilePictureUrl ? (
                      <img src={vet.profilePictureUrl} alt="" className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-[#0D0D0D] text-white font-display font-black text-2xl flex items-center justify-center flex-shrink-0">
                        {vet.userName?.[0] || 'V'}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-[#0D0D0D] text-lg">{vet.userName}</h3>
                      <p className="text-[#8c7e74] text-sm">{vet.clinicName}</p>
                    </div>
                  </div>
                  <div className="border-t border-[#E8E0D8]" />
                  <div className="p-6">
                    <p className="text-sm text-[#8c7e74] flex items-center gap-2">📍 {vet.location}</p>
                    {vet.phone && <p className="text-sm text-[#8c7e74] flex items-center gap-2 mt-1">📞 {vet.phone}</p>}
                    {vet.formation && (
                      <span className="tag tag-teal mt-4 inline-flex">{vet.formation}</span>
                    )}
                    <button className="btn-dark w-full mt-4 rounded-2xl text-sm">{t('doctors.bookConsultation')}</button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* MAP SECTION */}
        <section className="bg-white border-t border-[#E8E0D8] py-16 px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-display font-bold text-display-sm text-[#0D0D0D] mb-8">{t('doctors.findNearby')}</h2>
            <div className="rounded-3xl overflow-hidden border border-[#E8E0D8] h-80 w-full">
              {vets.length > 0 && vets[0]?.latitude && vets[0]?.longitude ? (
                <iframe
                  title="Vets map"
                  src={`https://maps.google.com/maps?q=${vets[0].latitude},${vets[0].longitude}&z=10&output=embed`}
                  className="w-full h-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <div className="w-full h-full bg-[#FAF7F2] flex items-center justify-center text-6xl text-[#b8aaa0]">🗺️</div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </PageTransition>
  );
}

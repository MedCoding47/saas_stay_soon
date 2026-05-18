import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/client';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import PageTransition from '../../components/animations/PageTransition';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function Doctors() {
  const [vets, setVets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.get('/public/veterinaires').then(({ data }) => {
      if (!cancelled) setVets(data || []);
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <PageTransition><Navbar /><div className="min-h-screen pt-24 flex items-center justify-center"><LoadingSpinner /></div><Footer /></PageTransition>;

  return (
    <PageTransition>
      <Navbar />
      <main className="min-h-screen bg-warm pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Our Veterinaires</h1>
            <p className="text-lg text-muted max-w-2xl mx-auto">Professional veterinary doctors ready to care for your pets</p>
          </div>

          {vets.length === 0 ? (
            <div className="text-center py-20 text-muted">No veterinarians available at the moment.</div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {vets.map((vet, i) => (
                <motion.div key={vet.clinicName + i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-3xl shadow-card overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      {vet.profilePictureUrl ? (
                        <img src={vet.profilePictureUrl} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-coral/30" />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold">
                          {vet.userName?.[0] || 'V'}
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-gray-900">{vet.userName}</h3>
                        <p className="text-sm text-coral font-medium">{vet.clinicName}</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-muted mb-4">
                      <p>📍 {vet.location}</p>
                      {vet.phone && <p>📞 {vet.phone}</p>}
                      {vet.formation && <p>🎓 {vet.formation}</p>}
                    </div>

                    {vet.description && (
                      <p className="text-sm text-gray-700 mb-4 line-clamp-3">{vet.description}</p>
                    )}

                    {vet.latitude && vet.longitude && (
                      <div className="rounded-xl overflow-hidden mb-4">
                        <iframe
                          title={`${vet.clinicName} location`}
                          src={`https://maps.google.com/maps?q=${vet.latitude},${vet.longitude}&z=15&output=embed`}
                          className="w-full h-48"
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      </div>
                    )}

                    {vet.adviceList && vet.adviceList.length > 0 && (
                      <div className="border-t border-gray-100 pt-4 mt-4">
                        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Latest Advice</p>
                        {vet.adviceList.map((a, j) => (
                          <div key={j} className="mb-2 last:mb-0 p-3 bg-warm rounded-xl">
                            <p className="font-medium text-gray-900 text-sm">{a.title}</p>
                            <p className="text-xs text-muted mt-0.5">{a.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {vet.recommendations && vet.recommendations.length > 0 && (
                      <div className="border-t border-gray-100 pt-4 mt-4">
                        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Recommendations</p>
                        {vet.recommendations.map((r, j) => (
                          <div key={j} className="mb-2 last:mb-0 p-3 bg-amber-50 rounded-xl">
                            <p className="font-medium text-gray-900 text-sm">{r.title}</p>
                            <p className="text-xs text-muted mt-0.5">{r.description}</p>
                            <div className="flex gap-2 mt-1">
                              {r.targetSpecies && <span className="text-xs bg-amber-100 rounded-full px-2 py-0.5 text-amber-700">{r.targetSpecies}</span>}
                              {r.targetAgeRange && <span className="text-xs bg-amber-100 rounded-full px-2 py-0.5 text-amber-700">{r.targetAgeRange}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </PageTransition>
  );
}

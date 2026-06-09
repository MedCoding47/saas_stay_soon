import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import api from '../../api/client';
import samplePets from '../../data/samplePets';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PageTransition from '../../components/animations/PageTransition';
import ReadinessQuiz from '../../components/adoption/ReadinessQuiz';
import PetCard from '../../components/pets/PetCard';
import { useFavorites } from '../../hooks/useFavorites';

const speciesEmoji = {
  Dog: '🐕', Cat: '🐈', Rabbit: '🐰', Bird: '🐦', Parrot: '🦜',
  Hamster: '🐹', Fish: '🐟', Turtle: '🐢', Horse: '🐴',
};

const petStatusLabel = (s) => {
  if (typeof s === 'number') return ({ 1: 'Available', 2: 'Adopted', 3: 'Pending' })[s] || 'Available';
  const map = { Available: 'Available', ApplicationReceived: 'Pending', UnderReview: 'Pending', Approved: 'Pending', Completed: 'Adopted' };
  return map[s] || s || 'Available';
};

function formatAge(years, t) {
  if (years == null) return '';
  if (years < 1) return t('pets.details.age.lessThan1');
  const y = Math.floor(years);
  return t(y === 1 ? 'pets.details.age.year' : 'pets.details.age.years', { count: y });
}

function estimatedBirth(pet, t) {
  const totalMonths = pet.ageMonths || (pet.age != null ? pet.age * 12 : null);
  if (totalMonths == null) return '';
  const now = new Date();
  const totalDays = totalMonths * 30.44;
  const birth = new Date(now.getTime() - totalDays * 86400000);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${t('common.born')} ~${months[birth.getMonth()]} ${birth.getFullYear()}`;
}

function BoolIcon({ value }) {
  if (value === true) return <span className="text-teal font-bold">✓</span>;
  if (value === false) return <span className="text-coral font-bold">✗</span>;
  return <span className="text-[#b8aaa0]">—</span>;
}

function productEmoji(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('toy') || n.includes('jouet') || n.includes('لعبة')) return '🎾';
  if (n.includes('bed') || n.includes('panier') || n.includes('lit') || n.includes('سرير')) return '🛏️';
  if (n.includes('bowl') || n.includes('gamelle') || n.includes('plat') || n.includes('طبق') || n.includes('food') || n.includes('nourriture') || n.includes('طعام') || n.includes('eau') || n.includes('ماء')) return '🥣';
  if (n.includes('collar') || n.includes('laisse') || n.includes('collier') || n.includes('طوق') || n.includes('مقود') || n.includes('leash')) return '📿';
  return '📦';
}

export default function PetDetails() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [petProducts, setPetProducts] = useState([]);
  const { isFavorited, toggleFavorite } = useFavorites();

  const token = localStorage.getItem('sh-token');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.get(`/pets/${id}`)
      .then(({ data }) => { if (!cancelled) setPet(data); })
      .catch(() => {
        if (!cancelled) {
          const found = samplePets.find((p) => String(p.id) === String(id));
          if (found) setPet(found);
          else navigate('/pets');
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id, navigate]);

  useEffect(() => {
    if (!pet) return;
    api.get(`/pets/${id}/products`)
      .then(({ data }) => setPetProducts(data?.$values || data || []))
      .catch(() => setPetProducts([]));
  }, [pet, id]);

  const handleAdoptClick = () => {
    if (!token) { navigate('/login/client'); return; }
    setShowQuiz(true);
  };

  const handleInfoClick = () => {
    if (!token) { navigate('/login/client'); return; }
    navigate(`/client/messages?pet=${pet.id}`);
  };

  const similarPets = samplePets
    .filter((p) => String(p.id) !== String(id))
    .slice(0, 3);

  const imgSrc = pet?.imageUrl;
  const status = petStatusLabel(pet?.status);
  const isAvailable = status === 'Available';

  if (loading) {
    return (
      <PageTransition>
        <Navbar />
        <div className="min-h-screen pt-24 flex items-center justify-center bg-[#FAF7F2]">
          <LoadingSpinner text={t('common.loadingPet')} />
        </div>
        <Footer />
      </PageTransition>
    );
  }
  if (!pet) return null;

  return (
    <PageTransition>
      <Navbar />
      <main className="min-h-screen bg-[#FAF7F2]">
        {/* TOP SECTION — two column */}
        <div className="max-w-6xl mx-auto px-8 pt-28 pb-0 grid md:grid-cols-2 gap-12">
          {/* LEFT */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <p className="text-xs text-[#8c7e74] mb-6">
              <Link to="/" className="hover:text-[#0D0D0D] transition-colors">{t('common.home')}</Link>
              <span className="mx-2">/</span>
              <Link to="/pets" className="hover:text-[#0D0D0D] transition-colors">{t('common.browse')}</Link>
              <span className="mx-2">/</span>
              <span className="text-[#0D0D0D]">{pet.name}</span>
            </p>

            <h1 className="font-display font-black text-[72px] leading-none tracking-tight text-[#0D0D0D]">
              {pet.name}
            </h1>

            <div className="flex gap-2 mt-4 flex-wrap">
              <span className="tag tag-dark">{speciesEmoji[pet.type] || '🐾'} {pet.type}</span>
              {pet.breed && <span className="tag px-4 py-1.5 rounded-full border border-[#E8E0D8] text-[#8c7e74] text-[10px] font-bold tracking-widest uppercase">{pet.breed}</span>}
              <span className="tag px-4 py-1.5 rounded-full border border-[#E8E0D8] text-[#8c7e74] text-[10px] font-bold tracking-widest uppercase">{formatAge(pet.age, t)}</span>
              {pet.isSos && <span className="tag px-3 py-1.5 rounded-full bg-coral text-white text-[10px] font-bold tracking-widest uppercase">{t('pets.details.sos')}</span>}
            </div>

            <div className="flex gap-6 mt-6 text-sm text-[#8c7e74]">
              <span>🎂 {formatAge(pet.age, t)}</span>
              {estimatedBirth(pet, t) && <span>📅 {estimatedBirth(pet, t)}</span>}
              <span>📍 {pet.location || t('common.unknownLocation')}</span>
            </div>

            {pet.description && (
              <p className="text-lg text-[#2A2A2A] mt-6 leading-relaxed font-serif italic">
                "{pet.description}"
              </p>
            )}

            {/* Health */}
            <div className="mt-8">
              <p className="text-xs font-bold tracking-widest uppercase text-[#8c7e74] mb-4">{t('pets.details.health')}</p>
              <div className="space-y-0">
                {[
                  { label: t('pets.details.health.vaccinated', 'Vaccinated'), value: pet.isVaccinated },
                  { label: t('pets.details.health.sterilized', 'Sterilized / Neutered'), value: pet.isSterilized },
                  { label: t('pets.details.health.dewormed', 'Dewormed'), value: pet.isDewormed },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-3 border-b border-[#E8E0D8] text-sm">
                    <span className="text-[#2A2A2A]">{item.label}</span>
                    <BoolIcon value={item.value} />
                  </div>
                ))}
                {pet.healthNotes && (
                  <div className="flex items-center justify-between py-3 text-sm">
                    <span className="text-[#2A2A2A]">{t('common.notes')}</span>
                    <span className="text-[#8c7e74] text-xs text-right max-w-[200px]">{pet.healthNotes}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Living Conditions & Behavior */}
            <div className="mt-8">
              <p className="text-xs font-bold tracking-widest uppercase text-[#8c7e74] mb-4">{t('pets.details.livingConditions')}</p>
              <div className="space-y-0">
                {pet.size && (
                  <div className="flex items-center justify-between py-3 border-b border-[#E8E0D8] text-sm">
                    <span className="text-[#2A2A2A]">{t('common.size')}</span>
                    <span className="font-medium text-[#0D0D0D]">{t('common.size.' + pet.size.toLowerCase(), pet.size)}</span>
                  </div>
                )}
                {pet.energyLevel && (
                  <div className="flex items-center justify-between py-3 border-b border-[#E8E0D8] text-sm">
                    <span className="text-[#2A2A2A]">{t('pets.details.energyLevel')}</span>
                    <span className="font-medium text-[#0D0D0D]">{t('common.energy.' + pet.energyLevel.replace(/\s+/g, '').replace(/^./, c => c.toLowerCase()), pet.energyLevel)}</span>
                  </div>
                )}
                {pet.needsGarden != null && (
                  <div className="flex items-center justify-between py-3 border-b border-[#E8E0D8] text-sm">
                    <span className="text-[#2A2A2A]">{t('pets.details.needsGarden')}</span>
                    <BoolIcon value={pet.needsGarden} />
                  </div>
                )}
                {pet.needsGarden != null && (
                  <div className="flex items-center justify-between py-3 border-b border-[#E8E0D8] text-sm">
                    <span className="text-[#2A2A2A]">{t('pets.details.apartmentOk')}</span>
                    <BoolIcon value={!pet.needsGarden} />
                  </div>
                )}
                <div className="flex items-center justify-between py-3 border-b border-[#E8E0D8] text-sm">
                  <span className="text-[#2A2A2A]">{t('pets.details.behavior.goodWithKids', 'Good with kids')}</span>
                  <BoolIcon value={pet.goodWithKids} />
                </div>
                <div className="flex items-center justify-between py-3 border-b border-[#E8E0D8] text-sm">
                  <span className="text-[#2A2A2A]">{t('pets.details.behavior.goodWithDogs', 'Good with dogs')}</span>
                  <BoolIcon value={pet.goodWithDogs} />
                </div>
                <div className="flex items-center justify-between py-3 border-b border-[#E8E0D8] text-sm">
                  <span className="text-[#2A2A2A]">{t('pets.details.behavior.goodWithCats', 'Good with cats')}</span>
                  <BoolIcon value={pet.goodWithCats} />
                </div>
                {pet.behaviorNotes && (
                  <div className="py-3 text-sm"><span className="text-[#8c7e74] text-xs">{pet.behaviorNotes}</span></div>
                )}
              </div>
            </div>

            {/* CTA */}
            <div className="flex gap-3 mt-10 pb-8">
              <button onClick={handleAdoptClick} disabled={!isAvailable} className="btn-dark px-8">
                {t('pets.details.adopt')}
              </button>
              <button onClick={handleInfoClick} className="btn-outline px-8">
                {t('pets.details.contact')}
              </button>
              <button onClick={() => toggleFavorite(pet)} className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg transition-all flex-shrink-0 ${
                isFavorited(pet.id) ? 'bg-coral border-coral text-white' : 'bg-white border-[#E8E0D8] text-[#8c7e74] hover:border-coral hover:text-coral'
              }`}>
                {isFavorited(pet.id) ? '♥' : '♡'}
              </button>
            </div>

            {!token && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mt-6">
                <p className="text-sm font-bold text-amber-900 mb-1">{t('pets.details.createAccount')}</p>
                <p className="text-sm text-amber-800 leading-relaxed">{t('pets.details.createAccountDesc')}</p>
                <div className="flex gap-3 mt-4">
                  <button onClick={() => navigate('/register/client')} className="bg-amber-900 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-amber-950 transition-colors">{t('auth.register.createAccount')}</button>
                  <button onClick={() => navigate('/login/client')} className="border border-amber-300 text-amber-900 px-5 py-2 rounded-xl text-sm font-semibold hover:bg-amber-100 transition-colors">{t('auth.login.signIn', 'Log in')}</button>
                </div>
              </div>
            )}
          </motion.div>

          {/* RIGHT */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="bg-white rounded-3xl border border-[#E8E0D8] h-96 flex items-center justify-center text-[120px] overflow-hidden">
              {imgSrc ? (
                <img src={imgSrc} alt={pet.name} className="w-full h-full object-cover" />
              ) : (
                <span>{speciesEmoji[pet.type] || '🐾'}</span>
              )}
            </div>
            <div className="flex justify-center gap-2 mt-4">
              <span className="w-2.5 h-2.5 rounded-full bg-coral" />
            </div>
          </motion.div>
        </div>

        {/* ACCESSORIES STRIP — only shows when enterprise has associated products */}
        {petProducts.length > 0 && (
          <section className="bg-white border-y border-[#E8E0D8] py-12 px-8 mt-8">
            <div className="max-w-6xl mx-auto">
              <h2 className="font-display font-bold text-2xl text-[#0D0D0D] mb-8">{t('pets.details.accessories')}</h2>
              <div className="flex gap-4 overflow-x-auto no-scrollbar">
                {petProducts.map((item, i) => (
                  <motion.div key={item.id || i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-[#FAF7F2] rounded-2xl p-6 border border-[#E8E0D8] text-center w-48 flex-shrink-0">
                    {item.imageUrl ? (
                      <div className="w-16 h-16 mx-auto mb-3 rounded-xl overflow-hidden bg-white border border-[#E8E0D8] flex items-center justify-center">
                        <img src={item.imageUrl} alt={item.name} className="max-w-full max-h-full object-contain" />
                      </div>
                    ) : (
                      <div className="text-4xl mb-3">{productEmoji(item.name)}</div>
                    )}
                    <p className="font-bold text-sm text-[#0D0D0D]">{item.name}</p>
                    {item.price && <p className="text-coral font-bold text-sm mt-1">{parseFloat(item.price) > 0 ? `${parseFloat(item.price).toFixed(2)} MAD` : item.price}</p>}
                    <button className="btn-dark w-full mt-3 text-xs py-2 rounded-xl">{t('common.shopNow')}</button>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* SHELTER INFO */}
        <section className="max-w-6xl mx-auto px-8 py-16 grid md:grid-cols-2 gap-8">
          <div className="rounded-3xl overflow-hidden border border-[#E8E0D8] h-72">
            <div className="w-full h-full bg-[#FAF7F2] flex items-center justify-center text-6xl text-[#b8aaa0]">🗺️</div>
          </div>
          <div className="bg-[#0D0D0D] rounded-3xl p-8">
            <p className="font-display font-bold text-white text-2xl">{pet.ownerName || t('pets.details.shelter.defaultName', 'Nino Shelter')}</p>
            <div className="mt-4 space-y-2 text-sm">
              <p className="text-white/50 flex items-center gap-2">📍 {pet.location || t('common.morocco')}</p>
              {pet.shelterAddress && <p className="text-white/50 flex items-center gap-2">🏠 {pet.shelterAddress}</p>}
              {pet.ownerPhone ? (
                <a href={`tel:${pet.ownerPhone}`} className="text-white/50 flex items-center gap-2 hover:text-white transition-colors">📞 {pet.ownerPhone}</a>
              ) : (
                <p className="text-white/50 flex items-center gap-2">📞 +212 5XX XX XX XX</p>
              )}
              {pet.ownerEmail && (
                <a href={`mailto:${pet.ownerEmail}`} className="text-white/50 flex items-center gap-2 hover:text-white transition-colors">✉️ {pet.ownerEmail}</a>
              )}
            </div>
            <div className="text-white/40 text-xs mt-4 space-y-1">
              {pet.shelterHours ? (
                pet.shelterHours.split('\n').map((line, i) => <p key={i}>{line}</p>)
              ) : (
                <>
                  <p>{t('pets.details.shelter.hoursWeekdays', 'Mon-Fri: 9:00 – 17:00')}</p>
                  <p>{t('pets.details.shelter.hoursSaturday', 'Saturday: 10:00 – 16:00')}</p>
                  <p>{t('pets.details.shelter.hoursSunday', 'Sunday: Closed')}</p>
                </>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              {pet.shelterMapsUrl && (
                <a href={pet.shelterMapsUrl} target="_blank" rel="noopener noreferrer" className="btn-outline-white flex-1 text-sm text-center">
                  {t('pets.details.shelter.directions')}
                </a>
              )}
              {pet.ownerWebsite && (
                <a href={pet.ownerWebsite} target="_blank" rel="noopener noreferrer" className="btn-outline-white flex-1 text-sm text-center">
                  {t('pets.details.shelter.visitWebsite')}
                </a>
              )}
              {!pet.shelterMapsUrl && !pet.ownerWebsite && (
                <button className="btn-outline-white w-full text-sm">{t('pets.details.shelter.visit', 'Visit Shelter')}</button>
              )}
            </div>
          </div>
        </section>

        {/* SIMILAR PETS */}
        <section className="bg-[#FAF7F2] py-16 px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-display font-bold text-display-sm text-[#0D0D0D] mb-10">{t('pets.details.similar')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {similarPets.map((p, i) => (
                <motion.div key={p.id || i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <PetCard
                    pet={p}
                    isFavorited={isFavorited(p.id)}
                    onToggleFavorite={toggleFavorite}
                    t={t}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ADOPTION CONDITIONS */}
        <section className="bg-white border-t border-[#E8E0D8] py-16 px-8">
          <div className="max-w-6xl mx-auto">
            <span className="tag tag-outline mb-4">{t('common.conditions')}</span>
            <h2 className="font-display font-bold text-display-sm text-[#0D0D0D] mt-4 mb-6">{t('pets.details.adoptionFee')}</h2>
            <p className="text-[#8c7e74] leading-relaxed mb-3">{t('pets.details.conditions.p1')}</p>
            <p className="text-[#8c7e74] leading-relaxed mb-10">{t('pets.details.conditions.p2')}</p>

            <div className="grid md:grid-cols-2 gap-12 items-start">
              {/* Left: required docs + financial */}
              <div className="space-y-8">
                <div>
                  <p className="text-xs font-bold tracking-widest uppercase text-[#8c7e74] mb-4">{t('pets.details.conditions.requiredDocs')}</p>
                  <ul className="space-y-3">
                    {['docCIN', 'docAddress', 'docCommitment'].map((key) => (
                      <li key={key} className="flex items-start gap-3 text-sm text-[#0D0D0D]">
                        <span className="mt-0.5 w-5 h-5 rounded-full bg-coral-light text-coral flex items-center justify-center text-xs flex-shrink-0">✓</span>
                        {t(`pets.details.conditions.${key}`)}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                  <p className="text-xs font-bold tracking-widest uppercase text-amber-800 mb-2">{t('pets.details.conditions.financial')}</p>
                  <p className="text-sm text-amber-900 leading-relaxed">{t('pets.details.conditions.financialDesc')}</p>
                </div>
                <div className="bg-sky-50 border border-sky-200 rounded-2xl p-5">
                  <p className="text-xs font-bold tracking-widest uppercase text-sky-800 mb-2">⏳ {t('pets.details.conditions.cecTitle')}</p>
                  <p className="text-sm text-sky-900 leading-relaxed">{t('pets.details.conditions.cecDesc')}</p>
                </div>
              </div>

              {/* Right: fee cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { labelKey: 'pets.details.fee.dog', amount: '800 DH' },
                  { labelKey: 'pets.details.fee.puppy', amount: '1 000 DH' },
                  { labelKey: 'pets.details.fee.cat', amount: '500 DH' },
                  { labelKey: 'pets.details.fee.kitten', amount: '600 DH' },
                  { labelKey: 'pets.details.fee.sos', amount: '150 DH' },
                  { labelKey: 'pets.details.fee.nac', amount: '100 DH' },
                ].map((item, i) => (
                  <motion.div key={item.labelKey} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className={`rounded-3xl p-6 text-center border ${
                    item.labelKey === 'pets.details.fee.sos' ? 'bg-coral/5 border-coral/20' : 'bg-[#FAF7F2] border-[#E8E0D8]'
                  }`}>
                    <p className="font-display font-black text-4xl text-coral">{item.amount}</p>
                    <p className="text-[#8c7e74] text-xs mt-1">{t(item.labelKey)}</p>
                    {item.labelKey === 'pets.details.fee.sos' && <span className="tag tag-coral text-[9px] mt-2 inline-block">{t('common.minimum', 'Min')}</span>}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* DONATION */}
        <section className="bg-[#0D0D0D] py-16 px-8">
          <div className="max-w-6xl mx-auto text-center">
            <span className="tag tag-coral mb-4">{t('common.donate')}</span>
            <h2 className="font-display font-black text-display-sm text-white mt-4">{t('pets.browser.donationTitle')}</h2>
            <p className="text-white/40 text-lg mt-4 mb-12 max-w-lg mx-auto">{t('pets.browser.donationSubtitle')}</p>
            <div className="grid md:grid-cols-3 gap-5 max-w-3xl mx-auto">
              {[{ amt: '$5' }, { amt: '$20' }, { amt: '$50' }].map((d, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center">
                  <p className="font-display font-black text-5xl text-white">{d.amt}</p>
                  <p className="text-white/30 text-xs mt-1">{t('common.taxDeductible')}</p>
                  <a href={`https://paypal.me/Medmoney642/${d.amt.replace('$', '')}`} target="_blank" rel="noopener noreferrer" className="btn-outline-white w-full mt-6 text-sm inline-block">{t('pets.browser.donate')}</a>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      {showQuiz && <ReadinessQuiz petId={pet.id} petName={pet.name} onClose={() => setShowQuiz(false)} />}
    </PageTransition>
  );
}

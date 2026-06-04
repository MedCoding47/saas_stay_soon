import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/client';
import samplePets from '../../data/samplePets';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PageTransition from '../../components/animations/PageTransition';

const speciesEmoji = {
  Dog: '🐕', Cat: '🐈', Rabbit: '🐰', Bird: '🐦', Parrot: '🦜',
  Hamster: '🐹', Fish: '🐟', Turtle: '🐢', Horse: '🐴',
};

const petStatusLabel = (s) => {
  if (typeof s === 'number') return ({ 1: 'Available', 2: 'Adopted', 3: 'Pending' })[s] || 'Available';
  const map = { Available: 'Available', ApplicationReceived: 'Pending', UnderReview: 'Pending', Approved: 'Pending', Completed: 'Adopted' };
  return map[s] || s || 'Available';
};

function formatAge(years) {
  if (years == null) return '—';
  if (years === 0) return 'Less than 1 year';
  if (years === 1) return '1 year';
  return `${years} years`;
}

function BoolIcon({ value }) {
  if (value === true) return <span className="text-teal font-bold">✓</span>;
  if (value === false) return <span className="text-coral font-bold">✗</span>;
  return <span className="text-[#b8aaa0]">—</span>;
}

const accessories = [
  { emoji: '🎾', name: 'Toys', price: 'From 25 MAD' },
  { emoji: '🛏️', name: 'Bed', price: 'From 150 MAD' },
  { emoji: '🥣', name: 'Bowl', price: 'From 30 MAD' },
  { emoji: '📿', name: 'Collar', price: 'From 45 MAD' },
];

export default function PetDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const handleAdoptClick = () => {
    if (!token) { navigate('/login/client'); return; }
    navigate(`/client/dashboard?adopt=${pet.id}`);
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
          <LoadingSpinner text="Loading pet..." />
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
              <Link to="/" className="hover:text-[#0D0D0D] transition-colors">Home</Link>
              <span className="mx-2">/</span>
              <Link to="/pets" className="hover:text-[#0D0D0D] transition-colors">Browse</Link>
              <span className="mx-2">/</span>
              <span className="text-[#0D0D0D]">{pet.name}</span>
            </p>

            <h1 className="font-display font-black text-[72px] leading-none tracking-tight text-[#0D0D0D]">
              {pet.name}
            </h1>

            <div className="flex gap-2 mt-4">
              <span className="tag tag-dark">{speciesEmoji[pet.type] || '🐾'} {pet.type}</span>
              {pet.breed && <span className="tag px-4 py-1.5 rounded-full border border-[#E8E0D8] text-[#8c7e74] text-[10px] font-bold tracking-widest uppercase">{pet.breed}</span>}
              <span className="tag px-4 py-1.5 rounded-full border border-[#E8E0D8] text-[#8c7e74] text-[10px] font-bold tracking-widest uppercase">{formatAge(pet.age)}</span>
            </div>

            <div className="flex gap-6 mt-6 text-sm text-[#8c7e74]">
              <span>📅 {formatAge(pet.age)}</span>
              <span>📍 {pet.location || 'Unknown location'}</span>
            </div>

            {pet.description && (
              <p className="text-lg text-[#2A2A2A] mt-6 leading-relaxed font-serif italic">
                "{pet.description}"
              </p>
            )}

            {/* Health */}
            <div className="mt-8">
              <p className="text-xs font-bold tracking-widest uppercase text-[#8c7e74] mb-4">Health Status</p>
              <div className="space-y-0">
                {[
                  { label: 'Vaccinated', value: pet.isVaccinated },
                  { label: 'Sterilized / Neutered', value: pet.isSterilized },
                  { label: 'Dewormed', value: pet.isDewormed },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-3 border-b border-[#E8E0D8] text-sm">
                    <span className="text-[#2A2A2A]">{item.label}</span>
                    <BoolIcon value={item.value} />
                  </div>
                ))}
                {pet.healthNotes && (
                  <div className="flex items-center justify-between py-3 text-sm">
                    <span className="text-[#2A2A2A]">Notes</span>
                    <span className="text-[#8c7e74] text-xs text-right max-w-[200px]">{pet.healthNotes}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Behavior */}
            <div className="mt-8">
              <p className="text-xs font-bold tracking-widest uppercase text-[#8c7e74] mb-4">Behavior</p>
              <div className="space-y-0">
                {[
                  { label: 'Good with kids', value: pet.goodWithKids },
                  { label: 'Good with dogs', value: pet.goodWithDogs },
                  { label: 'Good with cats', value: pet.goodWithCats },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-3 border-b border-[#E8E0D8] text-sm">
                    <span className="text-[#2A2A2A]">{item.label}</span>
                    <BoolIcon value={item.value} />
                  </div>
                ))}
                {pet.behaviorNotes && (
                  <div className="py-3 text-sm"><span className="text-[#8c7e74] text-xs">{pet.behaviorNotes}</span></div>
                )}
              </div>
            </div>

            {/* CTA */}
            <div className="flex gap-3 mt-10 pb-8">
              <button onClick={handleAdoptClick} disabled={!isAvailable} className="btn-dark px-8">
                I want to adopt
              </button>
              <button onClick={handleInfoClick} className="btn-outline px-8">
                Get more info
              </button>
            </div>
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

        {/* ACCESSORIES STRIP */}
        <section className="bg-white border-y border-[#E8E0D8] py-12 px-8 mt-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-display font-bold text-2xl text-[#0D0D0D] mb-8">Welcome your companion</h2>
            <div className="flex gap-4 overflow-x-auto no-scrollbar">
              {accessories.map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-[#FAF7F2] rounded-2xl p-6 border border-[#E8E0D8] text-center w-48 flex-shrink-0">
                  <div className="text-4xl mb-3">{item.emoji}</div>
                  <p className="font-bold text-sm text-[#0D0D0D]">{item.name}</p>
                  <p className="text-coral font-bold text-sm mt-1">{item.price}</p>
                  <button className="btn-dark w-full mt-3 text-xs py-2 rounded-xl">Shop now</button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* SHELTER INFO */}
        <section className="max-w-6xl mx-auto px-8 py-16 grid md:grid-cols-2 gap-8">
          <div className="rounded-3xl overflow-hidden border border-[#E8E0D8] h-72">
            <div className="w-full h-full bg-[#FAF7F2] flex items-center justify-center text-6xl text-[#b8aaa0]">🗺️</div>
          </div>
          <div className="bg-[#0D0D0D] rounded-3xl p-8">
            <p className="font-display font-bold text-white text-2xl">{pet.ownerName || 'Nino Shelter'}</p>
            <div className="mt-4 space-y-2 text-sm">
              <p className="text-white/50 flex items-center gap-2">📍 {pet.location || 'Morocco'}</p>
              <p className="text-white/50 flex items-center gap-2">📞 +212 5XX XX XX XX</p>
            </div>
            <div className="text-white/40 text-xs mt-4 space-y-1">
              <p>Mon-Fri: 9:00 – 17:00</p>
              <p>Saturday: 10:00 – 16:00</p>
              <p>Sunday: Closed</p>
            </div>
            <button className="btn-outline-white w-full mt-6 text-sm">Visit Shelter</button>
          </div>
        </section>

        {/* SIMILAR PETS */}
        <section className="bg-[#FAF7F2] py-16 px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-display font-bold text-display-sm text-[#0D0D0D] mb-10">Similar Pets</h2>
            <div className="grid md:grid-cols-3 gap-5">
              {similarPets.map((p, i) => (
                <motion.div key={p.id || i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} onClick={() => navigate(`/pets/${p.id}`)} className="bg-white rounded-3xl border border-[#E8E0D8] overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-card-hover transition-all duration-300">
                  <div className="bg-[#FAF7F2] h-40 flex items-center justify-center text-5xl">
                    {speciesEmoji[p.type] || '🐾'}
                  </div>
                  <div className="p-5">
                    <p className="font-bold text-[#0D0D0D]">{p.name}</p>
                    <p className="text-sm text-[#8c7e74] mt-0.5">{p.breed || 'Mixed Breed'}</p>
                    <button onClick={(e) => { e.stopPropagation(); navigate(`/pets/${p.id}`); }} className="btn-dark w-full mt-3 rounded-xl py-2.5 text-sm">View Pet</button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ADOPTION CONDITIONS */}
        <section className="bg-white border-t border-[#E8E0D8] py-16 px-8">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-start">
            <div>
              <span className="tag tag-outline mb-4">Conditions</span>
              <h2 className="font-display font-bold text-display-sm text-[#0D0D0D] mt-4">Adoption Conditions</h2>
              <p className="text-[#8c7e74] leading-relaxed mt-6">
                Adopting an animal is a long-term commitment. We ensure each adoption is well-prepared by verifying
                the living conditions, availability, and motivation of the adopter.
              </p>
              <p className="text-[#8c7e74] leading-relaxed mt-3">
                All our animals are vaccinated, sterilized, and identified before adoption.
                Post-adoption follow-up is provided to ensure the well-being of the animal.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { label: 'Dog', amount: '375 MAD' },
                { label: 'Small dog (< 6 mo)', amount: '365 MAD' },
                { label: 'Cat', amount: '175 MAD' },
              ].map((item, i) => (
                <motion.div key={item.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-[#FAF7F2] rounded-3xl p-8 text-center border border-[#E8E0D8]">
                  <p className="font-display font-black text-5xl text-coral">{item.amount}</p>
                  <p className="text-[#8c7e74] text-sm mt-1">{item.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </PageTransition>
  );
}

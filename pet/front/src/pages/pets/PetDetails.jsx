import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/client';
import samplePets from '../../data/samplePets';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PageTransition from '../../components/animations/PageTransition';
import ProductCard from '../../components/pets/ProductCard';
import ShelterInfoCard from '../../components/pets/ShelterInfoCard';
import SimilarPets from '../../components/pets/SimilarPets';

const speciesEmoji = {
  Dog: '🐕', Cat: '🐈', Rabbit: '🐰', Bird: '🐦', Parrot: '🦜',
  Hamster: '🐹', Fish: '🐟', Turtle: '🐢', Horse: '🐴',
};

const petStatusLabel = (s) => {
  if (typeof s === 'number') return ({ 1: 'Available', 2: 'Adopted', 3: 'Pending' })[s] || 'Available';
  const map = { Available: 'Available', ApplicationReceived: 'Pending', UnderReview: 'Pending', Approved: 'Pending', Completed: 'Adopted' };
  return map[s] || s || 'Available';
};

function formatAge(months) {
  if (months == null) return '—';
  if (months < 12) return `${months} months`;
  const y = Math.floor(months / 12);
  const m = months % 12;
  return m ? `${y} yr ${m} mo` : `${y} years`;
}

function BoolIcon({ value }) {
  if (value === true) return <span className="text-emerald-500 font-bold">✓</span>;
  if (value === false) return <span className="text-red-400 font-bold">✗</span>;
  return <span className="text-muted-light">—</span>;
}

export default function PetDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [photoIndex, setPhotoIndex] = useState(0);

  const token = localStorage.getItem('sh-token');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.get(`/pets/${id}`)
      .then(({ data }) => {
        if (!cancelled) setPet(data);
      })
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
    .filter((p) => String(p.id) !== String(id) && p.shelterName === pet?.shelterName)
    .slice(0, 3);

  const imgSrc = pet?.imageUrl || pet?.mainImageUrl;
  const status = petStatusLabel(pet?.status);
  const isAvailable = status === 'Available';

  if (loading) {
    return (
      <PageTransition>
        <Navbar />
        <div className="min-h-screen pt-24 flex items-center justify-center bg-warm">
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
      <main className="min-h-screen bg-white pb-20">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-4 text-sm text-muted"
        >
          <Link to="/" className="hover:text-coral transition-colors">Home</Link>
          <span className="mx-2">›</span>
          <Link to="/pets" className="hover:text-coral transition-colors">Browse</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-900 font-medium">{pet.name}</span>
        </motion.div>

        {/* TOP SECTION */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-5 gap-10">
            {/* Left - Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="md:col-span-3 space-y-6"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">{pet.name}</h1>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <span className="px-4 py-1.5 bg-coral text-white rounded-pill text-sm font-semibold">
                  {speciesEmoji[pet.type] || ''} {pet.type}
                </span>
                {pet.breed && (
                  <span className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-pill text-sm font-medium">
                    {pet.breed}
                  </span>
                )}
                <span className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-pill text-sm font-medium">
                  {formatAge(pet.ageMonths)}
                </span>
              </div>

              {/* Info rows */}
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <span>📅</span>
                  <span>Age: <strong>{formatAge(pet.ageMonths)}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📍</span>
                  <span>
                    {pet.shelterName || pet.city || 'Unknown shelter'}
                  </span>
                </div>
              </div>

              {/* Description */}
              {pet.description && (
                <p className="text-gray-600 leading-relaxed">{pet.description}</p>
              )}

              {/* Santé */}
              <div>
                <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Health</h3>
                <div className="bg-warm rounded-xl p-4 space-y-1.5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Vaccinated</span>
                    <BoolIcon value={pet.isVaccinated} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Sterilized / Neutered</span>
                    <BoolIcon value={pet.isSterilized} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Dewormed</span>
                    <BoolIcon value={pet.isDewormed} />
                  </div>
                  {pet.healthNotes && (
                    <div className="flex items-center justify-between pt-1.5 border-t border-warm-dark/50">
                      <span className="text-gray-600">Notes</span>
                      <span className="text-gray-500 text-xs text-right max-w-[200px]">{pet.healthNotes}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Comportement */}
              <div>
                <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Behavior</h3>
                <div className="bg-warm rounded-xl p-4 space-y-1.5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Good with kids</span>
                    <BoolIcon value={pet.goodWithKids} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Good with dogs</span>
                    <BoolIcon value={pet.goodWithDogs} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Good with cats</span>
                    <BoolIcon value={pet.goodWithCats} />
                  </div>
                  {pet.behaviorNotes && (
                    <div className="pt-1.5 border-t border-warm-dark/50">
                      <span className="text-gray-500 text-xs">{pet.behaviorNotes}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Vétérinaire */}
              {pet.vetPartnerName && (
                <div>
                  <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Partner Veterinarian</h3>
                  <div className="bg-warm rounded-xl p-4 text-sm">
                    <p className="font-medium text-gray-800">{pet.vetPartnerName}</p>
                    <p className="text-muted text-xs">{pet.vetPartnerClinic}</p>
                    {pet.lastVetCheckup && (
                      <p className="text-muted-light text-xs mt-1">Last checkup: {pet.lastVetCheckup}</p>
                    )}
                  </div>
                </div>
              )}

              {/* QR Code */}
              {pet.qrCodeId && (
                <div className="flex items-center gap-2 text-xs text-muted bg-warm rounded-xl px-4 py-3">
                  <span className="text-lg">📱</span>
                  <span>QR collar: <strong className="text-gray-700">{pet.qrCodeId}</strong></span>
                </div>
              )}

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  variant="primary"
                  className="flex-1 !rounded-pill !py-3"
                  onClick={handleAdoptClick}
                  disabled={!isAvailable}
                >
                  ♥ I want to adopt {pet.name}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 !rounded-pill !border-coral/30 !py-3"
                  style={{ borderColor: '#0F6E56', color: '#0F6E56' }}
                  onClick={handleInfoClick}
                >
                  ℹ️ Get more info about {pet.name}
                </Button>
              </div>
            </motion.div>

            {/* Right - Photo */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="md:col-span-2"
            >
              <div className="relative">
                <div className="h-80 md:h-96 bg-warm rounded-3xl flex items-center justify-center text-8xl overflow-hidden shadow-card">
                  {imgSrc ? (
                    <motion.img
                      key={photoIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      src={imgSrc}
                      alt={pet.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{speciesEmoji[pet.type] || '🐾'}</span>
                  )}
                </div>
                {/* Dots */}
                <div className="flex justify-center gap-2 mt-4">
                  <span className="w-2.5 h-2.5 rounded-full bg-coral" />
                </div>
                {/* Heart + Share */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button className="w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm text-muted hover:text-coral transition-all">♥</button>
                  <button className="w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm text-muted hover:text-coral transition-all">↗</button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Product Showcase */}
        <section className="mt-16 py-12" style={{ backgroundColor: '#FAEEDA' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">To welcome your companion</h2>
            <div className="flex gap-4 overflow-x-auto pb-4">
              <ProductCard emoji="🎾" title="Toys" price="From 25 MAD" delay={0} />
              <ProductCard emoji="🛏️" title="Bed" price="From 150 MAD" delay={0.1} />
              <ProductCard emoji="🥣" title="Bowl" price="From 30 MAD" delay={0.2} />
              <ProductCard emoji="📿" title="Collar" price="From 45 MAD" delay={0.3} />
            </div>
          </div>
        </section>

        {/* Shelter Info */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="bg-gray-200 rounded-3xl h-64 flex items-center justify-center text-gray-400 text-6xl">
                🗺️
              </div>
              <p className="text-sm text-muted mt-4">
                {pet.shelterName && <span className="font-medium text-gray-900">{pet.shelterName}</span>}
                {pet.city && <span> — {pet.city}</span>}
              </p>
              <Button variant="primary" className="!rounded-pill mt-3">Get directions</Button>
            </div>
            <ShelterInfoCard
              shelter={{
                name: pet.shelterName || 'Super-hayawan Shelter',
                city: pet.city,
                phone: pet.shelterPhone || '+212 5XX XX XX XX',
                hours: {
                  'Mon-Fri': '9:00 – 17:00',
                  'Saturday': '10:00 – 16:00',
                  'Sunday': 'Closed',
                },
              }}
            />
          </div>
        </section>

        {/* Similar Pets */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <SimilarPets pets={similarPets} />
        </section>

        {/* Adoption Conditions */}
        <section className="bg-warm py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Adoption Conditions</h2>
            <p className="text-gray-600 leading-relaxed max-w-3xl">
              Adopting an animal is a long-term commitment. We ensure each adoption is well-prepared by verifying
              the living conditions, availability, and motivation of the adopter. A responsible adoption means
              providing a safe, loving, and permanent home.
            </p>
            <p className="text-gray-600 leading-relaxed mt-3 max-w-3xl">
              All our animals are vaccinated, sterilized, and identified with a QR code collar before adoption.
              Post-adoption follow-up is provided to ensure the well-being of the animal.
            </p>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 max-w-3xl">
              {[
                { label: 'Dog', amount: '375 MAD' },
                { label: 'Small dog (< 6 mo)', amount: '365 MAD' },
                { label: 'Cat', amount: '175 MAD' },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl shadow-card p-6 text-center"
                >
                  <p className="text-sm text-muted mb-1">{item.label}</p>
                  <p className="text-3xl font-bold text-coral">{item.amount}</p>
                  <p className="text-xs text-muted-light mt-2">Adoption fee</p>
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

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/client';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import PageTransition from '../../components/animations/PageTransition';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const speciesEmoji = {
  Dog: '🐕', Cat: '🐈', Rabbit: '🐰', Bird: '🐦', Parrot: '🦜',
  Hamster: '🐹', Fish: '🐟', Turtle: '🐢', Horse: '🐴',
};

export default function AdoptedPets() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    api.get('/adopted-pets')
      .then(({ data }) => {
        if (!cancelled) {
          const list = Array.isArray(data) ? data : data.items || [];
          setPets(list);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <PageTransition><Navbar /><div className="min-h-screen pt-24 flex items-center justify-center"><LoadingSpinner /></div><Footer /></PageTransition>;

  return (
    <PageTransition>
      <Navbar />
      <main className="min-h-screen bg-warm pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Adopted Pets</h1>
          <p className="text-muted mb-8">These animals have found their forever homes. 🎉</p>

          {pets.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-6xl block mb-4">🏠</span>
              <p className="text-muted text-lg">No adopted pets yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {pets.map((pet, i) => (
                <motion.div
                  key={pet.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(`/pets/${pet.id}`)}
                  className="bg-white rounded-xl shadow-card overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-card-hover transition-all group"
                >
                  <div className="h-40 bg-gradient-to-br from-green-100 to-teal-100 flex items-center justify-center text-5xl">
                    {pet.imageUrl ? (
                      <img src={pet.imageUrl} alt={pet.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{speciesEmoji[pet.type] || '🐾'}</span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900">{pet.name}</h3>
                    <p className="text-xs text-muted">{pet.type}{pet.breed ? ` · ${pet.breed}` : ''} · {pet.location}</p>
                    <div className="mt-2 text-xs text-muted-light">
                      <p>Adopted by: <span className="font-medium text-gray-700">{pet.adopterName || 'Anonymous'}</span></p>
                      <p>From: <span className="font-medium text-gray-700">{pet.enterpriseName || 'Unknown'}</span></p>
                      <p>On: {new Date(pet.adoptedAt).toLocaleDateString()}</p>
                    </div>
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

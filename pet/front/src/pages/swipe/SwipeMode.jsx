import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import api from '../../api/client';
import Navbar from '../../components/layout/Navbar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PageTransition from '../../components/animations/PageTransition';

const speciesEmoji = {
  Dog: '🐕', Cat: '🐈', Rabbit: '🐰', Bird: '🐦', Parrot: '🦜',
  Hamster: '🐹', Fish: '🐟', Turtle: '🐢', Horse: '🐴',
};

function SwipeCard({ pet, onSwipe, index }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-25, 0, 25]);
  const opacity = useTransform(x, [-300, -200, 0, 200, 300], [0, 1, 1, 1, 0]);

  const isRight = x.get() > 100;
  const isLeft = x.get() < -100;

  return (
    <motion.div
      className="absolute w-full max-w-sm cursor-grab active:cursor-grabbing"
      style={{ x, rotate, zIndex: 10 - index }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={(_, info) => {
        const velocity = info.velocity.x;
        const offset = info.offset.x;
        if (Math.abs(velocity) > 500 || Math.abs(offset) > 150) {
          const dir = offset > 0 || velocity > 500 ? 'adopt' : 'pass';
          onSwipe(dir, pet);
        }
      }}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ x: x.get() > 0 ? 500 : -500, opacity: 0, rotate: x.get() > 0 ? 30 : -30, transition: { duration: 0.3 } }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="h-72 bg-gradient-to-br from-warm to-warm-dark flex items-center justify-center text-8xl relative overflow-hidden">
          {pet.imageUrl ? (
            <img src={pet.imageUrl} alt={pet.name} className="w-full h-full object-cover" />
          ) : (
            <span>{speciesEmoji[pet.type] || '🐾'}</span>
          )}
          <AnimatePresence>
            {isRight && (
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute top-6 right-6 bg-teal text-white px-4 py-2 rounded-xl font-bold text-lg rotate-12 shadow-lg">
                ADOPT ♥
              </motion.div>
            )}
            {isLeft && (
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute top-6 left-6 bg-red-500 text-white px-4 py-2 rounded-xl font-bold text-lg -rotate-12 shadow-lg">
                PASS ✕
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-gray-900">{pet.name}</h2>
            <span className="text-sm font-medium text-gray-400">{pet.age != null ? `${pet.age}y` : '—'}</span>
          </div>
          <p className="text-gray-500 mb-1">{pet.breed || 'Mixed Breed'}</p>
          {pet.description && <p className="text-gray-400 text-sm mt-3 line-clamp-2">{pet.description}</p>}
        </div>
      </div>
    </motion.div>
  );
}

export default function SwipeMode() {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipeLog, setSwipeLog] = useState([]);

  useEffect(() => {
    let cancelled = false;
    api.get('/pets').then(({ data }) => {
      if (cancelled) return;
      const list = data.items || data.$values || [];
      setPets(list.filter((p) => p.status === 1 || p.status === 'Available'));
    }).catch(() => {}).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleSwipe = useCallback((dir, pet) => {
    setSwipeLog((prev) => [...prev, { petId: pet.id, action: dir }]);
    setCurrentIndex((i) => i + 1);
    if (dir === 'adopt') {
      const token = localStorage.getItem('sh-token');
      if (token) {
        api.post('/adoptions/apply', { petId: pet.id, applicationMessage: 'Swipe adoption match!' }).catch(() => {});
      }
    }
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowLeft') {
      const pet = pets[currentIndex];
      if (pet) handleSwipe('pass', pet);
    } else if (e.key === 'ArrowRight') {
      const pet = pets[currentIndex];
      if (pet) handleSwipe('adopt', pet);
    }
  }, [pets, currentIndex, handleSwipe]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const currentPet = pets[currentIndex];
  const nextPet = pets[currentIndex + 1];

  return (
    <PageTransition>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-dark-deep via-dark-mid to-dark-light pt-24 pb-12">
        <div className="max-w-lg mx-auto px-4 text-center">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-white mb-2">
            Swipe to Adopt
          </motion.h1>
          <p className="text-white/40 mb-8">
            <span className="text-teal">♥ Right</span> to adopt &middot; <span className="text-red-400">✕ Left</span> to pass
          </p>

          {loading ? <LoadingSpinner text="Loading pets..." /> : (
            <div className="relative h-[500px] flex items-center justify-center mb-8">
              <AnimatePresence>
                {currentPet && (
                  <SwipeCard key={currentPet.id} pet={currentPet} onSwipe={handleSwipe} index={0} />
                )}
                {nextPet && (
                  <motion.div
                    key={nextPet.id + '-next'}
                    className="absolute w-full max-w-sm"
                    style={{ zIndex: 0, transform: 'scale(0.95) translateY(12px)' }}
                  >
                    <div className="bg-white/5 rounded-3xl border border-white/10 h-[500px] flex items-center justify-center text-4xl text-white/20">
                      Next
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {!currentPet && !loading && (
                <div className="text-center">
                  <div className="text-8xl mb-4">🎉</div>
                  <h2 className="text-2xl font-bold text-white mb-2">All done!</h2>
                  <p className="text-white/40 mb-6">You've seen all available pets</p>
                  <button onClick={() => { setCurrentIndex(0); setSwipeLog([]); }} className="btn-primary">Start Over</button>
                </div>
              )}
            </div>
          )}

          {swipeLog.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-white/30 text-sm">
              {swipeLog.filter((s) => s.action === 'adopt').length} adoptions requested
            </motion.div>
          )}

          <div className="flex justify-center gap-6 mt-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => currentPet && handleSwipe('pass', currentPet)}
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl shadow-lg hover:shadow-red-200 transition-shadow"
            >
              ✕
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => currentPet && handleSwipe('adopt', currentPet)}
              className="w-16 h-16 bg-teal rounded-full flex items-center justify-center text-2xl shadow-lg hover:shadow-teal/30 transition-shadow"
            >
              ♥
            </motion.button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

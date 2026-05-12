import { useRef } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

const speciesEmoji = {
  Dog: '🐕', Cat: '🐈', Rabbit: '🐰', Bird: '🐦', Parrot: '🦜',
  Hamster: '🐹', Fish: '🐟', Turtle: '🐢', Horse: '🐴',
};

export default function SimilarPets({ pets = [] }) {
  const navigate = useNavigate();
  const constraintsRef = useRef(null);

  if (!pets.length) return null;

  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        You might also like these animals from the same shelter
      </h2>
      <div ref={constraintsRef} className="overflow-x-hidden">
        <motion.div
          drag="x"
          dragConstraints={constraintsRef}
          className="flex gap-4 pb-4 cursor-grab active:cursor-grabbing"
        >
          {pets.map((pet, i) => (
            <motion.div
              key={pet.id || i}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => navigate(`/pets/${pet.id}`)}
              className="flex-shrink-0 w-64 bg-white rounded-2xl shadow-card overflow-hidden hover:shadow-card-hover transition-all cursor-pointer group"
            >
              <div className="h-36 bg-gradient-to-br from-coral/10 to-teal/10 flex items-center justify-center text-5xl relative">
                {pet.imageUrl || pet.mainImageUrl ? (
                  <img src={pet.imageUrl || pet.mainImageUrl} alt={pet.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{speciesEmoji[pet.type] || '🐾'}</span>
                )}
                <button className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-sm shadow-sm hover:bg-white transition-all">
                  ♥
                </button>
              </div>
              <div className="p-4 space-y-1">
                <h4 className="font-bold text-gray-900 group-hover:text-coral transition-colors">{pet.name}</h4>
                <p className="text-xs text-muted">📍 {pet.shelterName || pet.city || ''}</p>
                <div className="flex gap-1.5 mt-2">
                  <span className="px-2 py-0.5 bg-warm rounded-full text-xs text-gray-600">{pet.type}</span>
                  {pet.breed && <span className="px-2 py-0.5 bg-warm rounded-full text-xs text-gray-600">{pet.breed}</span>}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

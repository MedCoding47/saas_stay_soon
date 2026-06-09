import { motion } from 'framer-motion';
import PetCard from './PetCard';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function PetCardGrid({ pets, emptyMessage = 'No animals found', isFavorited, onToggleFavorite, t }) {
  if (!pets || pets.length === 0) {
    return (
      <div className="text-center py-20">
        <span className="text-6xl block mb-4">🔍</span>
        <p className="text-muted text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <motion.div
      key={pets.map(p => p.id).join(',')}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {pets.map((pet) => (
        <motion.div key={pet.id} variants={cardVariants}>
          <PetCard
            pet={pet}
            isFavorited={isFavorited ? isFavorited(pet.id) : false}
            onToggleFavorite={onToggleFavorite}
            t={t}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

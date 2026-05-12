import { motion } from 'framer-motion';
import Button from '../ui/Button';

export default function ProductCard({ emoji, title, price, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="flex-shrink-0 w-48 bg-white rounded-2xl shadow-card p-4 text-center"
    >
      <div className="text-5xl mb-3">{emoji}</div>
      <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
      <p className="text-coral font-bold text-sm mt-1">{price}</p>
      <Button variant="primary" className="mt-3 w-full text-xs !rounded-pill !px-3 !py-2">
        Shop now
      </Button>
    </motion.div>
  );
}

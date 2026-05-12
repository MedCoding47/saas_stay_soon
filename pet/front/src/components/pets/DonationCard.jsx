import { motion } from 'framer-motion';
import Button from '../ui/Button';

export default function DonationCard({ amount, taxInfo, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl shadow-card p-8 text-center"
    >
      <p className="text-4xl font-bold text-coral">{amount}</p>
      <p className="text-sm text-muted mt-2">MAD</p>
      {taxInfo && <p className="text-xs text-muted-light mt-2">{taxInfo}</p>}
      <Button variant="primary" className="mt-6 w-full !rounded-pill">
        Donate
      </Button>
    </motion.div>
  );
}

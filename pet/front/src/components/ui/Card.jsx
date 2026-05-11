import { motion } from 'framer-motion';

export default function Card({ children, className = '', glass = false, ...props }) {
  return (
    <motion.div
      whileHover={{ y: -12, boxShadow: '0 30px 60px rgba(216,90,48,0.3)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`${glass ? 'glass-card' : 'bg-white rounded-2xl shadow-card p-6'} transition-all duration-300 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

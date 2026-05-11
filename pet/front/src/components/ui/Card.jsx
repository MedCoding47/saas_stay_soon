import { motion } from 'framer-motion';

export default function Card({ children, className = '', glass = false, hover = true, ...props }) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`${glass ? 'glass-card' : 'card'} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

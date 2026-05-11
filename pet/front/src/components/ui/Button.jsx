import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-coral text-white hover:bg-coral-dark shadow-md hover:shadow-glow',
  teal: 'bg-teal text-white hover:bg-teal-dark shadow-md hover:shadow-lg',
  outline: 'border-2 border-coral text-coral hover:bg-coral hover:text-white',
  ghost: 'text-gray-600 hover:text-coral hover:bg-coral/5',
};

export default function Button({ children, variant = 'primary', className = '', ...props }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(216,90,48,0.5)' }}
      whileTap={{ scale: 0.95 }}
      className={`inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-colors duration-300 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}

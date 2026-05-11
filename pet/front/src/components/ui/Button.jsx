import { motion } from 'framer-motion';

const variantStyles = {
  primary: 'bg-coral text-white shadow-md hover:shadow-coral',
  teal: 'bg-teal text-white shadow-md hover:shadow-teal',
  outline: 'border-2 border-coral/30 text-coral hover:bg-coral hover:text-white hover:border-coral',
  'outline-white': 'border-2 border-white/30 text-white/90 hover:bg-white hover:text-dark hover:border-white',
  ghost: 'text-muted hover:text-coral bg-transparent',
};

export default function Button({ children, variant = 'primary', className = '', style, ...props }) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`btn ${variantStyles[variant] || variantStyles.primary} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </motion.button>
  );
}

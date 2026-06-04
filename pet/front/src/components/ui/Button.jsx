import { motion } from 'framer-motion';

const sizeStyles = {
  sm: 'px-5 py-2.5 text-sm',
  md: 'px-7 py-3.5 text-sm',
  lg: 'px-9 py-4 text-sm',
};

const variantStyles = {
  primary: 'bg-[#0D0D0D] text-[#FAF7F2] hover:bg-[#2A2A2A]',
  outline: 'border-2 border-[#0D0D0D] text-[#0D0D0D] bg-transparent hover:bg-[#0D0D0D] hover:text-[#FAF7F2]',
  coral: 'bg-coral text-white hover:bg-coral-dark',
  'outline-white': 'border-2 border-white/30 text-white/90 hover:bg-white hover:text-[#0D0D0D]',
  ghost: 'text-[#8c7e74] hover:text-[#0D0D0D] bg-transparent',
};

export default function Button({ children, variant = 'primary', size = 'md', className = '', style, ...props }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={`inline-flex items-center justify-center gap-2 font-semibold text-sm tracking-wide rounded-full transition-all duration-200 cursor-pointer ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.primary} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </motion.button>
  );
}

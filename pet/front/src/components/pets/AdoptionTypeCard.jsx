import { motion } from 'framer-motion';

export default function AdoptionTypeCard({ emoji, title, description, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 text-center flex flex-col items-center gap-3 border border-white/10 hover:bg-white/20 transition-all cursor-pointer group"
    >
      <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform">
        {emoji}
      </div>
      <h3 className="text-white font-bold text-lg">{title}</h3>
      <p className="text-white/60 text-sm">{description}</p>
      <span className="text-coral text-xl group-hover:translate-x-1 transition-transform">→</span>
    </motion.div>
  );
}

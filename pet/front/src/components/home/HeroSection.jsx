import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../ui/Button';

export default function HeroSection({ stats }) {
  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #0F0C29, #302B63, #24243e)' }}>
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(232,99,74,0.2), transparent 70%)', filter: 'blur(80px)' }} />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-24 pb-16">
        <div className="max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-nouveau animate-pulse-soft" />
            {stats?.available || 8} animaux à adopter
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="text-hero text-white leading-tight tracking-tight">
            Trouvez votre <span className="text-gradient-coral">compagnon</span><br />
            <span className="text-gradient-teal">idéal</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-4 text-lg text-white/50 max-w-lg leading-relaxed">
            Adoptez, ne magasinez pas. Des centaines d'animaux au Maroc cherchent une famille aimante.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-8 flex flex-wrap gap-4">
            <Link to="/pets"><Button variant="primary" className="text-base px-8 py-4">Voir les animaux</Button></Link>
            <Link to="/client/register"><Button variant="outline-white" className="text-base px-8 py-4">Créer un compte</Button></Link>
          </motion.div>

          {/* Stats */}
          {stats && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-12 flex gap-8 text-white/40 text-sm">
              {stats.adoptions && <div><strong className="text-white text-xl">{stats.adoptions}</strong><br />Adoptions</div>}
              {stats.shelters && <div><strong className="text-white text-xl">{stats.shelters}</strong><br />Refuges</div>}
              {stats.vets && <div><strong className="text-white text-xl">{stats.vets}</strong><br />Vétérinaires</div>}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export default function Pagination({ current, total, onChange }) {
  if (total <= 1) return null;
  const pages = [];
  for (let i = 1; i <= total; i++) pages.push(i);

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        className="w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-warm text-muted hover:bg-warm-dark"
      >
        ‹
      </button>
      {pages.map((p) => (
        <motion.button
          key={p}
          whileTap={{ scale: 0.9 }}
          onClick={() => onChange(p)}
          className={cn(
            'w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all',
            p === current
              ? 'bg-coral text-white shadow-md'
              : 'bg-warm text-muted hover:bg-warm-dark'
          )}
        >
          {p}
        </motion.button>
      ))}
      <button
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        className="w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-warm text-muted hover:bg-warm-dark"
      >
        ›
      </button>
    </div>
  );
}

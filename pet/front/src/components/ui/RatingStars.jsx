import { Star } from 'lucide-react';
import { useState } from 'react';

function StarDisplay({ fill, sizePx, interactive, onHover, onClick }) {
  if (fill >= 1) {
    return (
      <button type="button" disabled={!interactive}
        onMouseEnter={interactive ? onHover : undefined}
        onClick={interactive ? onClick : undefined}
        className={interactive ? 'cursor-pointer p-0.5 -m-0.5' : ''}
      >
        <Star size={sizePx} className="text-[var(--sh-gold)] shrink-0" fill="currentColor" />
      </button>
    );
  }
  if (fill <= 0) {
    return (
      <button type="button" disabled={!interactive}
        onMouseEnter={interactive ? onHover : undefined}
        onClick={interactive ? onClick : undefined}
        className={interactive ? 'cursor-pointer p-0.5 -m-0.5' : ''}
      >
        <Star size={sizePx} className="text-gray-400 shrink-0" fill="none" stroke="currentColor" />
      </button>
    );
  }
  return (
    <button type="button" disabled={!interactive}
      onMouseEnter={interactive ? onHover : undefined}
      onClick={interactive ? onClick : undefined}
      className={`relative inline-block shrink-0 ${interactive ? 'cursor-pointer' : ''}`}
      style={{ width: sizePx, height: sizePx }}
    >
      <Star size={sizePx} className="text-gray-400 absolute inset-0" fill="none" stroke="currentColor" />
      <div style={{ width: `${fill * 100}%`, overflow: 'hidden', position: 'absolute', top: 0, left: 0 }}>
        <Star size={sizePx} className="text-[var(--sh-gold)]" fill="currentColor" />
      </div>
    </button>
  );
}

export default function RatingStars({ rating = 0, max = 5, size = 'md', interactive, onChange, showValue = true, count }) {
  const [hovered, setHovered] = useState(0);
  const sizePx = { sm: 14, md: 20, lg: 28 }[size] || 20;
  const display = hovered || rating;

  return (
    <div className="inline-flex items-center gap-0.5" onMouseLeave={() => interactive && setHovered(0)}>
      {Array.from({ length: max }, (_, i) => (
        <StarDisplay
          key={i}
          fill={Math.max(0, Math.min(1, display - i))}
          sizePx={sizePx}
          interactive={interactive}
          onHover={() => setHovered(i + 1)}
          onClick={() => { if (onChange) onChange(i + 1); }}
        />
      ))}
      {!interactive && showValue && (
        <span className="ml-1 text-sm font-medium text-gray-700">{rating > 0 ? rating.toFixed(1) : '—'}</span>
      )}
      {!interactive && count !== undefined && (
        <span className="ml-1 text-xs text-muted">({count} {count === 1 ? 'review' : 'reviews'})</span>
      )}
    </div>
  );
}

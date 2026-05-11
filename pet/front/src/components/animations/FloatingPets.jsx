import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const emojis = [
  { emoji: '🐕', label: 'Dog' },
  { emoji: '🐈', label: 'Cat' },
  { emoji: '🐰', label: 'Rabbit' },
  { emoji: '🐦', label: 'Bird' },
  { emoji: '🐾', label: 'Paw' },
];

export default function FloatingPets() {
  const containerRef = useRef(null);
  const itemsRef = useRef([]);

  useEffect(() => {
    const items = itemsRef.current.filter(Boolean);
    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    items.forEach((el, i) => {
      gsap.set(el, {
        x: gsap.utils.random(-80, 80),
        y: gsap.utils.random(-40, 40),
        rotation: gsap.utils.random(-30, 30),
        scale: gsap.utils.random(0.8, 1.2),
      });
      tl.to(el, {
        y: -20,
        rotation: 15,
        duration: 2,
        stagger: 0.4,
        ease: 'power1.inOut',
      }, i * 0.15);
    });

    const handlers = [];
    items.forEach((el) => {
      const handler = (e) => {
        const rect = el.getBoundingClientRect();
        const dx = (e.clientX - rect.left - rect.width / 2) / 15;
        const dy = (e.clientY - rect.top - rect.height / 2) / 15;
        gsap.to(el, { x: `+=${dx}`, y: `+=${dy}`, rotation: dx * 3, duration: 0.8, ease: 'power2.out' });
      };
      el.addEventListener('mousemove', handler);
      handlers.push({ el, handler });
    });

    return () => {
      tl.kill();
      handlers.forEach(({ el, handler }) => el.removeEventListener('mousemove', handler));
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="pet-float-container relative flex items-center justify-center gap-4 md:gap-6 text-6xl md:text-7xl lg:text-8xl"
      style={{ perspective: '1000px' }}
    >
      {emojis.map((item, i) => (
        <span
          key={item.label}
          ref={(el) => (itemsRef.current[i] = el)}
          className="pet-float inline-block drop-shadow-2xl cursor-pointer select-none hover:scale-110 transition-transform"
          style={{ filter: 'drop-shadow(0 0 30px rgba(216,90,48,0.3))' }}
        >
          {item.emoji}
        </span>
      ))}
    </div>
  );
}

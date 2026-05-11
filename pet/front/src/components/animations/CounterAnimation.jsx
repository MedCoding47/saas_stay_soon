import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function CounterAnimation({ end, suffix = '', label, color = 'text-coral' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || animated) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        onEnter: () => {
          setAnimated(true);
          gsap.to({ val: 0 }, {
            val: end,
            duration: 2.5,
            ease: 'power2.out',
            onUpdate: function () { setCount(Math.floor(this.targets()[0].val)); },
          });
        },
        once: true,
      });
    }, el);
    return () => ctx.revert();
  }, [end, animated]);

  return (
    <div ref={ref} className="text-center">
      <div className={`text-4xl md:text-5xl font-bold ${color}`}>{count}{suffix}</div>
      <div className="text-gray-400 mt-1.5 text-sm font-medium uppercase tracking-wider">{label}</div>
    </div>
  );
}

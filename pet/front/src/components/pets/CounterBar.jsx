import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

export default function CounterBar({ count = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 1500;
    const step = Math.max(1, Math.floor(count / 60));
    const interval = setInterval(() => {
      start += step;
      if (start >= count) {
        setDisplayed(count);
        clearInterval(interval);
      } else {
        setDisplayed(start);
      }
    }, duration / 60);
    return () => clearInterval(interval);
  }, [isInView, count]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="bg-teal-dark text-white py-6 px-4 text-center"
    >
      <p className="text-lg md:text-xl font-semibold">
        Super-hayawan currently has <span className="text-amber text-2xl font-bold">{displayed}</span> animals (dogs, cats, rabbits...) to adopt
      </p>
    </motion.div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import api from '../api/client';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import FloatingPets from '../components/animations/FloatingPets';
import CounterAnimation from '../components/animations/CounterAnimation';
import PageTransition from '../components/animations/PageTransition';

const stagger = { initial: {}, animate: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const steps = [
  { icon: '🔍', title: 'Browse Pets', desc: 'Explore hundreds of adoptable pets from partner shelters near you.' },
  { icon: '💌', title: 'Apply to Adopt', desc: 'Submit an adoption request with your details in minutes.' },
  { icon: '🏠', title: 'Welcome Home', desc: 'Meet your new companion and start your journey together.' },
];

export default function Landing() {
  const [pets, setPets] = useState([]);
  const [stats, setStats] = useState({ total: 0, shelters: 12, families: 0 });
  const heroRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    api.get('/pets').then(({ data }) => {
      if (cancelled) return;
      const list = data.items || data.$values || [];
      setPets(list.slice(0, 3));
      setStats((s) => ({ ...s, total: list.length }));
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const handleMove = (e) => {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to(hero.querySelector('.hero-3d'), { rotateY: x * 8, rotateX: -y * 8, duration: 0.6, ease: 'power2.out' });
    };
    hero.addEventListener('mousemove', handleMove);
    hero.addEventListener('mouseleave', () => {
      gsap.to(hero.querySelector('.hero-3d'), { rotateY: 0, rotateX: 0, duration: 0.8, ease: 'power2.out' });
    });
    return () => { hero.removeEventListener('mousemove', handleMove); };
  }, []);

  return (
    <PageTransition>
      <Navbar transparent />

      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #0F0C29, #302B63, #24243e)' }}>
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(216,90,48,0.3), transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal/5 rounded-full blur-[100px]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={stagger} initial="initial" animate="animate">
              <motion.h1 variants={fadeUp} className="text-hero text-white leading-tight tracking-tight">
                Find Your <span className="text-coral">Perfect</span><br />
                <span className="text-teal">Companion</span>
              </motion.h1>
              <motion.p variants={fadeUp} className="mt-6 text-lg text-white/50 max-w-lg leading-relaxed">
                Connect with shelters. Change a life. Every pet deserves a loving home — and you might just find your new best friend.
              </motion.p>
              <motion.div variants={fadeUp} className="mt-10 flex flex-wrap gap-4">
                <Link to="/pets"><Button variant="primary" className="text-base px-8 py-4">Browse Pets</Button></Link>
                <Link to="/client/register"><Button variant="outline" className="text-base px-8 py-4 !border-white/20 !text-white/80 hover:!bg-white hover:!text-dark">I'm a Shelter</Button></Link>
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hero-3d"
              style={{ perspective: '1000px' }}
            >
              <div style={{ transformStyle: 'preserve-3d' }}>
                <FloatingPets />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-10 grid grid-cols-3 gap-8"
        >
          <CounterAnimation end={stats.total} suffix="+" label="Pets Available" color="text-coral" />
          <CounterAnimation end={stats.shelters} suffix="" label="Partner Shelters" color="text-teal" />
          <CounterAnimation end={380} suffix="+" label="Happy Families" color="text-coral" />
        </motion.div>
      </section>

      {/* Featured Pets */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="section-title">Featured Pets</h2>
          <p className="mt-4 text-white/40 max-w-lg mx-auto">Meet some of the wonderful pets waiting for their forever home</p>
        </motion.div>

        <motion.div variants={stagger} initial="initial" whileInView="animate" viewport={{ once: true }} className="grid md:grid-cols-3 gap-8">
          {pets.length === 0 ? (
            <p className="col-span-3 text-center text-white/30 py-12">Loading pets...</p>
          ) : (
            pets.map((pet) => (
              <motion.div key={pet.id} variants={fadeUp}>
                <Card glass>
                  <div className="h-48 rounded-xl mb-5 flex items-center justify-center text-6xl overflow-hidden bg-white/5">
                    {pet.imageUrl ? <img src={pet.imageUrl} alt={pet.name} className="w-full h-full object-cover" /> : '🐾'}
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-white">{pet.name}</h3>
                    <Badge status={typeof pet.status === 'number' ? ({ 1:'Available',2:'Adopted',3:'Pending' })[pet.status]||'Available' : ({ 'Available':'Available','ApplicationReceived':'Pending','UnderReview':'Pending','Approved':'Pending','Completed':'Adopted' })[pet.status]||pet.status||'Available'} />
                  </div>
                  <p className="text-white/40 text-sm mb-4">{pet.breed || 'Mixed Breed'}</p>
                  <Button variant="teal" className="w-full text-sm">Meet Me</Button>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>
        <div className="text-center mt-10">
          <Link to="/pets"><Button variant="primary" className="px-10">View All Pets &rarr;</Button></Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-28 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="section-title">How It Works</h2>
            <p className="mt-4 text-white/40">Three simple steps to change a life</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-10">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="text-center"
              >
                <div className="w-20 h-20 mx-auto glass-card !rounded-2xl flex items-center justify-center text-3xl mb-5 !p-0 border-white/10">{step.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-white/40 text-sm max-w-xs mx-auto">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #D85A30, #1D9E75)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1), transparent 60%)' }} />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-3xl mx-auto text-center px-4"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Ready to Adopt?</h2>
          <p className="text-white/70 text-lg mb-10 max-w-lg mx-auto">
            Join PawFinds today and start your journey to finding a loving companion.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/client/register"><Button variant="outline" className="!border-white !text-white hover:!bg-white hover:!text-coral text-base px-10 py-4">Get Started Free</Button></Link>
            <Link to="/pets"><Button variant="primary" className="text-base px-10 py-4 !bg-white !text-coral hover:!bg-gray-100 hover:!shadow-glow">Browse Pets</Button></Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </PageTransition>
  );
}

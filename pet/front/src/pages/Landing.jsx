import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import api from '../api/client';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import FloatingPets from '../components/animations/FloatingPets';
import CounterAnimation from '../components/animations/CounterAnimation';
import PageTransition from '../components/animations/PageTransition';

const stagger = { initial: {}, animate: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

const steps = [
  { icon: '🔍', title: 'Browse Pets', desc: 'Swipe through hundreds of adoptable pets from shelters near you.', color: 'from-coral to-amber' },
  { icon: '💌', title: 'Apply to Adopt', desc: 'Submit an adoption request with your details in minutes.', color: 'from-teal to-emerald' },
  { icon: '🏠', title: 'Welcome Home', desc: 'Meet your new companion and start your journey together.', color: 'from-amber to-coral' },
];

const speciesEmoji = {
  Dog: '🐕', Cat: '🐈', Rabbit: '🐰', Bird: '🐦', Parrot: '🦜',
  Hamster: '🐹', Fish: '🐟', Turtle: '🐢', Horse: '🐴',
};

const people = [
  { name: 'Amira & Simba', img: '/images/person1.jpg', quote: 'I found Simba through PawFinds and it was love at first sight. He\'s been my shadow ever since.' },
  { name: 'Omar & Bella', img: '/images/person2.jpg', quote: 'Bella was rescued from the streets. Now she sleeps on my pillow every night. Best decision I ever made.' },
  { name: 'Nadia & Max', img: '/images/person3.jpg', quote: 'The swipe feature made it so easy to find the perfect match. Max and I are inseparable now!' },
];

export default function Landing() {
  const [pets, setPets] = useState([]);
  const [stats, setStats] = useState({ total: 0, shelters: 12, families: 0 });
  const heroRef = useRef(null);
  const gsapRef = useRef(null);

  useEffect(() => {
    if (gsapRef.current) return;
    gsapRef.current = gsap.to('.pet-float', {
      y: -20, rotation: 10, duration: 2, yoyo: true, repeat: -1,
      stagger: 0.4, ease: 'power1.inOut',
    });
    return () => { gsapRef.current?.kill(); };
  }, []);

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

  const petStatus = (s) => {
    if (typeof s === 'number') return ({ 1: 'Available', 2: 'Adopted', 3: 'Pending' })[s] || 'Available';
    const map = { Available: 'Available', ApplicationReceived: 'Pending', UnderReview: 'Pending', Approved: 'Pending', Completed: 'Adopted' };
    return map[s] || s || 'Available';
  };

  return (
    <PageTransition>
      <Navbar />

      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #0F0C29, #302B63, #24243e)' }}>
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(232,99,74,0.25), transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal/5 rounded-full blur-[100px]" />
        <div className="absolute top-10 left-10 w-64 h-64 bg-amber/5 rounded-full blur-[80px]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={stagger} initial="initial" animate="animate">
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-sm mb-6">
                <span className="w-2 h-2 rounded-full bg-teal animate-pulse-soft" />
                Now accepting new pet listings
              </motion.div>
              <motion.h1 variants={fadeUp} className="text-hero text-white leading-tight tracking-tight">
                Find Your <span className="text-gradient-coral">Perfect</span><br />
                <span className="text-gradient-teal">Companion</span>
              </motion.h1>
              <motion.p variants={fadeUp} className="mt-6 text-2xl text-white/50 font-light tracking-wider">
                Swipe. Match. Adopt.
              </motion.p>
              <motion.p variants={fadeUp} className="mt-2 text-lg text-white/30 max-w-lg leading-relaxed">
                Connect with pet lovers. Change a life. Every pet deserves a loving home.
              </motion.p>
              <motion.div variants={fadeUp} className="mt-10 flex flex-wrap gap-4">
                <Link to="/swipe"><Button variant="primary" className="text-base px-8 py-4">Start Swiping 🐾</Button></Link>
                <Link to="/client/register"><Button variant="outline-white" className="text-base px-8 py-4">List a Pet</Button></Link>
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hero-3d"
              style={{ perspective: '1000px' }}
            >
              <FloatingPets />
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
          className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-3xl p-10 shadow-glass grid grid-cols-3 gap-8"
        >
          <CounterAnimation end={stats.total} suffix="+" label="Pets Available" color="text-coral" />
          <CounterAnimation end={stats.shelters} suffix="" label="Partner Shelters" color="text-teal" />
          <CounterAnimation end={380} suffix="+" label="Happy Families" color="text-coral" />
        </motion.div>
      </section>

      {/* About Us */}
      <section className="py-28" style={{ background: 'linear-gradient(135deg, #0F0C29, #302B63, #24243e)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid lg:grid-cols-2 gap-16 items-center"
        >
          <div className="grid grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="rounded-3xl overflow-hidden h-64">
              <img src="/images/family.jpg" alt="Happy family with adopted dog" className="w-full h-full object-cover" />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }} className="rounded-3xl overflow-hidden h-64 mt-8">
              <img src="/images/kid.jpg" alt="Kid with adopted cat" className="w-full h-full object-cover" />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="rounded-3xl overflow-hidden h-48">
              <img src="/images/volunteer.jpg" alt="Volunteer at shelter" className="w-full h-full object-cover" />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.45 }} className="rounded-3xl overflow-hidden h-48 mt-4">
              <img src="/images/person2.jpg" alt="Happy cat adoption" className="w-full h-full object-cover" />
            </motion.div>
          </div>
          <div>
            <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-coral font-semibold text-sm uppercase tracking-widest">Our Story</motion.span>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-bold text-white mt-3 leading-tight">
              Every Pet Deserves a <span className="text-coral">Loving Home</span>
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="text-white/60 mt-6 leading-relaxed text-lg">
              PawFinds was born with a simple mission: connect every homeless pet with a loving family. 
              We saw too many stray animals on the streets and too many empty food bowls — so we built a platform 
              that makes adoption as easy as a swipe.
            </motion.p>
            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="text-white/40 mt-4 leading-relaxed">
              Using technology to match pets with people. Find your perfect companion from the comfort of your 
              home — because finding a best friend should feel magical, not complicated.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="flex items-center gap-6 mt-8">
              <div className="flex -space-x-3">
                <img src="/images/person1.jpg" className="w-12 h-12 rounded-full border-2 border-white object-cover" />
                <img src="/images/person2.jpg" className="w-12 h-12 rounded-full border-2 border-white object-cover" />
                <img src="/images/person3.jpg" className="w-12 h-12 rounded-full border-2 border-white object-cover" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Trusted by <span className="text-coral">380+</span> families</p>
                <p className="text-xs text-white/40">and 12 partner shelters</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
        </div>
      </section>

      {/* Featured Pets */}
      <section className="py-28" style={{ background: '#1A1A2E' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <h2 className="section-title">Featured Pets</h2>
          <p className="section-sub">Meet some of the wonderful pets waiting for their forever home</p>
        </motion.div>

        <motion.div variants={stagger} initial="initial" whileInView="animate" viewport={{ once: true }} className="grid md:grid-cols-3 gap-8">
          {pets.length === 0 ? (
            <p className="col-span-3 text-center text-white/30 py-12">Loading pets...</p>
          ) : (
            pets.map((pet) => (
              <motion.div key={pet.id} variants={fadeUp}>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 transition-all duration-300 hover:bg-white/10">
                  <div className="h-48 rounded-xl mb-5 flex items-center justify-center overflow-hidden bg-white/5">
                    {pet.imageUrl ? <img src={pet.imageUrl} alt={pet.name} className="w-full h-full object-cover" /> : <span className="text-6xl">{speciesEmoji[pet.type] || '🐾'}</span>}
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-white">{pet.name}</h3>
                    <Badge status={petStatus(pet.status)} />
                  </div>
                  <p className="text-white/40 text-sm mb-4">{pet.breed || 'Mixed Breed'}</p>
                  <Link to="/swipe"><Button variant="teal" className="w-full text-sm">Meet Me</Button></Link>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
        <div className="text-center mt-10"><Link to="/pets"><Button variant="primary" className="px-10">View All Pets &rarr;</Button></Link></div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-28" style={{ background: '#24243e' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="section-title">Happy Tails</h2>
            <p className="section-sub">Real stories from real families who found their perfect match</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {people.map((person, i) => (
              <motion.div
                key={person.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center"
              >
                <div className="w-24 h-24 mx-auto rounded-full overflow-hidden mb-5 ring-2 ring-coral/30">
                  <img src={person.img} alt={person.name} className="w-full h-full object-cover" />
                </div>
                <p className="text-white/70 text-sm leading-relaxed italic mb-4">"{person.quote}"</p>
                <p className="text-coral font-semibold text-sm">{person.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-28" style={{ background: '#1A1A2E' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="section-title">How It Works</h2>
            <p className="section-sub">Three simple steps to change a life</p>
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
                <div className={`w-20 h-20 mx-auto bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center text-3xl mb-5 shadow-lg`}>{step.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-white/40 text-sm max-w-xs mx-auto">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #e8634a, #1a8a7a)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1), transparent 60%)' }} />
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative z-10 max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Ready to Find Your Companion?</h2>
          <p className="text-white/70 text-lg mb-10 max-w-lg mx-auto">
            Join PawFinds today and start your journey to finding a loving companion.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/client/register"><Button variant="outline-white" className="text-base px-10 py-4">Get Started Free</Button></Link>
            <Link to="/pets"><Button variant="primary" className="text-base px-10 py-4 !bg-white !text-coral hover:!bg-gray-100">Browse Pets</Button></Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </PageTransition>
  );
}

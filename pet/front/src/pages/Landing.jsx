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
import Floating, { FloatingElement } from '../components/ui/parallax-floating';
import { TextRotate } from '../components/ui/text-rotate';

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

const petImages = [
  { url: '/images/bella.jpg', alt: 'Bella the dog', cls: 'w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rotate-6 shadow-2xl' },
  { url: '/images/charlie.jpg', alt: 'Charlie the cat', cls: 'w-36 h-28 sm:w-44 sm:h-36 md:w-48 md:h-40 -rotate-3 shadow-2xl' },
  { url: '/images/coco.jpg', alt: 'Coco the dog', cls: 'w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 -rotate-12 shadow-2xl' },
  { url: '/images/daisy.jpg', alt: 'Daisy the dog', cls: 'w-40 h-32 sm:w-48 sm:h-40 md:w-56 md:h-48 rotate-12 shadow-2xl' },
  { url: '/images/leo.jpg', alt: 'Leo the cat', cls: 'w-44 h-44 sm:w-52 sm:h-52 md:w-60 md:h-60 rotate-[19deg] shadow-2xl' },
  { url: '/images/luna.jpg', alt: 'Luna the dog', cls: 'w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 -rotate-6 shadow-2xl' },
  { url: '/images/max.jpg', alt: 'Max the dog', cls: 'w-20 h-16 sm:w-24 sm:h-20 md:w-28 md:h-24 rotate-3 shadow-2xl' },
  { url: '/images/milo.jpg', alt: 'Milo the cat', cls: 'w-52 h-52 sm:w-60 sm:h-60 md:w-72 md:h-72 rotate-3 shadow-2xl' },
  { url: '/images/oreo.jpg', alt: 'Oreo the dog', cls: 'w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 -rotate-8 shadow-2xl' },
  { url: '/images/rocky.jpg', alt: 'Rocky the dog', cls: 'w-36 h-28 sm:w-44 sm:h-36 md:w-48 md:h-40 rotate-2 shadow-2xl' },
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

  const petStatus = (s) => {
    if (typeof s === 'number') return ({ 1: 'Available', 2: 'Adopted', 3: 'Pending' })[s] || 'Available';
    const map = { Available: 'Available', ApplicationReceived: 'Pending', UnderReview: 'Pending', Approved: 'Pending', Completed: 'Adopted' };
    return map[s] || s || 'Available';
  };

  return (
    <PageTransition>
      <Navbar />

      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #0F0C29, #302B63, #24243e)' }}>
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(232,99,74,0.25), transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal/5 rounded-full blur-[100px]" />

        <Floating sensitivity={-0.5} className="h-full w-full">
          <FloatingElement depth={0.5} className="top-[15%] left-[3%] md:top-[22%] md:left-[5%]">
            <img src={petImages[0].url} alt={petImages[0].alt} className={`${petImages[0].cls} object-cover hover:scale-105 duration-200 cursor-pointer transition-transform rounded-xl`} />
          </FloatingElement>
          <FloatingElement depth={1} className="top-[3%] left-[9%] md:top-[6%] md:left-[12%]">
            <img src={petImages[1].url} alt={petImages[1].alt} className={`${petImages[1].cls} object-cover hover:scale-105 duration-200 cursor-pointer transition-transform rounded-xl`} />
          </FloatingElement>
          <FloatingElement depth={4} className="top-[88%] left-[6%] md:top-[78%] md:left-[8%]">
            <img src={petImages[2].url} alt={petImages[2].alt} className={`${petImages[2].cls} object-cover hover:scale-105 duration-200 cursor-pointer transition-transform rounded-xl`} />
          </FloatingElement>
          <FloatingElement depth={2} className="top-[2%] left-[82%] md:top-[4%] md:left-[82%]">
            <img src={petImages[3].url} alt={petImages[3].alt} className={`${petImages[3].cls} object-cover hover:scale-105 duration-200 cursor-pointer transition-transform rounded-xl`} />
          </FloatingElement>
          <FloatingElement depth={1} className="top-[75%] left-[80%] md:top-[65%] md:left-[82%]">
            <img src={petImages[4].url} alt={petImages[4].alt} className={`${petImages[4].cls} object-cover hover:scale-105 duration-200 cursor-pointer transition-transform rounded-xl`} />
          </FloatingElement>
          <FloatingElement depth={3} className="top-[45%] left-[1%] md:top-[48%] md:left-[2%]">
            <img src={petImages[5].url} alt={petImages[5].alt} className={`${petImages[5].cls} object-cover hover:scale-105 duration-200 cursor-pointer transition-transform rounded-xl`} />
          </FloatingElement>
          <FloatingElement depth={2} className="top-[10%] left-[72%] md:top-[14%] md:left-[75%]">
            <img src={petImages[6].url} alt={petImages[6].alt} className={`${petImages[6].cls} object-cover hover:scale-105 duration-200 cursor-pointer transition-transform rounded-xl`} />
          </FloatingElement>
          <FloatingElement depth={5} className="top-[60%] left-[70%] md:top-[55%] md:left-[72%]">
            <img src={petImages[7].url} alt={petImages[7].alt} className={`${petImages[7].cls} object-cover hover:scale-105 duration-200 cursor-pointer transition-transform rounded-xl`} />
          </FloatingElement>
          <FloatingElement depth={3} className="top-[82%] left-[50%] md:top-[85%] md:left-[52%]">
            <img src={petImages[8].url} alt={petImages[8].alt} className={`${petImages[8].cls} object-cover hover:scale-105 duration-200 cursor-pointer transition-transform rounded-xl`} />
          </FloatingElement>
        </Floating>

        <div className="relative z-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col items-center text-center pointer-events-auto">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut', delay: 0.3 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-sm mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-teal animate-pulse-soft" />
            Now accepting new pet listings
          </motion.div>
          <motion.h1
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-white leading-tight tracking-tight flex flex-col items-center"
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut', delay: 0.3 }}
          >
            <span>Find Your Perfect</span>
            <span className="inline-flex items-center gap-3 flex-wrap justify-center">
              <span className="text-gradient-teal">Companion</span>
              <TextRotate
                texts={[
                  '🐕 woof',
                  '🐈 meow',
                  '🐰 hop',
                  '🐦 chirp',
                  '🐹 squeak',
                  '❤️ love',
                  '🏡 home',
                  '✨ magic',
                ]}
                mainClassName="overflow-hidden text-coral py-0 pb-2 md:pb-4 rounded-xl"
                staggerDuration={0.03}
                staggerFrom="last"
                rotationInterval={2500}
                transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              />
            </span>
          </motion.h1>
          <motion.p
            className="mt-6 text-2xl text-white/50 font-light tracking-wider"
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut', delay: 0.5 }}
          >
            Swipe. Match. Adopt.
          </motion.p>
          <motion.p
            className="mt-2 text-lg text-white/30 max-w-lg"
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut', delay: 0.5 }}
          >
            Connect with pet lovers. Change a life. Every pet deserves a loving home.
          </motion.p>
          <motion.div
            className="mt-10 flex flex-wrap gap-4 justify-center"
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut', delay: 0.7 }}
          >
            <Link to="/swipe"><Button variant="primary" className="text-base px-8 py-4">Start Swiping 🐾</Button></Link>
            <Link to="/client/register"><Button variant="outline-white" className="text-base px-8 py-4">List a Pet</Button></Link>
          </motion.div>
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

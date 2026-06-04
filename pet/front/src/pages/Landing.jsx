import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import CounterAnimation from '../components/animations/CounterAnimation';
import PageTransition from '../components/animations/PageTransition';

const stats = [
  { value: 250, label: 'Pets Adopted', suffix: '+' },
  { value: 48, label: 'Partner Shelters', suffix: '' },
  { value: 1500, label: 'Happy Families', suffix: '+' },
  { value: 98, label: 'Success Rate', suffix: '%' },
];

const steps = [
  { number: '01', title: 'Browse Pets', desc: 'Explore hundreds of adorable pets across Morocco waiting for a loving home.' },
  { number: '02', title: 'Submit Request', desc: 'Send an adoption request directly to the shelter caring for your chosen pet.' },
  { number: '03', title: 'Welcome Home', desc: 'Complete the process and bring your new family member home for good.' },
];

const testimonials = [
  { quote: 'Nino made it so easy to find our new best friend. The process was smooth and completely transparent.', name: 'Sarah M.', role: 'Pet Parent', location: 'Casablanca' },
  { quote: 'As a shelter partner, Nino helps us find loving homes faster than ever before. Incredible platform.', name: 'Dr. Amine R.', role: 'Veterinarian', location: 'Rabat' },
  { quote: 'I adopted my cat through Nino and couldn\'t be happier. The team was incredibly supportive throughout.', name: 'Fatima Z.', role: 'Pet Parent', location: 'Marrakech' },
];

const pets = [
  { emoji: '🐕', name: 'Max', breed: 'Golden Retriever', age: '2 years', location: 'Casablanca' },
  { emoji: '🐈', name: 'Luna', breed: 'Persian Cat', age: '1 year', location: 'Rabat' },
  { emoji: '🐰', name: 'Oreo', breed: 'Holland Lop', age: '8 months', location: 'Marrakech' },
  { emoji: '🐕', name: 'Bella', breed: 'Labrador', age: '3 years', location: 'Tangier' },
  { emoji: '🐈', name: 'Simba', breed: 'Maine Coon', age: '2 years', location: 'Casablanca' },
  { emoji: '🐕', name: 'Rocky', breed: 'Husky', age: '1 year', location: 'Fes' },
];

const marqueeItems = ['Golden Retriever', 'Persian Cat', 'Holland Lop', 'Labrador', 'Maine Coon', 'Husky', 'Beagle', 'Siamese Cat', 'Poodle', 'Corgi'];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } }),
};

export default function Landing() {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <Navbar />

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen bg-[#FAF7F2] flex flex-col pt-16 overflow-hidden">
        {/* Eyebrow */}
        <div className="flex items-center justify-between px-8 md:px-16 pt-12 pb-0 max-w-7xl mx-auto w-full">
          <span className="tag tag-coral">🐾 Morocco's #1 Adoption Platform</span>
          <div className="hidden md:flex items-center gap-2 text-sm text-[#8c7e74]">
            <span className="w-2 h-2 rounded-full bg-teal animate-pulse inline-block" />
            <span>250+ pets available now</span>
          </div>
        </div>

        {/* Giant Headline */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 md:px-16 pt-10 pb-0 text-center max-w-7xl mx-auto w-full">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="font-display font-black text-display-xl text-[#0D0D0D] leading-[0.88] tracking-[-0.04em] mb-8"
          >
            Every Pet<br />
            <em className="not-italic text-coral">Deserves</em><br />
            A Home
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-xl text-[#8c7e74] max-w-md leading-relaxed mb-10"
          >
            Connect with shelters across Morocco. Find your perfect companion and give them the life they deserve.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex items-center gap-4 flex-wrap justify-center mb-20"
          >
            <button onClick={() => navigate('/pets')} className="btn-dark text-base">
              Find a Pet
            </button>
            <button onClick={() => navigate('/shelters')} className="btn-outline text-base">
              Partner Shelters
            </button>
          </motion.div>

          {/* Pet cards horizontal scroll */}
          <div className="w-full overflow-x-auto no-scrollbar -mx-8">
            <div className="flex gap-4 px-8 pb-10" style={{ width: 'max-content' }}>
              {pets.map((pet, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                  onClick={() => navigate('/pets')}
                  className="w-44 bg-white rounded-2xl p-5 border border-[#E8E0D8] flex-shrink-0 cursor-pointer hover:-translate-y-2 hover:shadow-card-hover transition-all duration-300"
                >
                  <div className="text-4xl mb-3">{pet.emoji}</div>
                  <p className="font-bold text-[#0D0D0D] text-sm">{pet.name}</p>
                  <p className="text-[#8c7e74] text-xs mt-0.5">{pet.breed}</p>
                  <p className="text-xs text-[#b8aaa0] mt-3">📍 {pet.location}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── MARQUEE ─── */}
      <div className="bg-coral py-4 overflow-hidden border-y border-coral-dark">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="text-white font-bold text-sm tracking-widest uppercase mx-8">
              {item} <span className="text-white/40 mx-4">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ─── STATS ─── */}
      <section className="bg-[#0D0D0D] py-24 px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              className="px-8 py-10 text-center"
            >
              <div className="font-display text-[64px] leading-none tracking-tight text-white">
                <CounterAnimation value={stat.value} />{stat.suffix}
              </div>
              <p className="text-white/40 text-xs tracking-widest uppercase font-semibold mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="bg-[#FAF7F2] py-24 px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-16 items-start">
          {/* Left sticky label */}
          <div className="md:w-5/12 md:sticky md:top-28">
            <span className="tag tag-dark mb-6">Process</span>
            <h2 className="font-display font-black text-display-md text-[#0D0D0D] mt-4 leading-[0.92]">
              How it<br /><em className="not-italic text-coral">works</em>
            </h2>
            <p className="text-[#8c7e74] mt-6 text-lg leading-relaxed max-w-xs">
              Three simple steps between you and your new best friend.
            </p>
            <button onClick={() => navigate('/pets')} className="btn-dark mt-8">
              Start Browsing
            </button>
          </div>
          {/* Right steps */}
          <div className="md:w-7/12 divide-y divide-[#E8E0D8]">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                className="flex items-start gap-8 py-10 group"
              >
                <span className="font-display font-black text-[72px] leading-none text-[#E8E0D8] group-hover:text-coral transition-colors duration-300 w-20 flex-shrink-0 text-right">
                  {step.number}
                </span>
                <div className="pt-2">
                  <h3 className="text-2xl font-bold text-[#0D0D0D] mb-2">{step.title}</h3>
                  <p className="text-[#8c7e74] leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED PETS BENTO ─── */}
      <section className="bg-white py-24 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="tag tag-coral mb-4">Available Now</span>
              <h2 className="font-display font-black text-display-md text-[#0D0D0D] mt-4 leading-[0.92]">
                Meet your<br /><em className="not-italic text-teal">new family</em>
              </h2>
            </div>
            <button onClick={() => navigate('/pets')} className="btn-outline hidden md:flex">
              View All Pets
            </button>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* Large card */}
            <motion.div
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              onClick={() => navigate('/pets')}
              className="col-span-2 md:col-span-1 md:row-span-2 bg-[#FAF7F2] rounded-3xl p-8 border border-[#E8E0D8] cursor-pointer hover:border-coral/30 hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between min-h-[280px]"
            >
              <div className="text-7xl">{pets[0].emoji}</div>
              <div>
                <span className="tag tag-teal mb-3">Available</span>
                <h3 className="text-2xl font-bold text-[#0D0D0D]">{pets[0].name}</h3>
                <p className="text-[#8c7e74] mt-1">{pets[0].breed} · {pets[0].age}</p>
                <p className="text-xs text-[#b8aaa0] mt-2">📍 {pets[0].location}</p>
              </div>
            </motion.div>

            {/* Regular cards */}
            {pets.slice(1, 5).map((pet, i) => (
              <motion.div
                key={i}
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i + 1}
                onClick={() => navigate('/pets')}
                className="bg-[#FAF7F2] rounded-3xl p-6 border border-[#E8E0D8] cursor-pointer hover:border-coral/30 hover:shadow-card-hover transition-all duration-300"
              >
                <div className="text-4xl mb-4">{pet.emoji}</div>
                <h3 className="font-bold text-[#0D0D0D]">{pet.name}</h3>
                <p className="text-[#8c7e74] text-sm mt-0.5">{pet.breed}</p>
                <p className="text-xs text-[#b8aaa0] mt-3">📍 {pet.location}</p>
              </motion.div>
            ))}
          </div>

          <button onClick={() => navigate('/pets')} className="btn-outline w-full mt-6 md:hidden">
            View All Pets
          </button>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="bg-[#FAF7F2] py-24 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="tag tag-outline mb-4">Stories</span>
            <h2 className="font-display font-black text-display-md text-[#0D0D0D] mt-4 leading-[0.92]">
              Happy families,<br /><em className="not-italic text-coral">real stories</em>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
                className={`rounded-3xl p-8 border ${
                  i === 1
                    ? 'bg-[#0D0D0D] border-[#0D0D0D]'
                    : 'bg-white border-[#E8E0D8]'
                }`}
              >
                <p className={`font-serif text-xl leading-relaxed mb-8 ${i === 1 ? 'text-white/80' : 'text-[#2A2A2A]'}`}>
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${i === 1 ? 'bg-white/15 text-white' : 'bg-coral text-white'}`}>
                    {t.name[0]}
                  </div>
                  <div>
                    <p className={`font-semibold text-sm ${i === 1 ? 'text-white' : 'text-[#0D0D0D]'}`}>{t.name}</p>
                    <p className={`text-xs ${i === 1 ? 'text-white/40' : 'text-[#8c7e74]'}`}>{t.role} · {t.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SHELTER PARTNER STRIP ─── */}
      <section className="bg-[#0D0D0D] py-20 px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div>
            <span className="tag tag-coral mb-4">For Shelters</span>
            <h2 className="font-display font-black text-display-sm text-white mt-4 leading-tight">
              Are you a shelter<br />or rescue org?
            </h2>
            <p className="text-white/50 mt-4 text-lg max-w-sm leading-relaxed">
              List your animals on Nino and reach thousands of families looking to adopt across Morocco.
            </p>
          </div>
          <div className="flex flex-col gap-3 flex-shrink-0">
            <button onClick={() => navigate('/register')} className="btn-coral text-base px-10">
              Partner With Us
            </button>
            <button onClick={() => navigate('/shelters')} className="btn-outline-white text-base px-10">
              View All Shelters
            </button>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="bg-coral py-32 px-8 overflow-hidden relative">
        {/* Big decorative text behind */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="font-display font-black text-[20vw] text-white/10 whitespace-nowrap leading-none">
            Nino
          </span>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h2
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="font-display font-black text-display-lg text-white leading-[0.88]"
          >
            Ready to find<br />your companion?
          </motion.h2>
          <motion.p
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}
            className="text-white/70 text-xl max-w-md mx-auto mt-8 mb-12 leading-relaxed"
          >
            Thousands of pets across Morocco are waiting for someone exactly like you.
          </motion.p>
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2}
            className="flex items-center gap-4 justify-center flex-wrap"
          >
            <button onClick={() => navigate('/pets')} className="btn-white text-base px-10">
              Browse Pets
            </button>
            <button onClick={() => navigate('/register')} className="btn-outline-white text-base px-10">
              Create Account
            </button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </PageTransition>
  );
}

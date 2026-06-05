import { useState } from 'react';
import api from '../../api/client';

export default function NewsletterSection() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setMessage('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const { status, data } = await api.post('/newsletter/subscribe', {
        email: email.trim(),
        name: name.trim() || null,
      });

      if (status === 201) {
        setSubscribed(true);
      } else if (status === 200) {
        setSubscribed(true);
      }
    } catch (err) {
      const resp = err.response;
      if (resp?.status === 409) {
        setMessage("You're already subscribed!");
      } else {
        setMessage('Something went wrong. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (subscribed) {
    return (
      <section style={{ background: 'linear-gradient(135deg, #A0522D, #8B2500)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div style={{ opacity: 1, transition: 'opacity 0.5s ease-in' }}>
            <span className="text-5xl block mb-4">🐾</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#F5E6D3] mb-2">
              You're in! Welcome to the PawFinds family.
            </h2>
            <p className="text-[#F5E6D3]/70 text-lg">
              We'll send you adoptable pets, vet tips, and shelter news.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section style={{ background: 'linear-gradient(135deg, #A0522D, #8B2500)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#F5E6D3] mb-3">
            Stay in the loop
          </h2>
          <p className="text-[#F5E6D3]/70 text-lg mb-8">
            Adoptable pets, vet tips, and shelter news — delivered to your inbox.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name (optional)"
              className="flex-1 px-4 py-3 rounded-xl bg-white/15 border border-white/20 text-[#F5E6D3] placeholder:text-[#F5E6D3]/40 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8962A]/50 focus:border-[#C8962A] transition-all"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="Your email address"
              className="flex-1 px-4 py-3 rounded-xl bg-white/15 border border-white/20 text-[#F5E6D3] placeholder:text-[#F5E6D3]/40 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8962A]/50 focus:border-[#C8962A] transition-all"
            />
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-[#F5E6D3] text-[#8B2500] font-bold text-sm hover:bg-white disabled:opacity-60 transition-all whitespace-nowrap"
            >
              {loading ? 'Subscribing\u2026' : 'Subscribe'}
            </button>
          </div>

          {error && (
            <p className="text-red-300 text-sm mt-3" style={{ opacity: 1, transition: 'opacity 0.3s ease-in' }}>
              {error}
            </p>
          )}
          {message && (
            <p className="text-[#F5E6D3] text-sm mt-3" style={{ opacity: 1, transition: 'opacity 0.3s ease-in' }}>
              {message}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

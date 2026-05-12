import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import PageTransition from '../../components/animations/PageTransition';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleTab, setRoleTab] = useState('admin');
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const floatRef = useRef(null);

  useEffect(() => {
    if (!floatRef.current) return;
    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    tl.to(floatRef.current.children, {
      y: -15, rotation: 8, duration: 2, stagger: 0.3, ease: 'power1.inOut',
    });
    return () => tl.kill();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      if (user.role === 'SuperAdmin') navigate('/superadmin/dashboard');
      else if (user.role === 'Enterprise') navigate('/enterprise/dashboard');
      else if (user.role === 'Veterinaire') navigate('/veterinaire/dashboard');
      else navigate('/client/dashboard');
    } catch {}
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="hidden lg:flex w-1/2 items-center justify-center p-12 relative overflow-hidden"
          style={{ background: 'var(--sh-coral-light)' }}
        >
          <div className="relative text-center max-w-sm" ref={floatRef}>
            <div className="text-8xl mb-6 flex justify-center gap-4">
              <span className="inline-block">🐕</span>
              <span className="inline-block">🐈</span>
              <span className="inline-block">🐰</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Welcome Back</h1>
            <p className="text-gray-600 text-lg">Sign in to manage your shelter dashboard</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-1/2 flex items-center justify-center p-8"
        >
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-1">Sign In</h2>
              <p className="text-gray-500 text-sm">Enter your credentials to continue</p>
            </div>

            <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
              <button
                onClick={() => setRoleTab('admin')}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  roleTab === 'admin' ? 'bg-white text-coral shadow-sm' : 'text-gray-500'
                }`}
              >
                Admin
              </button>
              <button
                onClick={() => setRoleTab('client')}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  roleTab === 'client' ? 'bg-white text-coral shadow-sm' : 'text-gray-500'
                }`}
              >
                Client
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@super-hayawan.com"
                required
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}

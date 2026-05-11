import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import PageTransition from '../../components/animations/PageTransition';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      if (user.role === 'SuperAdmin') navigate('/superadmin/dashboard');
      else if (user.role === 'Admin') navigate('/admin/dashboard');
      else navigate('/client/dashboard');
    } catch {}
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hidden lg:flex w-1/2 bg-gradient-to-br from-coral to-coral-dark items-center justify-center p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.08),transparent_60%)]" />
          <div className="relative text-white text-center max-w-sm">
            <div className="text-8xl mb-6">🐾</div>
            <h1 className="text-4xl font-bold mb-3">Welcome Back</h1>
            <p className="text-white/70 text-lg">Sign in to manage your shelter dashboard</p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-sm">
            <h2 className="text-3xl font-bold text-gray-900 mb-1">Sign In</h2>
            <p className="text-gray-500 text-sm mb-8">Enter your credentials to continue</p>
            <form onSubmit={handleSubmit}>
              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@pawfinds.com" required />
              <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
              {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</Button>
            </form>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}

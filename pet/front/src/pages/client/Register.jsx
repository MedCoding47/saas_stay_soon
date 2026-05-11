import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import PageTransition from '../../components/animations/PageTransition';

export default function ClientRegister() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return;
    try {
      await register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        organizationId: '372fbbfe-ec4d-4024-23f7-08deae08aef0',
      });
      navigate('/client/login');
    } catch {}
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--sh-warm)' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🐾</div>
            <h1 className="text-2xl font-bold text-gray-900">
              Join <span className="text-coral">Super-hayawan</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">Create your account to start adopting</p>
          </div>
          <form onSubmit={handleSubmit}>
            <Input label="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="John Doe" required />
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" required />
            <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" required minLength={6} />
            <Input label="Confirm Password" type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} placeholder="••••••••" required minLength={6} />
            {form.password !== form.confirmPassword && form.confirmPassword && (
              <p className="text-red-500 text-sm mb-4">Passwords do not match</p>
            )}
            {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <a href="/client/login" className="text-coral font-medium hover:underline">Sign in</a>
          </p>
        </motion.div>
      </div>
    </PageTransition>
  );
}

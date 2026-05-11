import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import PageTransition from '../../components/animations/PageTransition';

export default function ClientRegister() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email format';
    if (form.password.length < 6) errs.password = 'Must be at least 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await register({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        organizationId: '372fbbfe-ec4d-4024-23f7-08deae08aef0',
      });
      navigate('/client/dashboard');
    } catch {}
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-warm-light flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-xl p-10 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🐾</div>
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-500 text-sm mt-1">Join PawFinds and start adopting</p>
          </div>
          <form onSubmit={handleSubmit}>
            <Input label="Full Name" value={form.fullName} onChange={handleChange('fullName')} placeholder="John Doe" error={errors.fullName} required />
            <Input label="Email" type="email" value={form.email} onChange={handleChange('email')} placeholder="you@example.com" error={errors.email} required />
            <Input label="Password" type="password" value={form.password} onChange={handleChange('password')} placeholder="Min. 6 characters" error={errors.password} required />
            <Input label="Confirm Password" type="password" value={form.confirmPassword} onChange={handleChange('confirmPassword')} placeholder="Repeat password" error={errors.confirmPassword} required />
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/client/login" className="text-coral font-semibold hover:underline">Sign In</Link>
          </p>
        </motion.div>
      </div>
    </PageTransition>
  );
}

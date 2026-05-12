import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/client';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import PageTransition from '../../components/animations/PageTransition';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function SuperAdminCreateAccount() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('enterprise');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const [enterprise, setEnterprise] = useState({
    orgName: '', orgSlug: '',
    companyName: '', location: '', description: '',
    companyPhone: '', companyEmail: '', website: '',
    adminEmail: '', adminFullName: '', adminPhone: '',
  });
  const [veterinaire, setVeterinaire] = useState({
    orgName: '', orgSlug: '',
    clinicName: '', location: '', description: '',
    clinicPhone: '', isAvailable: true,
    adminEmail: '', adminFullName: '', adminPhone: '',
  });

  const handleEnterpriseChange = (e) => setEnterprise({ ...enterprise, [e.target.name]: e.target.value });
  const handleVetChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setVeterinaire({ ...veterinaire, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const payload = tab === 'enterprise' ? enterprise : veterinaire;
      const endpoint = tab === 'enterprise' ? '/superadmin/create-enterprise' : '/superadmin/create-veterinaire';
      const { data } = await api.post(endpoint, payload);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.title || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setResult(null);
    setError('');
  };

  return (
    <PageTransition>
      <Navbar />
      <main className="min-h-screen bg-warm pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <button onClick={() => navigate('/superadmin/dashboard')} className="text-sm text-coral hover:underline mb-4 inline-block">&larr; Back to Dashboard</button>
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Create Account</h1>

          {result ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-card p-6 text-center">
              <div className="text-5xl mb-4">&#10003;</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Account Created Successfully</h2>
              <p className="text-muted mb-6">The user can now log in with these credentials.</p>
              <div className="bg-warm rounded-xl p-4 mb-6 text-left text-sm space-y-2 max-w-sm mx-auto">
                <div className="flex justify-between"><span className="text-muted">Temp Password</span><code className="font-mono font-bold text-coral bg-coral-light px-2 py-0.5 rounded">{result.tempPassword}</code></div>
                <div className="flex justify-between"><span className="text-muted">User ID</span><code className="font-mono text-xs text-gray-500">{result.userId}</code></div>
              </div>
              <div className="flex gap-3 justify-center">
                <Button variant="primary" onClick={() => navigate('/superadmin/dashboard')}>Go to Dashboard</Button>
                <Button variant="outline" onClick={resetForm}>Create Another</Button>
              </div>
            </motion.div>
          ) : (
            <>
              <div className="flex bg-white rounded-xl shadow-sm p-1 mb-6">
                {[
                  { key: 'enterprise', label: 'Enterprise' },
                  { key: 'veterinaire', label: 'Veterinaire' },
                ].map((t) => (
                  <button key={t.key} onClick={() => { setTab(t.key); setError(''); }}
                    className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${tab === t.key ? 'bg-coral text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    {t.label}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.form key={tab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card p-6 space-y-6">

                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-3">Organization</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input label="Organization Name" name="orgName" value={tab === 'enterprise' ? enterprise.orgName : veterinaire.orgName}
                        onChange={tab === 'enterprise' ? handleEnterpriseChange : handleVetChange} required placeholder="e.g. Happy Paws Shelter" />
                      <Input label="Organization Slug" name="orgSlug" value={tab === 'enterprise' ? enterprise.orgSlug : veterinaire.orgSlug}
                        onChange={tab === 'enterprise' ? handleEnterpriseChange : handleVetChange} required placeholder="e.g. happy-paws" />
                    </div>
                  </div>

                  {tab === 'enterprise' ? (
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 mb-3">Company Details</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Company Name" name="companyName" value={enterprise.companyName} onChange={handleEnterpriseChange} required placeholder="Happy Paws SARL" />
                        <Input label="Location" name="location" value={enterprise.location} onChange={handleEnterpriseChange} required placeholder="Casablanca, Morocco" />
                        <Input label="Phone" name="companyPhone" value={enterprise.companyPhone} onChange={handleEnterpriseChange} placeholder="+212 5XX XX XX XX" />
                        <Input label="Email" name="companyEmail" value={enterprise.companyEmail} onChange={handleEnterpriseChange} placeholder="contact@happypaws.ma" type="email" />
                        <Input label="Website" name="website" value={enterprise.website} onChange={handleEnterpriseChange} placeholder="https://happypaws.ma" />
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <textarea name="description" value={enterprise.description} onChange={handleEnterpriseChange} rows={2}
                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/40 focus:border-coral transition-all resize-none"
                            placeholder="Brief description of the company..." />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 mb-3">Clinic Details</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Clinic Name" name="clinicName" value={veterinaire.clinicName} onChange={handleVetChange} required placeholder="Happy Paws Vet Clinic" />
                        <Input label="Location" name="location" value={veterinaire.location} onChange={handleVetChange} required placeholder="Rabat, Morocco" />
                        <Input label="Phone" name="clinicPhone" value={veterinaire.clinicPhone} onChange={handleVetChange} placeholder="+212 5XX XX XX XX" />
                        <div className="flex items-center gap-3 pt-6">
                          <input type="checkbox" id="isAvailable" name="isAvailable" checked={veterinaire.isAvailable} onChange={handleVetChange}
                            className="w-4 h-4 rounded border-gray-300 text-coral focus:ring-coral" />
                          <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700">Available for consultations</label>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <textarea name="description" value={veterinaire.description} onChange={handleVetChange} rows={2}
                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral/40 focus:border-coral transition-all resize-none"
                            placeholder="Services offered, specialties..." />
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-3">Admin Account</h2>
                    <p className="text-xs text-muted mb-3">This person will be the main administrator for this {tab}.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input label="Full Name" name="adminFullName" value={tab === 'enterprise' ? enterprise.adminFullName : veterinaire.adminFullName}
                        onChange={tab === 'enterprise' ? handleEnterpriseChange : handleVetChange} required placeholder="John Doe" />
                      <Input label="Email" name="adminEmail" value={tab === 'enterprise' ? enterprise.adminEmail : veterinaire.adminEmail}
                        onChange={tab === 'enterprise' ? handleEnterpriseChange : handleVetChange} required placeholder="john@happypaws.ma" type="email" />
                      <Input label="Phone" name="adminPhone" value={tab === 'enterprise' ? enterprise.adminPhone : veterinaire.adminPhone}
                        onChange={tab === 'enterprise' ? handleEnterpriseChange : handleVetChange} placeholder="+212 6XX XX XX XX" />
                    </div>
                  </div>

                  {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

                  <div className="flex gap-3 pt-2">
                    <Button type="submit" className="flex-1" disabled={loading}>
                      {loading ? 'Creating...' : `Create ${tab === 'enterprise' ? 'Enterprise' : 'Veterinaire'} Account`}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => navigate('/superadmin/dashboard')}>Cancel</Button>
                  </div>
                </motion.form>
              </AnimatePresence>
            </>
          )}
        </div>
      </main>
      <Footer />
    </PageTransition>
  );
}

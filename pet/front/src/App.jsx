import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Landing from './pages/Landing';
import PetBrowser from './pages/pets/PetBrowser';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import PetManagement from './pages/admin/PetManagement';
import AdminAdoptions from './pages/admin/Adoptions';
import AdminUsers from './pages/admin/Users';
import AdminMessages from './pages/admin/Messages';
import ClientLogin from './pages/client/Login';
import ClientRegister from './pages/client/Register';
import ClientDashboard from './pages/client/Dashboard';
import ClientMessages from './pages/client/Messages';
import SuperAdminDashboard from './pages/superadmin/Dashboard';

function ProtectedRoute({ children, roles }) {
  const user = JSON.parse(localStorage.getItem('pawfinds-user') || 'null');
  const token = localStorage.getItem('pawfinds-token');
  if (!token) return <Navigate to="/admin" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="/pets" element={<PetBrowser />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<ProtectedRoute roles={['Admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/pets" element={<ProtectedRoute roles={['Admin']}><PetManagement /></ProtectedRoute>} />
        <Route path="/admin/adoptions" element={<ProtectedRoute roles={['Admin']}><AdminAdoptions /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={['Admin']}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/messages" element={<ProtectedRoute roles={['Admin']}><AdminMessages /></ProtectedRoute>} />
        <Route path="/client/login" element={<ClientLogin />} />
        <Route path="/client/register" element={<ClientRegister />} />
        <Route path="/client/dashboard" element={<ProtectedRoute roles={['Applicant']}><ClientDashboard /></ProtectedRoute>} />
        <Route path="/client/messages" element={<ProtectedRoute roles={['Applicant']}><ClientMessages /></ProtectedRoute>} />
        <Route path="/superadmin/dashboard" element={<ProtectedRoute roles={['SuperAdmin']}><SuperAdminDashboard /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

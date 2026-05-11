import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Landing from './pages/Landing';
import PetBrowser from './pages/pets/PetBrowser';
import SwipeMode from './pages/swipe/SwipeMode';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import PetManagement from './pages/admin/PetManagement';
import AdminAdoptions from './pages/admin/Adoptions';
import ClientLogin from './pages/client/Login';
import ClientRegister from './pages/client/Register';
import ClientDashboard from './pages/client/Dashboard';

function ProtectedRoute({ children, roles }) {
  const user = JSON.parse(localStorage.getItem('sh-user') || 'null');
  const token = localStorage.getItem('sh-token');
  const role = localStorage.getItem('sh-role');
  if (!token) return <Navigate to="/admin" replace />;
  if (roles && !roles.includes(user?.role) && !roles.includes(role)) return <Navigate to="/" replace />;
  return children;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="/pets" element={<PetBrowser />} />
        <Route path="/swipe" element={<SwipeMode />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<ProtectedRoute roles={['Admin', 'SuperAdmin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/pets" element={<ProtectedRoute roles={['Admin', 'SuperAdmin']}><PetManagement /></ProtectedRoute>} />
        <Route path="/admin/adoptions" element={<ProtectedRoute roles={['Admin', 'SuperAdmin']}><AdminAdoptions /></ProtectedRoute>} />
        <Route path="/client/login" element={<ClientLogin />} />
        <Route path="/client/register" element={<ClientRegister />} />
        <Route path="/client/dashboard" element={<ProtectedRoute roles={['Applicant', 'Admin', 'SuperAdmin']}><ClientDashboard /></ProtectedRoute>} />
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

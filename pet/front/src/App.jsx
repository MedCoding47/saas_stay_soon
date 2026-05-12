import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Landing from './pages/Landing';
import PetBrowser from './pages/pets/PetBrowser';
import PetDetails from './pages/pets/PetDetails';
import AdoptedPets from './pages/pets/AdoptedPets';
import SwipeMode from './pages/swipe/SwipeMode';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import PetManagement from './pages/admin/PetManagement';
import AdminAdoptions from './pages/admin/Adoptions';
import AdminConversations from './pages/admin/Conversations';
import ClientLogin from './pages/client/Login';
import ClientRegister from './pages/client/Register';
import ClientDashboard from './pages/client/Dashboard';
import ClientMessages from './pages/client/Messages';
import EnterpriseDashboard from './pages/enterprise/Dashboard';
import VeterinaireDashboard from './pages/veterinaire/Dashboard';
import SuperAdminDashboard from './pages/superadmin/Dashboard';
import SuperAdminUserDetails from './pages/superadmin/UserDetails';
import SuperAdminCreateAccount from './pages/superadmin/CreateAccount';
import SuperAdminOrganizationDetail from './pages/superadmin/OrganizationDetail';

function ProtectedRoute({ children, roles }) {
  const user = JSON.parse(localStorage.getItem('sh-user') || 'null');
  const token = localStorage.getItem('sh-token');
  const role = localStorage.getItem('sh-role');
  if (!token) return <Navigate to="/" replace />;
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
        <Route path="/pets/:id" element={<PetDetails />} />
        <Route path="/pets/adopted" element={<AdoptedPets />} />
        <Route path="/swipe" element={<SwipeMode />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<ProtectedRoute roles={['SuperAdmin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/pets" element={<ProtectedRoute roles={['SuperAdmin']}><PetManagement /></ProtectedRoute>} />
        <Route path="/admin/adoptions" element={<ProtectedRoute roles={['SuperAdmin']}><AdminAdoptions /></ProtectedRoute>} />
        <Route path="/admin/conversations" element={<ProtectedRoute roles={['SuperAdmin']}><AdminConversations /></ProtectedRoute>} />
        <Route path="/client/login" element={<ClientLogin />} />
        <Route path="/client/register" element={<ClientRegister />} />
        <Route path="/client/dashboard" element={<ProtectedRoute roles={['Client', 'Enterprise', 'Veterinaire', 'SuperAdmin']}><ClientDashboard /></ProtectedRoute>} />
        <Route path="/client/messages" element={<ProtectedRoute roles={['Client', 'Enterprise', 'Veterinaire', 'SuperAdmin']}><ClientMessages /></ProtectedRoute>} />
        <Route path="/enterprise/dashboard" element={<ProtectedRoute roles={['Enterprise']}><EnterpriseDashboard /></ProtectedRoute>} />
        <Route path="/veterinaire/dashboard" element={<ProtectedRoute roles={['Veterinaire']}><VeterinaireDashboard /></ProtectedRoute>} />
        <Route path="/superadmin/dashboard" element={<ProtectedRoute roles={['SuperAdmin']}><SuperAdminDashboard /></ProtectedRoute>} />
        <Route path="/superadmin/users/:id" element={<ProtectedRoute roles={['SuperAdmin']}><SuperAdminUserDetails /></ProtectedRoute>} />
        <Route path="/superadmin/create-account" element={<ProtectedRoute roles={['SuperAdmin']}><SuperAdminCreateAccount /></ProtectedRoute>} />
        <Route path="/superadmin/organizations/:id" element={<ProtectedRoute roles={['SuperAdmin']}><SuperAdminOrganizationDetail /></ProtectedRoute>} />
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

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./Components/NavBar/Navbar";
import Home from "./Components/Home/Home";
import Footer from "./Components/Footer/Footer";
import AdminLogin from "./Components/AdminPanel/AdminLogin";
import AdminPanel from "./Components/AdminPanel/AdminPanel";
import { ClientAuthProvider } from "./Components/ClientPanel/ClientAuthContext";
import ClientLogin from "./Components/ClientPanel/ClientLogin";
import ClientRegister from "./Components/ClientPanel/ClientRegister";
import ClientDashboard from "./Components/ClientPanel/ClientDashboard";
import LoginPage from "./Components/NavBar/LoginPage"; // Importez le composant LoginPage
import api from './config/api';
import PetsViewer from './Components/Pets/PetsViewer';
import PetDetails from './Components/Pets/PetDetails';
import { useEffect, useState } from 'react';
import "./App.css";

// Protected Route for Admin
const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('pawfinds-token');
  const role = localStorage.getItem('pawfinds-role');
  const isAdmin = token && (role === 'Admin' || role === 'Staff' || role === 'SuperAdmin');
  return isAdmin ? children : <Navigate to="/admin" replace />;
};

// Protected Route for Client
const ClientProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('pawfinds-token');
  return isAuthenticated ? children : <Navigate to="/client/login" replace />;
};

const Layout = ({ children }) => (
  <>
    <Navbar title="PawFinds" />
    {children}
    <Footer title="PawFinds" />
  </>
);

const App = () => {
  const [pets, setPets] = useState([]);

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await api.get('/pets');
        if (Array.isArray(response.data)) {
          setPets(response.data);
        } else {
          console.error("Error: Response data is not an array");
        }
      } catch (error) {
        console.error("Error fetching pets:", error);
      }
    };

    fetchPets();
  }, []);

  return (
    <Router>
      <ClientAuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/" 
            element={
              <Layout>
                <Home description="Ensure you are fully prepared to provide proper care and attention to your pet before welcoming them into your home." />
              </Layout>
            } 
          />
          <Route 
            path="/pets" 
            element={
              <Layout>
                <PetsViewer pets={pets} />
              </Layout>
            } 
          />
          <Route 
            path="/pets/:id" 
            element={
              <Layout>
                <PetDetails pets={pets} />
              </Layout>
            } 
          />
          
          {/* Page de connexion */}
          <Route path="/connexion" element={<LoginPage />} />
          
          {/* Client Auth Routes */}
          <Route path="/client/login" element={<ClientLogin />} />
          <Route path="/client/register" element={<ClientRegister />} />
          <Route 
            path="/client/dashboard" 
            element={
              <ClientProtectedRoute>
                <Layout>
                  <ClientDashboard />
                </Layout>
              </ClientProtectedRoute>
            } 
          />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route 
            path="/admin/panel" 
            element={
              <AdminProtectedRoute>
                <AdminPanel />
              </AdminProtectedRoute>
            } 
          />
          
          {/* Redirect any unknown paths to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ClientAuthProvider>
    </Router>
  );
};

export default App;
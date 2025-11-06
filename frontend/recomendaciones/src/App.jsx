import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

// Importar contexto y páginas
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import SimpleLandingPage from './pages/SimpleLandingPage';
import DestinosPage from './pages/DestinosPage';
import DestinoDetailPage from './pages/DestinoDetailPage';
import ToursPage from './pages/ToursPage';
import TourDetailPage from './pages/TourDetailPage';
import MisReservasPage from './pages/MisReservasPage';
import ServiciosPage from './pages/ServiciosPage';
import ServicioDetailPage from './pages/ServicioDetailPage';
import MisContratacionesPage from './pages/MisContratacionesPage';
import RecomendacionesPage from './pages/RecomendacionesPage';
import MisRecomendacionesPage from './pages/MisRecomendacionesPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing Page - Página principal */}
          <Route path="/" element={<SimpleLandingPage />} />
          {/* Página de Destinos */}
          <Route path="/destinos" element={<DestinosPage />} />
          {/* Página de Detalle de Destino */}
          <Route path="/destinos/:id" element={<DestinoDetailPage />} />
          {/* Página de Tours */}
          <Route path="/tours" element={<ToursPage />} />
          {/* Página de Detalle de Tour */}
          <Route path="/tours/:id" element={<TourDetailPage />} />
          {/* Página de Servicios */}
          <Route path="/servicios" element={<ServiciosPage />} />
          {/* Página de Detalle de Servicio */}
          <Route path="/servicios/:id" element={<ServicioDetailPage />} />
          {/* Recomendaciones Públicas */}
          <Route path="/recomendaciones" element={<RecomendacionesPage />} />
          {/* Mis Reservas - Protegida */}
          <Route 
            path="/mis-reservas" 
            element={
              <ProtectedRoute>
                <MisReservasPage />
              </ProtectedRoute>
            } 
          />
          {/* Mis Contrataciones - Protegida */}
          <Route 
            path="/mis-contrataciones" 
            element={
              <ProtectedRoute>
                <MisContratacionesPage />
              </ProtectedRoute>
            } 
          />
          {/* Mis Recomendaciones - Protegida */}
          <Route 
            path="/mis-recomendaciones" 
            element={
              <ProtectedRoute>
                <MisRecomendacionesPage />
              </ProtectedRoute>
            } 
          />
          {/* Página de Login */}
          <Route path="/login" element={<LoginPage />} />
          {/* Página de Registro */}
          <Route path="/register" element={<RegisterPage />} />
          {/* Página de Perfil - Protegida */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          {/* Admin Login - Sin protección */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          {/* Admin Dashboard - Protegido con ProtectedAdminRoute */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            } 
          />
          {/* Ruta por defecto para cualquier otra página */}
          <Route path="*" element={<SimpleLandingPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

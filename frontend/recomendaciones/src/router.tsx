import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Páginas públicas
import LandingPage from './pages/LandingPage';
import SimpleLandingPage from './pages/SimpleLandingPage';
import DestinosPage from './pages/DestinosPage';
import DestinoDetailPage from './pages/DestinoDetailPage';
import ToursPage from './pages/ToursPage';
import TourDetailPage from './pages/TourDetailPage';
import ServiciosPage from './pages/ServiciosPage';
import ServicioDetailPage from './pages/ServicioDetailPage';
import RecomendacionesPage from './pages/RecomendacionesPage';

// Páginas protegidas
import MisReservasPage from './pages/MisReservasPage';
import MisContratacionesPage from './pages/MisContratacionesPage';
import MisRecomendacionesPage from './pages/MisRecomendacionesPage';
import ProfilePage from './pages/ProfilePage';
import MisPagosPage from './pages/MisPagosPage';

// Autenticación
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Admin
import AdminDashboard from './pages/AdminDashboard';
import AdminLoginPage from './pages/AdminLoginPage';

// Componentes de protección de rutas
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';

// Nuevos componentes
import MainDashboardPage from './pages/MainDashboardPage';

const AppRouter: React.FC = () => (
  <BrowserRouter>
    <Routes>
      {/* Página Principal */}
      <Route path="/" element={<SimpleLandingPage />} />
      <Route path="/landing" element={<LandingPage />} />
      
      {/* Páginas públicas */}
      <Route path="/destinos" element={<DestinosPage />} />
      <Route path="/destinos/:id" element={<DestinoDetailPage />} />
      <Route path="/tours" element={<ToursPage />} />
      <Route path="/tours/:id" element={<TourDetailPage />} />
      <Route path="/servicios" element={<ServiciosPage />} />
      <Route path="/servicios/:id" element={<ServicioDetailPage />} />
      <Route path="/recomendaciones" element={<RecomendacionesPage />} />
      
      {/* Autenticación */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Rutas protegidas para usuarios autenticados */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <MainDashboardPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/mis-reservas" 
        element={
          <ProtectedRoute>
            <MisReservasPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/mis-contrataciones" 
        element={
          <ProtectedRoute>
            <MisContratacionesPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/mis-recomendaciones" 
        element={
          <ProtectedRoute>
            <MisRecomendacionesPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/mis-pagos" 
        element={
          <ProtectedRoute>
            <MisPagosPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Admin */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route 
        path="/admin" 
        element={
          <ProtectedAdminRoute>
            <AdminDashboard />
          </ProtectedAdminRoute>
        } 
      />
      <Route 
        path="/admin/dashboard" 
        element={
          <ProtectedAdminRoute>
            <AdminDashboard />
          </ProtectedAdminRoute>
        } 
      />
      
      {/* Ruta por defecto */}
      <Route path="*" element={<SimpleLandingPage />} />
    </Routes>
  </BrowserRouter>
);

export default AppRouter;

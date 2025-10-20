import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

// Importar contexto y páginas
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import SimpleLandingPage from './pages/SimpleLandingPage';
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
          {/* Admin Dashboard - Protegido */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          {/* Ruta por defecto para cualquier otra página */}
          <Route path="*" element={<SimpleLandingPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

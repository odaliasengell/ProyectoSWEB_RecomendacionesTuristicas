import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

// Context y layout
import { AppProvider } from './contexts/AppContext';
import Layout from './components/Layout';

// Importar páginas
import HomePage from './pages/HomePage';
import GuiasPage from './pages/GuiasPage';
import ToursPage from './pages/ToursPage';
import ReservasPage from './pages/ReservasPage';
import DestinosPage from './pages/DestinosPage';
import RecomendacionesPage from './pages/RecomendacionesPage';
import DashboardPage from './pages/DashboardPage';
import RegisterUserPage from './pages/RegisterUserPage';
import RegisterGuidePage from './pages/RegisterGuidePage';
import ServicesPage from './pages/ServicesPage';
import ProfilePage from './pages/ProfilePage';

// Importar componentes de autenticación
import Login from './components/auth/Login';
import Register from './components/auth/Register';

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/guias" element={<GuiasPage />} />
            <Route path="/tours" element={<ToursPage />} />
            <Route path="/reservas" element={<ReservasPage />} />
            <Route path="/destinos" element={<DestinosPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/recomendaciones" element={<RecomendacionesPage />} />
            <Route path="/register/user" element={<RegisterUserPage />} />
            <Route path="/register/guide" element={<RegisterGuidePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegisterUserPage />} />
          </Routes>
        </Layout>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;

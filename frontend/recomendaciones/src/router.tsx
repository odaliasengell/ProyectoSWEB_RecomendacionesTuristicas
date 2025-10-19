import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import GuiasPage from './pages/GuiasPage';
import ToursPage from './pages/ToursPage';
import ReservasPage from './pages/ReservasPage';
import DestinosPage from './pages/DestinosPage';
import RecomendacionesPage from './pages/RecomendacionesPage';
import DashboardPage from './pages/DashboardPage';
import ServicesPage from './pages/ServicesPage';
import ProfilePage from './pages/ProfilePage';

const AppRouter: React.FC = () => (
  <BrowserRouter>
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
    </Routes>
  </BrowserRouter>
);

export default AppRouter;

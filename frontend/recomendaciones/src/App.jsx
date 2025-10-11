import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './App.css';

// Importar páginas
import HomePage from './pages/HomePage';
import GuiasPage from './pages/GuiasPage';
import ToursPage from './pages/ToursPage';
import ReservasPage from './pages/ReservasPage';
import DestinosPage from './pages/DestinosPage';
import RecomendacionesPage from './pages/RecomendacionesPage';
import DashboardPage from './pages/DashboardPage';

// Importar componentes de autenticación
import Login from './components/auth/Login';
import Register from './components/auth/Register';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <nav className="navbar">
          <h1>Turismo App</h1>
          <div className="nav-links">
            <Link to="/">Inicio</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/guias">Guías</Link>
            <Link to="/tours">Tours</Link>
            <Link to="/reservas">Reservas</Link>
            <Link to="/destinos">Destinos</Link>
            <Link to="/recomendaciones">Recomendaciones</Link>
            <Link to="/login">Login</Link>
            <Link to="/register">Registro</Link>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/guias" element={<GuiasPage />} />
            <Route path="/tours" element={<ToursPage />} />
            <Route path="/reservas" element={<ReservasPage />} />
            <Route path="/destinos" element={<DestinosPage />} />
            <Route path="/recomendaciones" element={<RecomendacionesPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;

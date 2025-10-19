import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';

const Navbar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, setUser } = useAppContext();

  const handleLogout = () => {
    // Limpiar datos de autenticación
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
    setOpen(false);
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="nav-inner">
        {/* Brand removed as requested - keep empty element for layout */}
        <div className="brand" />

        <button
          className="nav-toggle"
          aria-label="Toggle navigation"
          onClick={() => setOpen((s) => !s)}
        >
          ☰
        </button>

        <nav
          className={`nav-links ${open ? 'open' : ''}`}
          onClick={() => setOpen(false)}
        >
          <Link to="/">Inicio</Link>
          <Link to="/destinos">Destinos</Link>
          <Link to="/tours">Tours</Link>
          <Link to="/services">Servicios</Link>
          <Link to="/recomendaciones">Recomendaciones</Link>
          <Link to="/reservas">Reservas</Link>
          <Link to="/profile">Perfil</Link>
          {user ? (
            <div className="user-menu">
              <span className="user-name">{user.name || user.id}</span>
              <button onClick={handleLogout} className="logout-btn">
                Cerrar sesión
              </button>
            </div>
          ) : (
            <Link to="/login" className="cta">
              Iniciar sesión
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;

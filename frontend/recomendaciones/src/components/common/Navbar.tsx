import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [open, setOpen] = useState(false);

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

        <nav className={`nav-links ${open ? 'open' : ''}`} onClick={() => setOpen(false)}>
          <Link to="/">Inicio</Link>
          <Link to="/destinos">Destinos</Link>
          <Link to="/tours">Tours</Link>
          <Link to="/services">Servicios</Link>
          <Link to="/recomendaciones">Recomendaciones</Link>
          <Link to="/reservas">Reservas</Link>
          <Link to="/profile">Perfil</Link>
          <Link to="/login" className="cta">Iniciar sesión</Link>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;

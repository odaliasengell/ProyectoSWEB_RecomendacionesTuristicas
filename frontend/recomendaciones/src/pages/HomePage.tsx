import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1>¡Bienvenido a Turismo App!</h1>
    <p>Explora nuestros servicios turísticos</p>

    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginTop: '2rem',
      }}
    >
      <Link to="/guias" style={{ textDecoration: 'none' }}>
        <div
          style={{
            background: '#f0f8ff',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #ddd',
          }}
        >
          <h3>Guías</h3>
          <p>Conoce a nuestros guías expertos</p>
        </div>
      </Link>

      <Link to="/tours" style={{ textDecoration: 'none' }}>
        <div
          style={{
            background: '#f0fff0',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #ddd',
          }}
        >
          <h3>Tours</h3>
          <p>Descubre increíbles experiencias</p>
        </div>
      </Link>

      <Link to="/destinos" style={{ textDecoration: 'none' }}>
        <div
          style={{
            background: '#fff8f0',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #ddd',
          }}
        >
          <h3>Destinos</h3>
          <p>Lugares únicos para visitar</p>
        </div>
      </Link>

      <Link to="/reservas" style={{ textDecoration: 'none' }}>
        <div
          style={{
            background: '#f8f0ff',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #ddd',
          }}
        >
          <h3>Reservas</h3>
          <p>Gestiona tus reservaciones</p>
        </div>
      </Link>
    </div>
  </div>
);

export default HomePage;

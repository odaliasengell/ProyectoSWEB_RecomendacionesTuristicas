import React from 'react';

const TestLandingPage = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #10b981, #2563eb)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <div>
        <h1 style={{ fontSize: '4rem', marginBottom: '1rem', fontWeight: 'bold' }}>
          🇪🇨 Explora Ecuador
        </h1>
        <p style={{ fontSize: '1.5rem', marginBottom: '2rem', opacity: 0.9 }}>
          Descubre la magia de Ecuador - Desde Galápagos hasta la Amazonía
        </p>
        <button style={{
          background: 'white',
          color: '#1f2937',
          padding: '1rem 2rem',
          border: 'none',
          borderRadius: '50px',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          transition: 'all 0.3s ease'
        }}>
          Comenzar Aventura ✈️
        </button>
        
        <div style={{ 
          marginTop: '3rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem',
          maxWidth: '800px'
        }}>
          <div>
            <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏝️ Galápagos</h3>
            <p>Fauna única del mundo</p>
          </div>
          <div>
            <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏛️ Quito</h3>
            <p>Patrimonio de la Humanidad</p>
          </div>
          <div>
            <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌿 Amazonía</h3>
            <p>Pulmón del planeta</p>
          </div>
          <div>
            <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏄 Montañita</h3>
            <p>Paraíso del surf</p>
          </div>
        </div>
        
        <div style={{ marginTop: '3rem', color: 'rgba(255,255,255,0.8)' }}>
          <p>✅ 200+ Destinos | ⭐ 50k+ Viajeros Felices | 🏆 4.9/5 Calificación</p>
        </div>
      </div>
    </div>
  );
};

export default TestLandingPage;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin } from 'lucide-react';
import { getDestinos } from '../services/api/destinos.service';

const DestinosDestacados = () => {
  const navigate = useNavigate();
  const [destinos, setDestinos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDestinosDestacados();
  }, []);

  const cargarDestinosDestacados = async () => {
    try {
      setLoading(true);
      console.log('🔍 Cargando destinos desde la API...');
      const todosDestinos = await getDestinos();
      console.log('📦 Total de destinos recibidos:', todosDestinos.length);
      console.log('📋 Todos los destinos:', todosDestinos);
      
      // Filtrar solo los destinos con calificación de 5 estrellas
      const destinosDestacados = todosDestinos.filter(destino => {
        const cal = destino.calificacion_promedio || destino.calificacion || destino.rating || 0;
        console.log(`🔍 Destino "${destino.nombre}": calificación = ${cal}`);
        return cal === 5;
      });
      
      console.log('⭐ Destinos con 5 estrellas:', destinosDestacados.length);
      console.log('📋 Destinos destacados:', destinosDestacados);
      setDestinos(destinosDestacados);
    } catch (error) {
      console.error('❌ Error cargando destinos destacados:', error);
      setDestinos([]);
    } finally {
      setLoading(false);
    }
  };

  // Estilos inline (mismo diseño que SimpleLandingPage)
  const sectionStyle = {
    padding: '5rem 0',
    background: 'linear-gradient(to bottom, #f9fafb, white)'
  };

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem'
  };

  const sectionTitleStyle = {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '1.5rem',
    textAlign: 'center'
  };

  const sectionSubtitleStyle = {
    fontSize: '1.25rem',
    color: '#4b5563',
    maxWidth: '48rem',
    margin: '0 auto 4rem auto',
    lineHeight: '1.6',
    textAlign: 'center'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem'
  };

  const cardStyle = {
    background: 'white',
    borderRadius: '1rem',
    overflow: 'hidden',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
  };

  const cardImageStyle = {
    width: '100%',
    height: '16rem',
    objectFit: 'cover'
  };

  const cardContentStyle = {
    padding: '1.5rem'
  };

  const cardTitleStyle = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '0.75rem'
  };

  const cardDescStyle = {
    color: '#4b5563',
    marginBottom: '1rem',
    lineHeight: '1.6'
  };

  const cardButtonStyle = {
    background: 'linear-gradient(135deg, #10b981, #2563eb)',
    color: 'white',
    padding: '0.5rem 1.5rem',
    border: 'none',
    borderRadius: '9999px',
    fontWeight: '500',
    cursor: 'pointer'
  };

  const emptyStateStyle = {
    textAlign: 'center',
    padding: '4rem 2rem',
    color: '#6b7280'
  };

  const spinnerStyle = {
    width: '3rem',
    height: '3rem',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #10b981',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto'
  };

  return (
    <section style={sectionStyle}>
      <div style={containerStyle}>
        <h2 style={sectionTitleStyle}>
          Destinos <span style={{ background: 'linear-gradient(45deg, #10b981, #2563eb)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Destacados</span>
        </h2>
        <p style={sectionSubtitleStyle}>
          Descubre los lugares más espectaculares del Ecuador. Cada destino ofrece experiencias únicas 
          que te conectarán con la naturaleza, la cultura y la aventura.
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={spinnerStyle}></div>
            <p style={{ marginTop: '1rem', color: '#6b7280' }}>Cargando destinos destacados...</p>
          </div>
        ) : destinos.length === 0 ? (
          <div style={emptyStateStyle}>
            <Star style={{ width: '4rem', height: '4rem', margin: '0 auto 1rem', color: '#d1d5db' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
              No hay destinos destacados aún
            </h3>
            <p>Los destinos con calificación de 5 estrellas aparecerán aquí automáticamente.</p>
          </div>
        ) : (
          <div style={gridStyle}>
            {destinos.map((destino, index) => {
              console.log('🎯 Destino en DestinosDestacados:', destino, 'ID:', destino.id, '_id:', destino._id);
              const rating = destino.calificacion_promedio || destino.calificacion || destino.rating || 5;
              const imagen = destino.ruta || destino.imagen_url || destino.imagen || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
              
              return (
                <div 
                  key={destino.id || index} 
                  style={cardStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  <img 
                    src={imagen} 
                    alt={destino.nombre} 
                    style={cardImageStyle}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
                    }}
                  />
                  <div style={cardContentStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <h3 style={cardTitleStyle}>{destino.nombre}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', color: '#eab308' }}>
                        <Star style={{ width: '1rem', height: '1rem', fill: 'currentColor' }} />
                        <span style={{ marginLeft: '0.25rem', fontSize: '0.875rem', color: '#4b5563' }}>{rating}</span>
                      </div>
                    </div>
                    <p style={cardDescStyle}>{destino.descripcion}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', color: '#6b7280', fontSize: '0.875rem' }}>
                        <MapPin style={{ width: '1rem', height: '1rem', marginRight: '0.25rem' }} />
                        {destino.provincia || 'Ecuador'}
                      </div>
                      <button 
                        onClick={() => navigate(`/destinos/${destino.id}`)}
                        style={cardButtonStyle}
                      >
                        Explorar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Keyframes para el spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
};

export default DestinosDestacados;
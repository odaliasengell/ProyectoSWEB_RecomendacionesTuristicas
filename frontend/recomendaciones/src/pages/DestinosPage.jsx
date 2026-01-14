import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import SimpleNavbar from '../components/SimpleNavbar';
import { MapPin, Star, Filter, Clock, DollarSign, Package } from 'lucide-react';
import { getDestinos } from '../services/api/destinos.service';
import { getTours } from '../services/api/tours.service';
import { getServicios } from '../services/api/servicios.service';

const DestinosPage = () => {
  const navigate = useNavigate();
  const [destinos, setDestinos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [filtroProvincia, setFiltroProvincia] = useState('todos');

  useEffect(() => {
    cargarDestinos();
  }, []);

  const cargarDestinos = async () => {
    try {
      setLoading(true);
      const data = await getDestinos();
      setDestinos(data);
      setError(null);
    } catch (err) {
      console.error('Error cargando destinos:', err);
      setError('No se pudieron cargar los destinos. Por favor, intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const destinosFiltrados = destinos.filter(destino => {
    const cumpleCategoria = filtroCategoria === 'todos' || destino.categoria === filtroCategoria;
    const cumpleProvincia = filtroProvincia === 'todos' || destino.provincia === filtroProvincia;
    return cumpleCategoria && cumpleProvincia && destino.activo !== false;
  });

  // Obtener categorías y provincias únicas
  const categorias = [...new Set(destinos.map(d => d.categoria).filter(Boolean))];
  const provincias = [...new Set(destinos.map(d => d.provincia).filter(Boolean))];

  const heroStyle = {
    minHeight: '30vh',
    backgroundImage: 'linear-gradient(135deg, rgba(16, 185, 129, 0.85) 0%, rgba(59, 130, 246, 0.75) 100%), url(/images/Destinos.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    textAlign: 'center',
    padding: '5rem 1rem 3rem 1rem',
    position: 'relative'
  };

  const sectionStyle = {
    padding: '4rem 0',
    background: 'linear-gradient(to bottom, #f9fafb, white)'
  };

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem'
  };

  const cardStyle = {
    background: 'white',
    borderRadius: '1rem',
    overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  };

  const filterBoxStyle = {
    background: 'white',
    borderRadius: '1rem',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '2rem',
    marginTop: '2rem'
  };

  const selectStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '2px solid #e5e7eb',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    color: '#374151',
    background: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #f9fafb, white)' }}>
      <SimpleNavbar />
      
      {/* Hero Section */}
      <div style={heroStyle}>
        <div style={{ maxWidth: '64rem', position: 'relative', zIndex: 2 }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem', lineHeight: '1.1', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
           🛣 Destinos
          </h1>
          <p style={{ fontSize: '1.25rem', opacity: 0.95, lineHeight: '1.6', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
            Explora los destinos más hermosos de nuestro país. Desde las playas de la costa hasta la majestuosa Amazonía.
          </p>
        </div>
      </div>

      {/* Contenido Principal */}
      <div style={sectionStyle}>
        <div style={containerStyle}>
          {/* Filtros */}
          <div style={filterBoxStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Filter size={24} color="#10b981" />
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
                Filtrar Destinos
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  Categoría
                </label>
                <select
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                  style={selectStyle}
                >
                  <option value="todos">Todas las categorías</option>
                  {categorias.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  Provincia
                </label>
                <select
                  value={filtroProvincia}
                  onChange={(e) => setFiltroProvincia(e.target.value)}
                  style={selectStyle}
                >
                  <option value="todos">Todas las provincias</option>
                  {provincias.map(prov => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Contenido */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '5rem 0' }}>
              <div style={{
                width: '64px',
                height: '64px',
                border: '4px solid #e5e7eb',
                borderTop: '4px solid #10b981',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            </div>
          ) : error ? (
            <div style={{
              background: '#fef2f2',
              border: '2px solid #fecaca',
              borderRadius: '1rem',
              padding: '2rem',
              textAlign: 'center'
            }}>
              <p style={{ color: '#dc2626', fontSize: '1.125rem', marginBottom: '1rem' }}>{error}</p>
              <button
                onClick={cargarDestinos}
                style={{
                  background: '#dc2626',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Intentar de nuevo
              </button>
            </div>
          ) : destinosFiltrados.length === 0 ? (
            <div style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '3rem',
              textAlign: 'center',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
                No se encontraron destinos con los filtros seleccionados.
              </p>
            </div>
          ) : (
            <>
              {/* Contador */}
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ color: '#6b7280', fontSize: '1rem' }}>
                  Mostrando <span style={{ fontWeight: '600', color: '#10b981' }}>{destinosFiltrados.length}</span> destino{destinosFiltrados.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Grid de destinos */}
              <div style={gridStyle}>
                {destinosFiltrados.map((destino) => (
                  <div
                    key={destino.id}
                    style={cardStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    {/* Imagen */}
                    <div style={{ position: 'relative', height: '250px', overflow: 'hidden' }}>
                      <img
                        src={
                          (destino.imagen_url || destino.ruta)
                            ? (destino.imagen_url || destino.ruta).startsWith('http')
                              ? (destino.imagen_url || destino.ruta)
                              : `http://localhost:8000${destino.imagen_url || destino.ruta}`
                            : '/images/default-destination.jpg'
                        }
                        alt={destino.nombre}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease'
                        }}
                        onError={(e) => {
                          e.target.src = '/images/quito.png';
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'scale(1)';
                        }}
                      />
                      {destino.categoria && (
                        <span style={{
                          position: 'absolute',
                          top: '1rem',
                          right: '1rem',
                          background: 'linear-gradient(135deg, #10b981, #2563eb)',
                          color: 'white',
                          padding: '0.5rem 1rem',
                          borderRadius: '9999px',
                          fontSize: '0.875rem',
                          fontWeight: '600'
                        }}>
                          {destino.categoria}
                        </span>
                      )}
                    </div>

                    {/* Contenido */}
                    <div style={{ padding: '1.5rem' }}>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.75rem' }}>
                        {destino.nombre}
                      </h3>
                      
                      {/* Ubicación */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', marginBottom: '1rem' }}>
                        <MapPin size={18} />
                        <span>
                          {destino.ciudad && destino.provincia
                            ? `${destino.ciudad}, ${destino.provincia}`
                            : destino.provincia || destino.ubicacion || 'Ecuador'}
                        </span>
                      </div>

                      {/* Descripción */}
                      <p style={{
                        color: '#6b7280',
                        marginBottom: '1rem',
                        lineHeight: '1.6',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {destino.descripcion || 'Descubre este hermoso destino turístico en Ecuador.'}
                      </p>

                      {/* Calificación */}
                      {destino.calificacion_promedio > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={18}
                                fill={i < Math.round(destino.calificacion_promedio) ? '#fbbf24' : 'none'}
                                color={i < Math.round(destino.calificacion_promedio) ? '#fbbf24' : '#d1d5db'}
                              />
                            ))}
                          </div>
                          <span style={{ marginLeft: '0.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
                            {destino.calificacion_promedio.toFixed(1)}
                          </span>
                        </div>
                      )}

                      {/* Botón */}
                      <button 
                        onClick={() => navigate(`/destinos/${destino.id}`)}
                        style={{
                          width: '100%',
                          background: 'linear-gradient(135deg, #10b981, #2563eb)',
                          color: 'white',
                          padding: '0.75rem 1.5rem',
                          border: 'none',
                          borderRadius: '0.5rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        Ver más detalles
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        background: '#1f2937',
        color: 'white',
        padding: '3rem 1rem',
        textAlign: 'center'
      }}>
        <div style={containerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <MapPin size={24} color="#10b981" />
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Explora Ecuador</span>
          </div>
          <p style={{ color: '#9ca3af', marginBottom: '1rem' }}>
            Tu guía turística de confianza en Ecuador
          </p>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            © 2025 Explora Ecuador. Todos los derechos reservados.
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default DestinosPage;

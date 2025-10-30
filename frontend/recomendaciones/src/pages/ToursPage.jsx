import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SimpleNavbar from '../components/SimpleNavbar';
import { MapPin, Clock, Users, DollarSign, Calendar, Filter } from 'lucide-react';
import { getTours } from '../services/api/tours.service';

const ToursPage = () => {
  const navigate = useNavigate();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroDuracion, setFiltroDuracion] = useState('todos');
  const [filtroPrecio, setFiltroPrecio] = useState('todos');
  const [filtroDisponibilidad, setFiltroDisponibilidad] = useState('todos');

  useEffect(() => {
    cargarTours();
  }, []);

  const cargarTours = async () => {
    try {
      setLoading(true);
      const data = await getTours();
      setTours(data);
      setError(null);
    } catch (err) {
      console.error('Error cargando tours:', err);
      setError('No se pudieron cargar los tours. Por favor, intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar tours
  const toursFiltrados = tours.filter(tour => {
    // Filtro de disponibilidad
    if (filtroDisponibilidad === 'disponibles' && !tour.disponible) return false;
    if (filtroDisponibilidad === 'no-disponibles' && tour.disponible) return false;

    // Filtro de duración
    if (filtroDuracion !== 'todos') {
      const duracion = tour.duracion?.toLowerCase() || '';
      if (filtroDuracion === 'medio-dia' && !duracion.includes('medio') && !duracion.includes('4') && !duracion.includes('5')) return false;
      if (filtroDuracion === '1-dia' && !duracion.includes('1 día') && !duracion.includes('un día')) return false;
      if (filtroDuracion === 'varios-dias' && !duracion.includes('días') && !duracion.includes('día')) return false;
    }

    // Filtro de precio
    if (filtroPrecio !== 'todos') {
      const precio = parseFloat(tour.precio) || 0;
      if (filtroPrecio === 'economico' && precio > 50) return false;
      if (filtroPrecio === 'moderado' && (precio <= 50 || precio > 150)) return false;
      if (filtroPrecio === 'premium' && precio <= 150) return false;
    }

    return true;
  });

  const heroStyle = {
    minHeight: '30vh',
    backgroundImage: 'linear-gradient(135deg, rgba(16, 185, 129, 0.85) 0%, rgba(59, 130, 246, 0.75) 100%), url(/images/galapagos.png)',
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
    cursor: 'pointer',
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '2rem',
    marginTop: '2rem'
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #f9fafb, white)' }}>
      <SimpleNavbar />
      
      {/* Hero Section */}
      <div style={heroStyle}>
        <div style={{ maxWidth: '64rem', position: 'relative', zIndex: 2 }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem', lineHeight: '1.1', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
            🏞 Tours y Experiencias
          </h1>
          <p style={{ fontSize: '1.25rem', opacity: 0.95, lineHeight: '1.6', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
            Descubre aventuras únicas y vive experiencias inolvidables en Ecuador
          </p>
        </div>
      </div>

      {/* Contenido Principal */}
      <div style={sectionStyle}>
        <div style={containerStyle}>
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
                onClick={cargarTours}
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
          ) : tours.length === 0 ? (
            <div style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '3rem',
              textAlign: 'center',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
                No hay tours disponibles en este momento.
              </p>
            </div>
          ) : (
            <>
              {/* Filtros */}
              <div style={{
                background: 'white',
                borderRadius: '1rem',
                padding: '1.5rem',
                marginBottom: '2rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <Filter size={20} color="#10b981" />
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>
                    Filtros
                  </h3>
                </div>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem'
                }}>
                  {/* Filtro de Disponibilidad */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#6b7280',
                      marginBottom: '0.5rem'
                    }}>
                      Disponibilidad
                    </label>
                    <select
                      value={filtroDisponibilidad}
                      onChange={(e) => setFiltroDisponibilidad(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #d1d5db',
                        fontSize: '0.875rem',
                        color: '#374151',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="todos">Todos</option>
                      <option value="disponibles">Disponibles</option>
                      <option value="no-disponibles">No disponibles</option>
                    </select>
                  </div>

                  {/* Filtro de Duración */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#6b7280',
                      marginBottom: '0.5rem'
                    }}>
                      Duración
                    </label>
                    <select
                      value={filtroDuracion}
                      onChange={(e) => setFiltroDuracion(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #d1d5db',
                        fontSize: '0.875rem',
                        color: '#374151',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="todos">Todas las duraciones</option>
                      <option value="medio-dia">Medio día</option>
                      <option value="1-dia">1 día</option>
                      <option value="varios-dias">Varios días</option>
                    </select>
                  </div>

                  {/* Filtro de Precio */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#6b7280',
                      marginBottom: '0.5rem'
                    }}>
                      Precio
                    </label>
                    <select
                      value={filtroPrecio}
                      onChange={(e) => setFiltroPrecio(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #d1d5db',
                        fontSize: '0.875rem',
                        color: '#374151',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="todos">Todos los precios</option>
                      <option value="economico">Económico (hasta $50)</option>
                      <option value="moderado">Moderado ($50 - $150)</option>
                      <option value="premium">Premium (más de $150)</option>
                    </select>
                  </div>
                </div>

                {/* Botón para limpiar filtros */}
                {(filtroDuracion !== 'todos' || filtroPrecio !== 'todos' || filtroDisponibilidad !== 'todos') && (
                  <button
                    onClick={() => {
                      setFiltroDuracion('todos');
                      setFiltroPrecio('todos');
                      setFiltroDisponibilidad('todos');
                    }}
                    style={{
                      marginTop: '1rem',
                      padding: '0.5rem 1rem',
                      background: '#f3f4f6',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      color: '#374151',
                      cursor: 'pointer',
                      fontWeight: '500',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#e5e7eb';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#f3f4f6';
                    }}
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>

              {/* Contador */}
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ color: '#6b7280', fontSize: '1rem' }}>
                  Mostrando <span style={{ fontWeight: '600', color: '#10b981' }}>{toursFiltrados.length}</span> de {tours.length} tour{tours.length !== 1 ? 's' : ''}
                </p>
              </div>

              {toursFiltrados.length === 0 ? (
                <div style={{
                  background: 'white',
                  borderRadius: '1rem',
                  padding: '3rem',
                  textAlign: 'center',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                  <p style={{ color: '#6b7280', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                    No se encontraron tours con los filtros seleccionados
                  </p>
                  <button
                    onClick={() => {
                      setFiltroDuracion('todos');
                      setFiltroPrecio('todos');
                      setFiltroDisponibilidad('todos');
                    }}
                    style={{
                      marginTop: '1rem',
                      padding: '0.75rem 1.5rem',
                      background: 'linear-gradient(135deg, #10b981, #2563eb)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Limpiar filtros
                  </button>
                </div>
              ) : (
                <div style={gridStyle}>
                  {toursFiltrados.map((tour) => (
                  <div
                    key={tour.id_tour}
                    style={cardStyle}
                    onClick={() => navigate(`/tours/${tour.id_tour}`)}
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
                    <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                      <img
                        src={tour.imagen_url || tour.imagenUrl}
                        alt={tour.nombre}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease'
                        }}
                        onError={(e) => {
                          e.target.src = '/images/galapagos.png';
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'scale(1)';
                        }}
                      />
                      {tour.disponible ? (
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
                          Disponible
                        </span>
                      ) : (
                        <span style={{
                          position: 'absolute',
                          top: '1rem',
                          right: '1rem',
                          background: '#ef4444',
                          color: 'white',
                          padding: '0.5rem 1rem',
                          borderRadius: '9999px',
                          fontSize: '0.875rem',
                          fontWeight: '600'
                        }}>
                          No disponible
                        </span>
                      )}
                    </div>

                    {/* Contenido */}
                    <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.75rem' }}>
                        {tour.nombre}
                      </h3>
                      
                      {/* Descripción */}
                      <p style={{
                        color: '#6b7280',
                        marginBottom: '1rem',
                        lineHeight: '1.6',
                        flex: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {tour.descripcion || 'Disfruta de esta increíble experiencia turística.'}
                      </p>

                      {/* Info del tour */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
                          <MapPin size={16} />
                          <span>{tour.ubicacion || 'Ecuador'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
                          <Clock size={16} />
                          <span>{tour.duracion}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
                          <Users size={16} />
                          <span>Máx. {tour.capacidad_maxima || tour.capacidadMaxima || 10} personas</span>
                        </div>
                      </div>

                      {/* Precio */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem',
                        background: '#f9fafb',
                        borderRadius: '0.5rem',
                        marginBottom: '1rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <DollarSign size={20} color="#10b981" />
                          <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                            ${typeof tour.precio === 'number' ? tour.precio.toFixed(2) : tour.precio}
                          </span>
                        </div>
                        <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>por persona</span>
                      </div>

                      {/* Botón */}
                      <button style={{
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
                        Ver detalles
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              )}
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

export default ToursPage;

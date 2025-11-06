import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SimpleNavbar from '../components/SimpleNavbar';
import { MapPin, Clock, Users, DollarSign, Package, Phone, Mail, Filter } from 'lucide-react';
import { getServicios } from '../services/api/servicios.service';

const ServiciosPage = () => {
  const navigate = useNavigate();
  const [servicios, setServicios] = useState([]);
  const [serviciosFiltrados, setServiciosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todos');

  const categorias = [
    'Todos',
    'hotel',
    'tour',
    'transporte',
    'restaurante',
    'actividad',
    'evento',
    'spa',
    'aventura',
    'cultural',
    'gastronomico'
  ];

  useEffect(() => {
    cargarServicios();
  }, []);

  useEffect(() => {
    filtrarServicios();
  }, [categoriaSeleccionada, servicios]);

  const cargarServicios = async () => {
    try {
      setLoading(true);
      const data = await getServicios();
      setServicios(data);
      setError(null);
    } catch (err) {
      console.error('Error cargando servicios:', err);
      setError('No se pudieron cargar los servicios. Por favor, intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const filtrarServicios = () => {
    if (categoriaSeleccionada === 'Todos') {
      setServiciosFiltrados(servicios);
    } else {
      setServiciosFiltrados(
        servicios.filter(servicio => servicio.categoria === categoriaSeleccionada)
      );
    }
  };

  const getCategoriaColor = (categoria) => {
    const colores = {
      hotel: '#3b82f6',
      tour: '#8b5cf6',
      transporte: '#10b981',
      restaurante: '#f59e0b',
      actividad: '#06b6d4',
      evento: '#6366f1',
      spa: '#ec4899',
      aventura: '#ef4444',
      cultural: '#0ea5e9',
      gastronomico: '#f97316'
    };
    return colores[categoria] || '#6b7280';
  };

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
            𓌉◯𓇋 Servicios Turísticos
          </h1>
          <p style={{ fontSize: '1.25rem', opacity: 0.95, lineHeight: '1.6', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
            Complementa tu experiencia con nuestros servicios premium
          </p>
        </div>
      </div>

      {/* Contenido Principal */}
      <div style={sectionStyle}>
        <div style={containerStyle}>
          {/* Filtros */}
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            marginBottom: '2rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <Filter size={20} color="#10b981" />
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>
                Filtrar por categoría
              </h3>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {categorias.map(categoria => (
                <button
                  key={categoria}
                  onClick={() => setCategoriaSeleccionada(categoria)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '9999px',
                    border: 'none',
                    background: categoriaSeleccionada === categoria
                      ? 'linear-gradient(135deg, #10b981, #2563eb)'
                      : '#f3f4f6',
                    color: categoriaSeleccionada === categoria ? 'white' : '#6b7280',
                    fontWeight: categoriaSeleccionada === categoria ? '600' : '500',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (categoriaSeleccionada !== categoria) {
                      e.currentTarget.style.background = '#e5e7eb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (categoriaSeleccionada !== categoria) {
                      e.currentTarget.style.background = '#f3f4f6';
                    }
                  }}
                >
                  {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                </button>
              ))}
            </div>
          </div>

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
                onClick={cargarServicios}
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
          ) : serviciosFiltrados.length === 0 ? (
            <div style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '3rem',
              textAlign: 'center',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
                No hay servicios disponibles en esta categoría.
              </p>
            </div>
          ) : (
            <>
              {/* Contador */}
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ color: '#6b7280', fontSize: '1rem' }}>
                  Mostrando <span style={{ fontWeight: '600', color: '#10b981' }}>{serviciosFiltrados.length}</span> servicio{serviciosFiltrados.length !== 1 ? 's' : ''} disponible{serviciosFiltrados.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Grid de servicios */}
              <div style={gridStyle}>
                {serviciosFiltrados.map((servicio) => (
                  <div
                    key={servicio.id}
                    style={cardStyle}
                    onClick={() => navigate(`/servicios/${servicio.id}`)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    {/* Imagen del servicio */}
                    {servicio.imagen_url && (
                      <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                        <img
                          src={servicio.imagen_url.startsWith('http') ? servicio.imagen_url : `http://localhost:8000${servicio.imagen_url}`}
                          alt={servicio.nombre}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'scale(1.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'scale(1)';
                          }}
                        />
                      </div>
                    )}
                    
                    {/* Header con categoría */}
                    <div style={{
                      background: `linear-gradient(135deg, ${getCategoriaColor(servicio.categoria)}, ${getCategoriaColor(servicio.categoria)}dd)`,
                      padding: '1rem',
                      color: 'white'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{
                          background: 'rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(10px)',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          textTransform: 'uppercase'
                        }}>
                          {servicio.categoria}
                        </span>
                        {servicio.disponible && (
                          <span style={{
                            background: '#10b981',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: '600'
                          }}>
                            Disponible
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Contenido */}
                    <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.75rem' }}>
                        {servicio.nombre}
                      </h3>
                      
                      {/* Descripción */}
                      <p style={{
                        color: '#6b7280',
                        marginBottom: '1rem',
                        lineHeight: '1.6',
                        flex: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {servicio.descripcion}
                      </p>

                      {/* Info del servicio */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
                          <MapPin size={16} />
                          <span>{servicio.destino}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
                          <Clock size={16} />
                          <span>{servicio.duracion_dias} día{servicio.duracion_dias !== 1 ? 's' : ''}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
                          <Users size={16} />
                          <span>Máx. {servicio.capacidad_maxima} personas</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
                          <Package size={16} />
                          <span>{servicio.proveedor}</span>
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
                            ${typeof servicio.precio === 'number' ? servicio.precio.toFixed(2) : servicio.precio}
                          </span>
                        </div>
                        <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>por día</span>
                      </div>

                      {/* Botón */}
                      <button style={{
                        width: '100%',
                        background: `linear-gradient(135deg, ${getCategoriaColor(servicio.categoria)}, ${getCategoriaColor(servicio.categoria)}dd)`,
                        color: 'white',
                        padding: '0.75rem 1.5rem',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}>
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiciosPage;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import SimpleNavbar from '../components/SimpleNavbar';
import { MapPin, Star, ArrowLeft, Calendar, Users, Clock, DollarSign, Phone, Mail } from 'lucide-react';
import { getDestinoById } from '../services/api/destinos.service';

const DestinoDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [destino, setDestino] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarDestino();
  }, [id]);

  const cargarDestino = async () => {
    try {
      setLoading(true);
      const data = await getDestinoById(id);
      setDestino(data);
      setError(null);
    } catch (err) {
      console.error('Error cargando destino:', err);
      setError('No se pudo cargar el destino. Por favor, intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const heroStyle = {
    minHeight: '60vh',
    position: 'relative',
    overflow: 'hidden'
  };

  const heroImageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    position: 'absolute',
    top: 0,
    left: 0
  };

  const overlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)',
    zIndex: 1
  };

  const heroContentStyle = {
    position: 'relative',
    zIndex: 2,
    height: '100%',
    minHeight: '60vh',
    display: 'flex',
    alignItems: 'flex-end',
    padding: '6rem 1rem 3rem 1rem'
  };

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%'
  };

  const sectionStyle = {
    padding: '4rem 1rem',
    background: 'linear-gradient(to bottom, #f9fafb, white)'
  };

  const cardStyle = {
    background: 'white',
    borderRadius: '1rem',
    padding: '2rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    marginBottom: '2rem'
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: '64px',
          height: '64px',
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #10b981',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !destino) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #f9fafb, white)' }}>
        <SimpleNavbar />
        <div style={{ padding: '8rem 1rem 4rem 1rem' }}>
          <div style={containerStyle}>
            <div style={{
              background: '#fef2f2',
              border: '2px solid #fecaca',
              borderRadius: '1rem',
              padding: '3rem',
              textAlign: 'center'
            }}>
              <p style={{ color: '#dc2626', fontSize: '1.25rem', marginBottom: '1.5rem' }}>
                {error || 'Destino no encontrado'}
              </p>
              <button
                onClick={() => navigate('/destinos')}
                style={{
                  background: 'linear-gradient(135deg, #10b981, #2563eb)',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <ArrowLeft size={20} />
                Volver a Destinos
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #f9fafb, white)' }}>
      <SimpleNavbar />

      {/* Hero con imagen de fondo */}
      <div style={heroStyle}>
        <img
          src={destino.ruta || '/images/quito.png'}
          alt={destino.nombre}
          style={heroImageStyle}
          onError={(e) => {
            e.target.src = '/images/quito.png';
          }}
        />
        <div style={overlayStyle}></div>
        
        <div style={heroContentStyle}>
          <div style={containerStyle}>
            {/* Botón volver */}
            <button
              onClick={() => navigate('/destinos')}
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                color: '#374151',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '9999px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '2rem',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'white';
                e.target.style.transform = 'translateX(-5px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                e.target.style.transform = 'translateX(0)';
              }}
            >
              <ArrowLeft size={20} />
              Volver
            </button>

            <div style={{ color: 'white' }}>
              {destino.categoria && (
                <span style={{
                  background: 'linear-gradient(135deg, #10b981, #2563eb)',
                  padding: '0.5rem 1.5rem',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  display: 'inline-block',
                  marginBottom: '1rem'
                }}>
                  {destino.categoria}
                </span>
              )}
              
              <h1 style={{ fontSize: '3.5rem', fontWeight: 'bold', marginBottom: '1rem', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                {destino.nombre}
              </h1>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', fontSize: '1.125rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={24} />
                  <span>
                    {destino.ciudad && destino.provincia
                      ? `${destino.ciudad}, ${destino.provincia}`
                      : destino.provincia || destino.ubicacion || 'Ecuador'}
                  </span>
                </div>
                
                {destino.calificacion_promedio > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={20}
                          fill={i < Math.round(destino.calificacion_promedio) ? '#fbbf24' : 'none'}
                          color="#fbbf24"
                        />
                      ))}
                    </div>
                    <span style={{ fontWeight: '600' }}>
                      {destino.calificacion_promedio.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div style={sectionStyle}>
        <div style={containerStyle}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
            
            {/* Columna principal */}
            <div style={{ flex: '1 1 600px', minWidth: '0' }}>
              {/* Descripción */}
              <div style={cardStyle}>
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ 
                    background: 'linear-gradient(135deg, #10b981, #2563eb)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    Acerca de este destino
                  </span>
                </h2>
                <p style={{ color: '#4b5563', fontSize: '1.125rem', lineHeight: '1.8' }}>
                  {destino.descripcion || 'Descubre este hermoso destino turístico en Ecuador. Un lugar lleno de maravillas naturales y culturales que te dejará sin aliento.'}
                </p>
              </div>

              {/* Características destacadas */}
              <div style={cardStyle}>
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1.5rem' }}>
                  ✨ Características Destacadas
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                    <div style={{ 
                      background: 'linear-gradient(135deg, #10b981, #2563eb)',
                      padding: '0.75rem',
                      borderRadius: '0.75rem',
                      color: 'white'
                    }}>
                      <Calendar size={24} />
                    </div>
                    <div>
                      <h3 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>Todo el año</h3>
                      <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Disponible siempre</p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                    <div style={{ 
                      background: 'linear-gradient(135deg, #10b981, #2563eb)',
                      padding: '0.75rem',
                      borderRadius: '0.75rem',
                      color: 'white'
                    }}>
                      <Users size={24} />
                    </div>
                    <div>
                      <h3 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>Para todos</h3>
                      <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Familias y grupos</p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                    <div style={{ 
                      background: 'linear-gradient(135deg, #10b981, #2563eb)',
                      padding: '0.75rem',
                      borderRadius: '0.75rem',
                      color: 'white'
                    }}>
                      <Clock size={24} />
                    </div>
                    <div>
                      <h3 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>Flexible</h3>
                      <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>A tu ritmo</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Qué incluye */}
              <div style={cardStyle}>
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1.5rem' }}>
                  📋 Información del Destino
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem' }}>
                    <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></div>
                    <span style={{ color: '#374151' }}>Acceso a todas las áreas del destino</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem' }}>
                    <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></div>
                    <span style={{ color: '#374151' }}>Información turística disponible</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem' }}>
                    <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></div>
                    <span style={{ color: '#374151' }}>Guías locales recomendados</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem' }}>
                    <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></div>
                    <span style={{ color: '#374151' }}>Opciones de transporte cercanas</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ flex: '1 1 350px', minWidth: '300px' }}>
              {/* Card de reserva */}
              <div style={{
                ...cardStyle,
                position: 'sticky',
                top: '5rem',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(59, 130, 246, 0.05))',
                border: '2px solid',
                borderImage: 'linear-gradient(135deg, #10b981, #2563eb) 1'
              }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1.5rem' }}>
                  ¿Listo para explorar?
                </h3>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ color: '#6b7280' }}>Ubicación:</span>
                    <span style={{ fontWeight: '600', color: '#1f2937' }}>
                      {destino.provincia || 'Ecuador'}
                    </span>
                  </div>
                  {destino.calificacion_promedio > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <span style={{ color: '#6b7280' }}>Calificación:</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Star size={18} fill="#fbbf24" color="#fbbf24" />
                        <span style={{ fontWeight: '600', color: '#1f2937' }}>
                          {destino.calificacion_promedio.toFixed(1)}/5.0
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #10b981, #2563eb)',
                    color: 'white',
                    padding: '1rem',
                    border: 'none',
                    borderRadius: '0.75rem',
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    marginBottom: '1rem',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  Planificar Visita
                </button>

                <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.875rem' }}>
                  ✨ Experiencia única en Ecuador
                </p>
              </div>

              {/* Información de contacto */}
              <div style={{ ...cardStyle, marginTop: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
                  📞 Información de Contacto
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Phone size={18} color="#10b981" />
                    <span style={{ color: '#374151' }}>+593 (0)2 123-4567</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Mail size={18} color="#10b981" />
                    <span style={{ color: '#374151' }}>info@exploraecuador.com</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
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

export default DestinoDetailPage;

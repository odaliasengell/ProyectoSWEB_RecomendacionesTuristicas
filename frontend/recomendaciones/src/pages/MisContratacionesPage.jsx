import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SimpleNavbar from '../components/SimpleNavbar';
import { Calendar, DollarSign, Users, MapPin, Phone, Mail, FileText, Briefcase, XCircle } from 'lucide-react';
import { getContratacionesByEmail, cancelarContratacion } from '../services/api/servicios.service';
import { useAuth } from '../contexts/AuthContext';

const MisContratacionesPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [contrataciones, setContrataciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelando, setCancelando] = useState(null); // ID de la contratación que se está cancelando

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    cargarContrataciones();
  }, [isAuthenticated, navigate]);

  const cargarContrataciones = async () => {
    try {
      setLoading(true);
      
      // Obtener email del usuario
      const userDataStr = localStorage.getItem('userData') || localStorage.getItem('user');
      const userData = JSON.parse(userDataStr);
      const userEmail = userData.email;
      
      console.log('📧 Cargando contrataciones para:', userEmail);
      
      const data = await getContratacionesByEmail(userEmail);
      console.log('✅ Contrataciones cargadas:', data);
      
      // Ordenar por fecha (más reciente primero)
      const ordenadas = data.sort((a, b) => 
        new Date(b.fecha_contratacion) - new Date(a.fecha_contratacion)
      );
      
      setContrataciones(ordenadas);
      setError(null);
    } catch (err) {
      console.error('❌ Error cargando contrataciones:', err);
      setError('No se pudieron cargar las contrataciones. Por favor, intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarContratacion = async (contratacionId) => {
    // Confirmar con el usuario
    const confirmacion = window.confirm(
      '¿Estás seguro de que deseas cancelar esta contratación? Esta acción no se puede deshacer.'
    );
    
    if (!confirmacion) return;

    try {
      setCancelando(contratacionId);
      console.log('🚫 Cancelando contratación:', contratacionId);
      
      await cancelarContratacion(contratacionId);
      
      console.log('✅ Contratación cancelada exitosamente');
      
      // Recargar las contrataciones para mostrar el estado actualizado
      await cargarContrataciones();
      
      alert('Contratación cancelada exitosamente');
    } catch (err) {
      console.error('❌ Error al cancelar:', err);
      alert(err.message || 'No se pudo cancelar la contratación. Por favor, intenta nuevamente.');
    } finally {
      setCancelando(null);
    }
  };

  const getEstadoColor = (estado) => {
    const estados = {
      'confirmada': { bg: '#d1fae5', color: '#065f46', border: '#6ee7b7' },
      'pendiente': { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' },
      'completada': { bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' },
      'cancelada': { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' }
    };
    return estados[estado] || estados['pendiente'];
  };

  const heroStyle = {
    minHeight: '30vh',
    backgroundImage: 'linear-gradient(135deg, rgba(59, 130, 246, 0.85) 0%, rgba(147, 51, 234, 0.75) 100%), url(/images/galapagos.png)',
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

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #f9fafb, white)' }}>
        <SimpleNavbar />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div style={{
            width: '64px',
            height: '64px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #f9fafb, white)' }}>
      <SimpleNavbar />
      
      {/* Hero Section */}
      <div style={heroStyle}>
        <div style={{ maxWidth: '64rem', position: 'relative', zIndex: 2 }}>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: 'bold', 
            marginBottom: '1rem', 
            lineHeight: '1.1',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)' 
          }}>
            💼 Mis Contrataciones
          </h1>
          <p style={{ 
            fontSize: '1.25rem', 
            opacity: 0.95, 
            lineHeight: '1.6',
            textShadow: '0 1px 2px rgba(0,0,0,0.2)' 
          }}>
            Gestiona tus servicios contratados
          </p>
          {user && (
            <p style={{ 
              fontSize: '1rem', 
              opacity: 0.9, 
              marginTop: '0.5rem',
              textShadow: '0 1px 2px rgba(0,0,0,0.2)',
              fontWeight: '500'
            }}>
              Usuario: {user.username || user.email}
            </p>
          )}
        </div>
      </div>

      {/* Contenido Principal */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 1rem' }}>
        
        {/* Mensaje de error */}
        {error && (
          <div style={{
            background: '#fef2f2',
            border: '2px solid #fecaca',
            borderRadius: '1rem',
            padding: '2rem',
            textAlign: 'center',
            marginBottom: '2rem'
          }}>
            <p style={{ color: '#dc2626', fontSize: '1.125rem', marginBottom: '1rem' }}>{error}</p>
            <button
              onClick={cargarContrataciones}
              style={{
                background: '#3b82f6',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Intentar nuevamente
            </button>
          </div>
        )}

        {/* Lista de contrataciones */}
        {!error && contrataciones.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '3rem',
            textAlign: 'center',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <Briefcase size={64} color="#d1d5db" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.5rem', color: '#6b7280', marginBottom: '0.5rem' }}>
              No tienes contrataciones aún
            </h3>
            <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>
              Explora nuestros servicios y contrata el que más te guste
            </p>
            <button
              onClick={() => navigate('/servicios')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              <Briefcase size={20} />
              Ver Servicios
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {contrataciones.map((contratacion) => {
              const estadoStyle = getEstadoColor(contratacion.estado);
              
              return (
                <div
                  key={contratacion.id}
                  style={{
                    background: 'white',
                    borderRadius: '1rem',
                    padding: '2rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease',
                    border: '2px solid transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  {/* Header con estado */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    marginBottom: '1.5rem'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ 
                        fontSize: '1.5rem', 
                        fontWeight: 'bold', 
                        color: '#1f2937',
                        marginBottom: '0.5rem'
                      }}>
                        {contratacion.servicio_nombre || 'Servicio Turístico'}
                      </h3>
                      <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                        ID: {contratacion.id}
                      </p>
                    </div>
                    
                    <span style={{
                      background: estadoStyle.bg,
                      color: estadoStyle.color,
                      padding: '0.5rem 1rem',
                      borderRadius: '9999px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      border: `2px solid ${estadoStyle.border}`,
                      textTransform: 'capitalize'
                    }}>
                      {contratacion.estado}
                    </span>
                  </div>

                  {/* Grid de información */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '1.5rem'
                  }}>
                    {/* Fechas */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <Calendar size={20} color="#3b82f6" />
                        <span style={{ fontWeight: '600', color: '#374151' }}>Fechas del Servicio</span>
                      </div>
                      <div style={{ paddingLeft: '1.75rem' }}>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                          <strong>Inicio:</strong> {new Date(contratacion.fecha_inicio).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          <strong>Fin:</strong> {new Date(contratacion.fecha_fin).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                          Contratado: {new Date(contratacion.fecha_contratacion).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>

                    {/* Viajeros y Precio */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <Users size={20} color="#10b981" />
                        <span style={{ fontWeight: '600', color: '#374151' }}>Detalles</span>
                      </div>
                      <div style={{ paddingLeft: '1.75rem' }}>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                          <strong>Viajeros:</strong> {contratacion.num_viajeros} persona(s)
                        </p>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                          <strong>Precio unitario:</strong> {contratacion.moneda} ${contratacion.precio_unitario}
                        </p>
                        {contratacion.descuento > 0 && (
                          <p style={{ fontSize: '0.875rem', color: '#10b981', marginBottom: '0.25rem' }}>
                            <strong>Descuento:</strong> {contratacion.moneda} ${contratacion.descuento}
                          </p>
                        )}
                        <p style={{ fontSize: '1rem', color: '#1f2937', fontWeight: 'bold', marginTop: '0.5rem' }}>
                          <strong>Total:</strong> {contratacion.moneda} ${contratacion.total}
                        </p>
                      </div>
                    </div>

                    {/* Datos de contacto */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <Mail size={20} color="#f59e0b" />
                        <span style={{ fontWeight: '600', color: '#374151' }}>Contacto</span>
                      </div>
                      <div style={{ paddingLeft: '1.75rem' }}>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                          <strong>Nombre:</strong> {contratacion.cliente_nombre}
                        </p>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                          <strong>Email:</strong> {contratacion.cliente_email}
                        </p>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          <strong>Teléfono:</strong> {contratacion.cliente_telefono}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Notas */}
                  {contratacion.notas && (
                    <div style={{
                      background: '#f9fafb',
                      border: '2px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      padding: '1rem',
                      marginTop: '1rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <FileText size={18} color="#6b7280" />
                        <span style={{ fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>Notas:</span>
                      </div>
                      <p style={{ color: '#6b7280', fontSize: '0.875rem', paddingLeft: '1.75rem' }}>
                        {contratacion.notas}
                      </p>
                    </div>
                  )}

                  {/* Botón de cancelar */}
                  {contratacion.estado !== 'cancelada' && contratacion.estado !== 'completada' && (
                    <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleCancelarContratacion(contratacion.id)}
                        disabled={cancelando === contratacion.id}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          background: cancelando === contratacion.id 
                            ? '#9ca3af' 
                            : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                          color: 'white',
                          padding: '0.75rem 1.5rem',
                          border: 'none',
                          borderRadius: '0.5rem',
                          fontWeight: '600',
                          cursor: cancelando === contratacion.id ? 'not-allowed' : 'pointer',
                          fontSize: '0.875rem',
                          transition: 'all 0.3s ease',
                          opacity: cancelando === contratacion.id ? 0.6 : 1
                        }}
                        onMouseEnter={(e) => {
                          if (cancelando !== contratacion.id) {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(239, 68, 68, 0.5)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <XCircle size={18} />
                        {cancelando === contratacion.id ? 'Cancelando...' : 'Cancelar Contratación'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CSS Animation */}
      <style jsx="true">{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MisContratacionesPage;

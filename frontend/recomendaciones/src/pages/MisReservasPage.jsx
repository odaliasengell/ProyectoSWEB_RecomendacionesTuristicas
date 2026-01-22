import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SimpleNavbar from '../components/SimpleNavbar';
import { Calendar, Users, DollarSign, Clock, MapPin, CheckCircle, XCircle, AlertCircle, CreditCard } from 'lucide-react';
import { obtenerMisReservas, cancelarReserva } from '../services/api/reservas.service';
import { getTourById } from '../services/api/tours.service';
import { useAuth } from '../contexts/AuthContext';
import { getMyPayments } from '../services/paymentService';

const MisReservasPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelando, setCancelando] = useState(null);
  const [pagos, setPagos] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Debug: Mostrar información del usuario actual
    const userDataStr = localStorage.getItem('userData');
    if (userDataStr) {
      const userData = JSON.parse(userDataStr);
      console.log('========= USUARIO ACTUAL =========');
      console.log('ID:', userData.id);
      console.log('Username:', userData.username);
      console.log('Email:', userData.email);
      console.log('==================================');
    }
    
    cargarReservas();
  }, [isAuthenticated, navigate]);

  const cargarReservas = async () => {
    try {
      setLoading(true);
      
      // Cargar reservas y pagos en paralelo
      const [reservasData, pagosData] = await Promise.all([
        obtenerMisReservas(),
        getMyPayments().catch(err => {
          console.warn('No se pudieron cargar los pagos:', err);
          return [];
        })
      ]);
      
      setPagos(pagosData);
      
      // Cargar información de los tours para cada reserva
      const reservasConTours = await Promise.all(
        reservasData.map(async (reserva) => {
          try {
            // Usar tour_id (estándar actual) o id_tour (compatibilidad)
            const tourId = reserva.tour_id || reserva.id_tour;
            console.log('🔍 Reserva:', reserva.id, 'Tour ID:', tourId);
            
            if (!tourId) {
              console.warn('⚠️ Reserva sin tour_id:', reserva);
              return { ...reserva, tour: null, pago: null };
            }
            
            const tour = await getTourById(tourId);
            
            // Buscar el pago asociado a esta reserva
            const pagoAsociado = pagosData.find(pago => 
              pago.metadata?.tour_id === tourId || 
              pago.order_id?.includes(`tour_${tourId}`)
            );
            
            return { ...reserva, tour, pago: pagoAsociado };
          } catch (err) {
            console.error('Error cargando tour:', err);
            return { ...reserva, tour: null, pago: null };
          }
        })
      );
      
      setReservas(reservasConTours);
      setError(null);
    } catch (err) {
      console.error('Error cargando reservas:', err);
      setError('No se pudieron cargar las reservas. Por favor, intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarReserva = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      return;
    }

    try {
      setCancelando(id);
      await cancelarReserva(id);
      alert('Reserva cancelada exitosamente');
      cargarReservas(); // Recargar la lista
    } catch (err) {
      console.error('Error cancelando reserva:', err);
      alert('No se pudo cancelar la reserva. Por favor, intenta nuevamente.');
    } finally {
      setCancelando(null);
    }
  };

  const getEstadoBadge = (estado) => {
    // Normalizar el estado a minúsculas para comparación
    const estadoNormalizado = estado?.toLowerCase() || 'pendiente';
    
    const estilos = {
      pendiente: {
        bg: '#fef3c7',
        color: '#f59e0b',
        icon: <AlertCircle size={16} />
      },
      confirmada: {
        bg: '#d1fae5',
        color: '#10b981',
        icon: <CheckCircle size={16} />
      },
      cancelada: {
        bg: '#fee2e2',
        color: '#ef4444',
        icon: <XCircle size={16} />
      },
      completada: {
        bg: '#dbeafe',
        color: '#3b82f6',
        icon: <CheckCircle size={16} />
      }
    };

    const estilo = estilos[estadoNormalizado] || estilos.pendiente;

    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        background: estilo.bg,
        color: estilo.color,
        padding: '0.5rem 1rem',
        borderRadius: '9999px',
        fontSize: '0.875rem',
        fontWeight: '600'
      }}>
        {estilo.icon}
        {estadoNormalizado.charAt(0).toUpperCase() + estadoNormalizado.slice(1)}
      </span>
    );
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

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #f9fafb, white)' }}>
        <SimpleNavbar />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div style={{
            width: '64px',
            height: '64px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #10b981',
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
            📋 Mis Reservas
          </h1>
          <p style={{ 
            fontSize: '1.25rem', 
            opacity: 0.95, 
            lineHeight: '1.6',
            textShadow: '0 1px 2px rgba(0,0,0,0.2)' 
          }}>
            Administra tus reservaciones de tours
          </p>
          {user && (
            <p style={{ 
              fontSize: '1rem', 
              opacity: 0.9, 
              marginTop: '0.5rem',
              textShadow: '0 1px 2px rgba(0,0,0,0.2)',
              fontWeight: '500'
            }}>
              Usuario: {user.username || user.email} (ID: {user.id})
            </p>
          )}
        </div>
      </div>

      {/* Contenido Principal */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 1rem' }}>
        {error ? (
          <div style={{
            background: '#fef2f2',
            border: '2px solid #fecaca',
            borderRadius: '1rem',
            padding: '2rem',
            textAlign: 'center'
          }}>
            <p style={{ color: '#dc2626', fontSize: '1.125rem', marginBottom: '1rem' }}>{error}</p>
            <button
              onClick={cargarReservas}
              style={{
                background: '#dc2626',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Intentar de nuevo
            </button>
          </div>
        ) : reservas.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '3rem',
            textAlign: 'center',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <p style={{ color: '#6b7280', fontSize: '1.125rem', marginBottom: '1rem' }}>
              No tienes reservas todavía
            </p>
            <button
              onClick={() => navigate('/tours')}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Explorar Tours
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {reservas.map((reserva, index) => (
              <div
                key={reserva.id || reserva._id || index}
                style={{
                  background: 'white',
                  borderRadius: '1rem',
                  overflow: 'hidden',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ padding: '2rem' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'start',
                    marginBottom: '1.5rem',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}>
                    <div>
                      <h3 style={{ 
                        fontSize: '1.5rem', 
                        fontWeight: 'bold', 
                        color: '#1f2937',
                        marginBottom: '0.5rem'
                      }}>
                        {reserva.tour ? reserva.tour.nombre : `Tour #${reserva.tour_id || reserva.id_tour || 'N/A'}`}
                      </h3>
                      <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                        Reserva #{reserva.id_reserva}
                      </p>
                    </div>
                    {getEstadoBadge(reserva.estado)}
                  </div>

                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '1.5rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        borderRadius: '0.5rem',
                        padding: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Calendar size={20} color="white" />
                      </div>
                      <div>
                        <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Fecha</p>
                        <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937' }}>
                          {new Date(reserva.fecha_reserva).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        borderRadius: '0.5rem',
                        padding: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Users size={20} color="white" />
                      </div>
                      <div>
                        <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Personas</p>
                        <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937' }}>
                          {reserva.cantidad_personas}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        borderRadius: '0.5rem',
                        padding: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <DollarSign size={20} color="white" />
                      </div>
                      <div>
                        <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Total</p>
                        <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937' }}>
                          ${reserva.precio_total.toFixed(2)} USD
                        </p>
                      </div>
                    </div>

                    {reserva.tour && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                          borderRadius: '0.5rem',
                          padding: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Clock size={20} color="white" />
                        </div>
                        <div>
                          <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Duración</p>
                          <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937' }}>
                            {reserva.tour.duracion}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {reserva.comentarios && (
                    <div style={{
                      background: '#f9fafb',
                      borderRadius: '0.5rem',
                      padding: '1rem',
                      marginBottom: '1.5rem'
                    }}>
                      <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                        Comentarios
                      </p>
                      <p style={{ fontSize: '0.875rem', color: '#1f2937' }}>
                        {reserva.comentarios}
                      </p>
                    </div>
                  )}

                  {/* Estado del Pago */}
                  {reserva.pago && (
                    <div style={{
                      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                      border: '1px solid #86efac',
                      borderRadius: '0.5rem',
                      padding: '1rem',
                      marginBottom: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}>
                      <div style={{
                        background: '#10b981',
                        borderRadius: '0.5rem',
                        padding: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <CreditCard size={20} color="white" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                          <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#065f46' }}>
                            Pago Procesado
                          </p>
                          <span style={{
                            background: '#10b981',
                            color: 'white',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: '600'
                          }}>
                            {reserva.pago.status.toUpperCase()}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#047857' }}>
                          ID: {reserva.pago.payment_id} • ${reserva.pago.amount.toFixed(2)} USD • {reserva.pago.provider}
                        </p>
                        {reserva.pago.created_at && (
                          <p style={{ fontSize: '0.75rem', color: '#047857', marginTop: '0.25rem' }}>
                            Procesado: {new Date(reserva.pago.created_at).toLocaleString('es-ES')}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {reserva.tour && (
                      <button
                        onClick={() => navigate(`/tours/${reserva.tour_id || reserva.id_tour}`)}
                        style={{
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: 'white',
                          padding: '0.75rem 1.5rem',
                          border: 'none',
                          borderRadius: '0.5rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Ver Tour
                      </button>
                    )}
                    
                    {reserva.estado === 'pendiente' && (
                      <button
                        onClick={() => handleCancelarReserva(reserva.id || reserva.id_reserva)}
                        disabled={cancelando === (reserva.id || reserva.id_reserva)}
                        style={{
                          background: cancelando === (reserva.id || reserva.id_reserva) ? '#9ca3af' : '#ef4444',
                          color: 'white',
                          padding: '0.75rem 1.5rem',
                          border: 'none',
                          borderRadius: '0.5rem',
                          fontWeight: '500',
                          cursor: cancelando === (reserva.id || reserva.id_reserva) ? 'not-allowed' : 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {cancelando === (reserva.id || reserva.id_reserva) ? 'Cancelando...' : 'Cancelar Reserva'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MisReservasPage;

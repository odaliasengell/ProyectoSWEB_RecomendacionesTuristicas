import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SimpleNavbar from '../components/SimpleNavbar';
import { Star, Calendar, MessageSquare, Plus, Trash2, MapPin, Briefcase } from 'lucide-react';
import { getMisRecomendaciones, crearRecomendacion, eliminarRecomendacion } from '../services/api/recomendaciones.service';
import { getTours } from '../services/api/tours.service';
import { getServicios, getContratacionesByEmail } from '../services/api/servicios.service';
import { obtenerMisReservas } from '../services/api/reservas.service';
import { useAuth } from '../contexts/AuthContext';

const MisRecomendacionesPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [recomendaciones, setRecomendaciones] = useState([]);
  const [toursDisponibles, setToursDisponibles] = useState([]); // Tours que el usuario ha reservado
  const [serviciosDisponibles, setServiciosDisponibles] = useState([]); // Servicios contratados
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  
  // Estados del formulario
  const [tipoRecomendacion, setTipoRecomendacion] = useState('tour'); // 'tour' o 'servicio'
  const [idSeleccionado, setIdSeleccionado] = useState('');
  const [calificacion, setCalificacion] = useState(5);
  const [comentario, setComentario] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
    
    cargarDatos();
  }, [isAuthenticated, navigate]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Obtener datos del usuario
      const userDataStr = localStorage.getItem('userData') || localStorage.getItem('user');
      const userData = JSON.parse(userDataStr);
      const userEmail = userData.email;
      
      console.log('📧 Email del usuario:', userEmail);
      
      // Cargar datos de forma individual para mejor manejo de errores
      let recsData = [];
      let misReservas = [];
      let misContrataciones = [];
      let todosLosTours = [];
      let todosLosServicios = [];
      
      // Cargar recomendaciones
      try {
        recsData = await getMisRecomendaciones();
        console.log('✅ Recomendaciones cargadas:', recsData.length);
      } catch (err) {
        console.error('❌ Error cargando recomendaciones:', err);
        recsData = [];
      }
      
      // Cargar reservas
      try {
        misReservas = await obtenerMisReservas();
        console.log('✅ Reservas cargadas:', misReservas.length);
        console.log('Mis reservas:', misReservas);
      } catch (err) {
        console.error('❌ Error cargando reservas:', err);
        misReservas = [];
      }
      
      // Cargar contrataciones
      try {
        misContrataciones = await getContratacionesByEmail(userEmail);
        console.log('✅ Contrataciones cargadas:', misContrataciones.length);
        console.log('Mis contrataciones:', misContrataciones);
      } catch (err) {
        console.error('❌ Error cargando contrataciones:', err);
        misContrataciones = [];
      }
      
      // Cargar todos los tours
      try {
        todosLosTours = await getTours();
        console.log('✅ Tours cargados:', todosLosTours.length);
      } catch (err) {
        console.error('❌ Error cargando tours:', err);
        todosLosTours = [];
      }
      
      // Cargar todos los servicios
      try {
        todosLosServicios = await getServicios();
        console.log('✅ Servicios cargados:', todosLosServicios.length);
      } catch (err) {
        console.error('❌ Error cargando servicios:', err);
        todosLosServicios = [];
      }
      
      // Filtrar solo los tours que el usuario ha reservado
      const idsToursReservados = misReservas.map(reserva => reserva.id_tour);
      console.log('🎫 IDs de tours reservados:', idsToursReservados);
      
      const toursReservados = todosLosTours.filter(tour => {
        const tourId = tour.id_tour || tour.id;
        return idsToursReservados.includes(tourId);
      }).map(tour => ({
        ...tour,
        id: tour.id_tour || tour.id,
        id_tour: tour.id_tour || tour.id, // Asegurar que ambos campos existan
        nombre: tour.nombre_tour || tour.nombre
      }));
      
      console.log('📝 Tours después de mapeo:', toursReservados);
      
      // Filtrar solo los servicios que el usuario ha contratado
      const idsServiciosContratados = misContrataciones.map(contratacion => contratacion.servicio_id);
      console.log('💼 IDs de servicios contratados:', idsServiciosContratados);
      
      const serviciosContratados = todosLosServicios.filter(servicio => 
        idsServiciosContratados.includes(servicio.id)
      );
      
      console.log('✅ Tours disponibles para recomendar:', toursReservados.length);
      console.log('✅ Servicios disponibles para recomendar:', serviciosContratados.length);
      
      setRecomendaciones(recsData);
      setToursDisponibles(toursReservados);
      setServiciosDisponibles(serviciosContratados);
      setError(null);
    } catch (err) {
      console.error('❌ Error fatal cargando datos:', err);
      console.error('Detalles del error:', err.message);
      setError(`Error: ${err.message}. Por favor, verifica la consola para más detalles.`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!comentario.trim()) {
      alert('Por favor escribe un comentario');
      return;
    }

    if (!idSeleccionado) {
      alert('Por favor selecciona un tour o servicio para recomendar');
      return;
    }

    try {
      setSubmitting(true);
      
      // Buscar el nombre del tour o servicio seleccionado
      let nombreReferencia = '';
      if (tipoRecomendacion === 'tour') {
        const tour = toursDisponibles.find(t => {
          const tourId = String(t.id_tour || t.id);
          return tourId === String(idSeleccionado);
        });
        nombreReferencia = tour?.nombre || tour?.nombre_tour || 'Tour no encontrado';
        console.log('🔍 Buscando tour:', idSeleccionado, 'Encontrado:', tour);
      } else {
        const servicio = serviciosDisponibles.find(s => {
          const servicioId = String(s.id);
          return servicioId === String(idSeleccionado);
        });
        nombreReferencia = servicio?.nombre || 'Servicio no encontrado';
        console.log('🔍 Buscando servicio:', idSeleccionado, 'Encontrado:', servicio);
      }
      
      await crearRecomendacion({
        calificacion,
        comentario: comentario.trim(),
        tipo_recomendacion: tipoRecomendacion,
        id_tour: tipoRecomendacion === 'tour' ? idSeleccionado : undefined,
        id_servicio: tipoRecomendacion === 'servicio' ? idSeleccionado : undefined,
        nombre_referencia: nombreReferencia
      });
      
      alert('¡Recomendación creada exitosamente!');
      setShowForm(false);
      setComentario('');
      setCalificacion(5);
      setIdSeleccionado('');
      setTipoRecomendacion('tour');
      
      // Recargar las recomendaciones
      cargarDatos();
      
    } catch (err) {
      console.error('Error creando recomendación:', err);
      alert(err.message || 'No se pudo crear la recomendación. Por favor, intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta recomendación?')) {
      return;
    }

    try {
      console.log('🗑️  Eliminando recomendación con ID:', id);
      await eliminarRecomendacion(id);
      console.log('✅ Recomendación eliminada exitosamente');
      alert('Recomendación eliminada exitosamente');
      cargarDatos();
    } catch (err) {
      console.error('❌ Error eliminando recomendación:', err);
      console.error('Detalles del error:', err.message);
      alert(`No se pudo eliminar la recomendación: ${err.message}`);
    }
  };

  const renderEstrellas = (calificacion) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        size={20}
        fill={index < calificacion ? '#fbbf24' : 'none'}
        color={index < calificacion ? '#fbbf24' : '#d1d5db'}
      />
    ));
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
            ⭐ Mis Recomendaciones
          </h1>
          <p style={{ 
            fontSize: '1.25rem', 
            opacity: 0.95, 
            lineHeight: '1.6',
            textShadow: '0 1px 2px rgba(0,0,0,0.2)' 
          }}>
            Comparte tu experiencia con otros viajeros
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
        
        {/* Mensaje informativo si no hay tours ni servicios disponibles */}
        {!loading && toursDisponibles.length === 0 && serviciosDisponibles.length === 0 && (
          <div style={{
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            border: '2px solid #fbbf24',
            borderRadius: '1rem',
            padding: '2rem',
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#92400e', marginBottom: '1rem' }}>
              📌 ¡Primero necesitas vivir la experiencia!
            </h3>
            <p style={{ color: '#78350f', fontSize: '1.125rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              Para poder crear recomendaciones, primero debes reservar un tour o contratar un servicio.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/tours')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                <MapPin size={20} />
                Ver Tours
              </button>
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
          </div>
        )}
        
        {/* Botón para crear nueva recomendación */}
        {(toursDisponibles.length > 0 || serviciosDisponibles.length > 0) && (
          <div style={{ marginBottom: '2rem', textAlign: 'right' }}>
            <button
              onClick={() => setShowForm(!showForm)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                padding: '1rem 1.5rem',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
              }}
            >
              <Plus size={20} />
              {showForm ? 'Cancelar' : 'Nueva Recomendación'}
            </button>
          </div>
        )}

        {/* Formulario de nueva recomendación */}
        {showForm && (
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            border: '2px solid #10b981'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1.5rem' }}>
              Crear Nueva Recomendación
            </h2>
            
            <form onSubmit={handleSubmit}>
              {/* Selector de tipo */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  ¿Qué deseas recomendar? *
                </label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <label style={{ 
                    flex: 1, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    padding: '1rem',
                    border: `2px solid ${tipoRecomendacion === 'tour' ? '#10b981' : '#e5e7eb'}`,
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    background: tipoRecomendacion === 'tour' ? '#f0fdf4' : 'white',
                    transition: 'all 0.3s ease'
                  }}>
                    <input
                      type="radio"
                      name="tipo"
                      value="tour"
                      checked={tipoRecomendacion === 'tour'}
                      onChange={(e) => {
                        setTipoRecomendacion(e.target.value);
                        setIdSeleccionado('');
                      }}
                      style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
                    />
                    <MapPin size={20} color={tipoRecomendacion === 'tour' ? '#10b981' : '#6b7280'} />
                    <span style={{ fontWeight: '500', color: tipoRecomendacion === 'tour' ? '#10b981' : '#374151' }}>
                      Tour
                    </span>
                  </label>
                  
                  <label style={{ 
                    flex: 1, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    padding: '1rem',
                    border: `2px solid ${tipoRecomendacion === 'servicio' ? '#10b981' : '#e5e7eb'}`,
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    background: tipoRecomendacion === 'servicio' ? '#f0fdf4' : 'white',
                    transition: 'all 0.3s ease'
                  }}>
                    <input
                      type="radio"
                      name="tipo"
                      value="servicio"
                      checked={tipoRecomendacion === 'servicio'}
                      onChange={(e) => {
                        setTipoRecomendacion(e.target.value);
                        setIdSeleccionado('');
                      }}
                      style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
                    />
                    <Briefcase size={20} color={tipoRecomendacion === 'servicio' ? '#10b981' : '#6b7280'} />
                    <span style={{ fontWeight: '500', color: tipoRecomendacion === 'servicio' ? '#10b981' : '#374151' }}>
                      Servicio
                    </span>
                  </label>
                </div>
              </div>

              {/* Selector de tour o servicio */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Selecciona el {tipoRecomendacion === 'tour' ? 'Tour' : 'Servicio'} *
                </label>
                
                {/* Mostrar mensaje si no hay opciones disponibles */}
                {tipoRecomendacion === 'tour' && toursDisponibles.length === 0 && (
                  <div style={{
                    background: '#fef3c7',
                    border: '2px solid #fbbf24',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <p style={{ color: '#92400e', fontSize: '0.875rem', margin: 0 }}>
                      📌 No tienes tours reservados aún. Solo puedes recomendar tours que hayas reservado previamente.
                    </p>
                  </div>
                )}
                
                {tipoRecomendacion === 'servicio' && serviciosDisponibles.length === 0 && (
                  <div style={{
                    background: '#fef3c7',
                    border: '2px solid #fbbf24',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <p style={{ color: '#92400e', fontSize: '0.875rem', margin: 0 }}>
                      📌 No tienes servicios contratados aún. Solo puedes recomendar servicios que hayas contratado previamente.
                    </p>
                  </div>
                )}
                
                <select
                  value={idSeleccionado}
                  onChange={(e) => setIdSeleccionado(e.target.value)}
                  required
                  disabled={
                    (tipoRecomendacion === 'tour' && toursDisponibles.length === 0) ||
                    (tipoRecomendacion === 'servicio' && serviciosDisponibles.length === 0)
                  }
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    outline: 'none',
                    cursor: 'pointer',
                    opacity: (tipoRecomendacion === 'tour' && toursDisponibles.length === 0) ||
                             (tipoRecomendacion === 'servicio' && serviciosDisponibles.length === 0) ? 0.5 : 1
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#10b981'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                >
                  <option value="">-- Selecciona una opción --</option>
                  {tipoRecomendacion === 'tour' ? (
                    toursDisponibles.map(tour => {
                      const tourId = tour.id_tour || tour.id;
                      const tourNombre = tour.nombre_tour || tour.nombre;
                      return (
                        <option key={tourId} value={tourId}>
                          {tourNombre} - ${tour.precio}
                        </option>
                      );
                    })
                  ) : (
                    serviciosDisponibles.map(servicio => (
                      <option key={servicio.id} value={servicio.id}>
                        {servicio.nombre} - ${servicio.precio}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Calificación *
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={32}
                      style={{ cursor: 'pointer' }}
                      fill={star <= calificacion ? '#fbbf24' : 'none'}
                      color={star <= calificacion ? '#fbbf24' : '#d1d5db'}
                      onClick={() => setCalificacion(star)}
                    />
                  ))}
                  <span style={{ marginLeft: '1rem', color: '#6b7280', fontSize: '1.125rem' }}>
                    {calificacion} estrella{calificacion !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Comentario *
                </label>
                <textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  rows="4"
                  placeholder="Comparte tu experiencia..."
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#10b981'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setComentario('');
                    setCalificacion(5);
                    setIdSeleccionado('');
                    setTipoRecomendacion('tour');
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={
                    submitting || 
                    (tipoRecomendacion === 'tour' && toursDisponibles.length === 0) ||
                    (tipoRecomendacion === 'servicio' && serviciosDisponibles.length === 0)
                  }
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    cursor: (
                      submitting || 
                      (tipoRecomendacion === 'tour' && toursDisponibles.length === 0) ||
                      (tipoRecomendacion === 'servicio' && serviciosDisponibles.length === 0)
                    ) ? 'not-allowed' : 'pointer',
                    opacity: (
                      submitting || 
                      (tipoRecomendacion === 'tour' && toursDisponibles.length === 0) ||
                      (tipoRecomendacion === 'servicio' && serviciosDisponibles.length === 0)
                    ) ? 0.5 : 1
                  }}
                >
                  {submitting ? 'Creando...' : 'Publicar Recomendación'}
                </button>
              </div>
            </form>
          </div>
        )}

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
              onClick={cargarDatos}
              style={{
                background: '#10b981',
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

        {/* Lista de recomendaciones */}
        {!error && recomendaciones.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '3rem',
            textAlign: 'center',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <MessageSquare size={64} color="#d1d5db" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.5rem', color: '#6b7280', marginBottom: '0.5rem' }}>
              No tienes recomendaciones aún
            </h3>
            <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>
              Comienza compartiendo tu experiencia con otros viajeros
            </p>
            <button
              onClick={() => setShowForm(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <Plus size={20} />
              Crear Primera Recomendación
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {recomendaciones.map((recomendacion, index) => {
              // El backend ahora serializa los IDs como strings correctamente
              const recomendacionId = String(recomendacion.id || recomendacion._id || `rec-${index}`);
              
              // Debug solo para la primera recomendación
              if (index === 0) {
                console.log('🔍 ID de primera recomendación:', recomendacionId, '(tipo:', typeof recomendacionId, ')');
              }
              
              return (
                <div
                  key={recomendacionId}
                  style={{
                  background: 'white',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  border: '2px solid transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#10b981';
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    {/* Tipo y nombre de lo recomendado */}
                    {recomendacion.tipo_recomendacion && recomendacion.nombre_referencia && (
                      <div style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        background: recomendacion.tipo_recomendacion === 'tour' ? '#f0fdf4' : '#eff6ff',
                        color: recomendacion.tipo_recomendacion === 'tour' ? '#10b981' : '#3b82f6',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        marginBottom: '0.75rem'
                      }}>
                        {recomendacion.tipo_recomendacion === 'tour' ? (
                          <MapPin size={16} />
                        ) : (
                          <Briefcase size={16} />
                        )}
                        {recomendacion.nombre_referencia}
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.5rem' }}>
                      {renderEstrellas(recomendacion.calificacion)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
                      <Calendar size={16} />
                      {new Date(recomendacion.fecha).toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleEliminar(recomendacionId)}
                    style={{
                      background: '#fef2f2',
                      color: '#ef4444',
                      padding: '0.5rem',
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#fee2e2';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#fef2f2';
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <p style={{ 
                  color: '#374151', 
                  fontSize: '1rem', 
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap'
                }}>
                  {recomendacion.comentario}
                </p>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MisRecomendacionesPage;

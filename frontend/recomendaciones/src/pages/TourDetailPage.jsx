import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SimpleNavbar from '../components/SimpleNavbar';
import { MapPin, Clock, Users, DollarSign, Calendar, Star, Phone, Mail, ArrowLeft, MessageCircle } from 'lucide-react';
import { getTourById } from '../services/api/tours.service';
import { getDestinoById } from '../services/api/destinos.service';
import { getGuiaById } from '../services/api/guias.service';
import { crearReserva } from '../services/api/reservas.service';
import { getRecomendaciones } from '../services/api/recomendaciones.service';
import { useAuth } from '../contexts/AuthContext';

const TourDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [tour, setTour] = useState(null);
  const [destino, setDestino] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recomendaciones, setRecomendaciones] = useState([]);
  
  // Estados del formulario de reservación
  const [showReservaForm, setShowReservaForm] = useState(false);
  const [cantidadPersonas, setCantidadPersonas] = useState(1);
  const [fechaReserva, setFechaReserva] = useState('');
  const [comentarios, setComentarios] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    cargarDatosTour();
  }, [id]);

  const cargarDatosTour = async () => {
    try {
      setLoading(true);
      
      // Validar que el ID exista
      if (!id) {
        setError('ID de tour inválido');
        setLoading(false);
        return;
      }
      
      console.log('🔍 Cargando tour con ID:', id);
      const tourData = await getTourById(id);
      console.log('📋 Tour cargado:', tourData);
      
      // Si el tour tiene un guía asociado, cargar su información
      if (tourData.guia_id || tourData.id_guia) {
        try {
          const guiaId = tourData.guia_id || tourData.id_guia;
          console.log('👤 Cargando guía con ID:', guiaId);
          const guiaData = await getGuiaById(guiaId);
          console.log('✅ Datos del guía:', guiaData);
          
          // Construir el nombre completo del guía
          if (guiaData.nombre) {
            tourData.guia_nombre = guiaData.apellido 
              ? `${guiaData.nombre} ${guiaData.apellido}` 
              : guiaData.nombre;
            tourData.guia_telefono = guiaData.telefono;
            tourData.guia_email = guiaData.email;
            tourData.guia_idiomas = guiaData.idiomas;
          }
        } catch (err) {
          console.error('❌ Error cargando guía:', err);
          // No es crítico si no se puede cargar el guía
          tourData.guia_nombre = 'Guía asignado';
        }
      }
      
      setTour(tourData);
      
      // Si el tour tiene un destino asociado, cargarlo
      if (tourData.id_destino) {
        try {
          const destinoData = await getDestinoById(tourData.id_destino);
          setDestino(destinoData);
        } catch (err) {
          console.error('Error cargando destino:', err);
          // No es crítico si no se puede cargar el destino
        }
      }
      
      // Cargar recomendaciones para este tour
      await cargarRecomendaciones(id);
      
      setError(null);
    } catch (err) {
      console.error('Error cargando tour:', err);
      setError('No se pudo cargar el tour. Por favor, intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const cargarRecomendaciones = async (tourId) => {
    try {
      const todasRecomendaciones = await getRecomendaciones();
      // Filtrar solo las recomendaciones de este tour
      const recomendacionesTour = todasRecomendaciones.filter(r => 
        r.tipo_recomendacion === 'tour' && 
        String(r.id_tour) === String(tourId)
      );
      setRecomendaciones(recomendacionesTour);
      console.log(`✅ ${recomendacionesTour.length} recomendaciones cargadas para el tour ${tourId}`);
    } catch (err) {
      console.error('Error cargando recomendaciones:', err);
      // No es crítico si no se pueden cargar las recomendaciones
      setRecomendaciones([]);
    }
  };

  const calcularPrecioTotal = () => {
    return tour ? tour.precio * cantidadPersonas : 0;
  };

  const renderEstrellas = (calificacion) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        fill={i < calificacion ? '#fbbf24' : 'none'}
        color={i < calificacion ? '#fbbf24' : '#d1d5db'}
      />
    ));
  };

  const calcularPromedioCalificacion = () => {
    if (recomendaciones.length === 0) return 0;
    const suma = recomendaciones.reduce((acc, rec) => acc + rec.calificacion, 0);
    return (suma / recomendaciones.length).toFixed(1);
  };

  const handleReservar = () => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para hacer una reservación');
      navigate('/login');
      return;
    }
    setShowReservaForm(true);
  };

  const handleSubmitReserva = async (e) => {
    e.preventDefault();
    
    if (!fechaReserva) {
      alert('Por favor selecciona una fecha para la reserva');
      return;
    }

    try {
      setSubmitting(true);
      
      // Obtener el ID del usuario desde localStorage
      const userDataStr = localStorage.getItem('userData') || localStorage.getItem('user');
      if (!userDataStr) {
        alert('Error: No se encontró la información del usuario. Por favor, inicia sesión nuevamente.');
        navigate('/login');
        return;
      }
      
      const userData = JSON.parse(userDataStr);
      const userId = userData.id || userData.id_usuario;
      
      if (!userId) {
        alert('Error: ID de usuario no encontrado. Por favor, inicia sesión nuevamente.');
        navigate('/login');
        return;
      }
      
      const reservaData = {
        tour_id: tour.id,
        usuario_id: userId,
        fecha_reserva: new Date(fechaReserva).toISOString(),
        cantidad_personas: cantidadPersonas,
        precio_total: calcularPrecioTotal(),
        comentarios: comentarios || ''
      };

      console.log('Creando reserva:', reservaData);
      
      // Llamar al API de reservas
      const reservaCreada = await crearReserva(reservaData);
      
      console.log('Reserva creada exitosamente:', reservaCreada);
      
      alert('¡Reserva creada exitosamente! Te contactaremos pronto.');
      setShowReservaForm(false);
      
      // Resetear el formulario
      setFechaReserva('');
      setComentarios('');
      setCantidadPersonas(1);
      
    } catch (err) {
      console.error('Error creando reserva:', err);
      alert(err.message || 'No se pudo crear la reserva. Por favor, intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const getImageUrl = (url) => {
    if (!url) return '/images/galapagos.png';
    if (url.startsWith('http')) return url;
    return `http://localhost:8000${url}`;
  };

  const heroStyle = {
    minHeight: '40vh',
    backgroundImage: tour?.imagen_url || tour?.imagenUrl
      ? `linear-gradient(135deg, rgba(16, 185, 129, 0.75) 0%, rgba(59, 130, 246, 0.65) 100%), url(${getImageUrl(tour.imagen_url || tour.imagenUrl)})`
      : 'linear-gradient(135deg, rgba(16, 185, 129, 0.85) 0%, rgba(59, 130, 246, 0.75) 100%), url(/images/galapagos.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    padding: '6rem 1rem 3rem 1rem',
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

  if (error || !tour) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #f9fafb, white)' }}>
        <SimpleNavbar />
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '8rem 1rem' }}>
          <div style={{
            background: '#fef2f2',
            border: '2px solid #fecaca',
            borderRadius: '1rem',
            padding: '2rem',
            textAlign: 'center'
          }}>
            <p style={{ color: '#dc2626', fontSize: '1.125rem', marginBottom: '1rem' }}>
              {error || 'Tour no encontrado'}
            </p>
            <button
              onClick={() => navigate('/tours')}
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
              Volver a Tours
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #f9fafb, white)' }}>
      <SimpleNavbar />
      
      {/* Hero Section */}
      <div style={heroStyle}>
        <div style={{ maxWidth: '64rem', position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <button
            onClick={() => navigate('/tours')}
            style={{
              position: 'absolute',
              top: '-2rem',
              left: '0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            <ArrowLeft size={20} />
            Volver
          </button>
          
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: 'bold', 
            marginBottom: '1rem', 
            lineHeight: '1.1',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)' 
          }}>
            {tour.nombre}
          </h1>
          
          {destino && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '0.5rem',
              fontSize: '1.125rem',
              opacity: 0.95,
              textShadow: '0 1px 2px rgba(0,0,0,0.2)'
            }}>
              <MapPin size={20} />
              {destino.nombre} - {destino.provincia}
            </div>
          )}
        </div>
      </div>

      {/* Contenido Principal */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
          
          {/* Columna Izquierda - Información del Tour */}
          <div style={{ flex: '1 1 600px', minWidth: '0' }}>
            {/* Descripción */}
            <div style={{ 
              background: 'white', 
              borderRadius: '1rem', 
              padding: '2rem',
              marginBottom: '2rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
                Descripción del Tour
              </h2>
              <p style={{ color: '#6b7280', lineHeight: '1.75', fontSize: '1rem' }}>
                {tour.descripcion}
              </p>
            </div>

            {/* Características */}
            <div style={{ 
              background: 'white', 
              borderRadius: '1rem', 
              padding: '2rem',
              marginBottom: '2rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1.5rem' }}>
                Características
              </h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Clock size={24} color="white" />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Duración</p>
                    <p style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>{tour.duracion}</p>
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
                    <Users size={24} color="white" />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Capacidad</p>
                    <p style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>
                      {tour.capacidad_maxima || tour.capacidadMaxima} personas
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
                    <DollarSign size={24} color="white" />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Precio</p>
                    <p style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>
                      ${tour.precio.toFixed(2)} USD
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    background: tour.disponible 
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                      : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Star size={24} color="white" />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Estado</p>
                    <p style={{ fontSize: '1rem', fontWeight: '600', color: tour.disponible ? '#10b981' : '#ef4444' }}>
                      {tour.disponible ? 'Disponible' : 'No disponible'}
                    </p>
                  </div>
                </div>

                {/* Guía del Tour */}
                {tour.guia_nombre && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', gridColumn: 'span 2' }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                      borderRadius: '0.5rem',
                      padding: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Users size={24} color="white" />
                    </div>
                    <div>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Guía Turístico</p>
                      <p style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>
                        {tour.guia_nombre}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Información del Destino */}
            {destino && (
              <div style={{ 
                background: 'white', 
                borderRadius: '1rem', 
                padding: '2rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
                  Sobre el Destino
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <MapPin size={20} color="#10b981" />
                  <p style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>
                    {destino.nombre}
                  </p>
                </div>
                <p style={{ color: '#6b7280', lineHeight: '1.75', marginBottom: '1rem' }}>
                  {destino.descripcion}
                </p>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <span style={{
                    background: '#f0fdf4',
                    color: '#10b981',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}>
                    {destino.categoria}
                  </span>
                  <span style={{
                    background: '#eff6ff',
                    color: '#3b82f6',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}>
                    {destino.ciudad}
                  </span>
                  {destino.calificacion_promedio > 0 && (
                    <span style={{
                      background: '#fef3c7',
                      color: '#f59e0b',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <Star size={14} fill="#f59e0b" />
                      {destino.calificacion_promedio.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Columna Derecha - Tarjeta de Reservación */}
          <div style={{ flex: '1 1 350px', minWidth: '300px' }}>
            <div style={{ 
              background: 'white', 
              borderRadius: '1rem', 
              padding: '2rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              position: 'sticky',
              top: '6rem'
            }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1.5rem' }}>
                Reserva tu Tour
              </h3>

              {!showReservaForm ? (
                <>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      paddingBottom: '1rem',
                      borderBottom: '2px solid #f3f4f6'
                    }}>
                      <span style={{ color: '#6b7280', fontSize: '1rem' }}>Precio por persona</span>
                      <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                        ${tour.precio.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                      Número de personas
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={tour.capacidad_maxima || tour.capacidadMaxima}
                      value={cantidadPersonas}
                      onChange={(e) => setCantidadPersonas(parseInt(e.target.value) || 1)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#10b981'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>

                  <div style={{
                    background: '#f9fafb',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    marginBottom: '1.5rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ color: '#6b7280' }}>Subtotal</span>
                      <span style={{ fontWeight: '600' }}>${calcularPrecioTotal().toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid #e5e7eb' }}>
                      <span style={{ fontWeight: '600', color: '#1f2937' }}>Total</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>
                        ${calcularPrecioTotal().toFixed(2)} USD
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleReservar}
                    disabled={!tour.disponible}
                    style={{
                      width: '100%',
                      background: tour.disponible 
                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                        : '#9ca3af',
                      color: 'white',
                      padding: '1rem',
                      border: 'none',
                      borderRadius: '0.5rem',
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      cursor: tour.disponible ? 'pointer' : 'not-allowed',
                      transition: 'all 0.3s ease',
                      boxShadow: tour.disponible ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (tour.disponible) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.2)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (tour.disponible) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                      }
                    }}
                  >
                    {tour.disponible ? 'Reservar Ahora' : 'No Disponible'}
                  </button>
                </>
              ) : (
                <form onSubmit={handleSubmitReserva}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                      Fecha de la Reserva *
                    </label>
                    <input
                      type="date"
                      value={fechaReserva}
                      onChange={(e) => setFechaReserva(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                      Número de personas *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={tour.capacidad_maxima || tour.capacidadMaxima}
                      value={cantidadPersonas}
                      onChange={(e) => setCantidadPersonas(parseInt(e.target.value) || 1)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                      Comentarios o requisitos especiales
                    </label>
                    <textarea
                      value={comentarios}
                      onChange={(e) => setComentarios(e.target.value)}
                      rows="3"
                      placeholder="Alergias, preferencias, etc."
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        outline: 'none',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  <div style={{
                    background: '#f0fdf4',
                    border: '1px solid #86efac',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ color: '#166534' }}>Total a pagar</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>
                        ${calcularPrecioTotal().toFixed(2)} USD
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setShowReservaForm(false)}
                      style={{
                        flex: 1,
                        background: '#f3f4f6',
                        color: '#374151',
                        padding: '0.75rem',
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
                      disabled={submitting}
                      style={{
                        flex: 1,
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        padding: '0.75rem',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontWeight: '600',
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        opacity: submitting ? 0.7 : 1
                      }}
                    >
                      {submitting ? 'Procesando...' : 'Confirmar Reserva'}
                    </button>
                  </div>
                </form>
              )}

              <div style={{ 
                marginTop: '1.5rem', 
                paddingTop: '1.5rem', 
                borderTop: '2px solid #f3f4f6'
              }}>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', textAlign: 'center' }}>
                  ✓ Confirmación inmediata<br/>
                  ✓ Cancelación gratuita hasta 24h antes<br/>
                  ✓ Soporte al cliente 24/7
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de Recomendaciones */}
      <div style={{ 
        padding: '4rem 1rem',
        maxWidth: '80rem',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem'
        }}>
          <div>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '0.5rem'
            }}>
              Recomendaciones de Usuarios
            </h2>
            {recomendaciones.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {renderEstrellas(Math.round(parseFloat(calcularPromedioCalificacion())))}
                </div>
                <span style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>
                  {calcularPromedioCalificacion()}
                </span>
                <span style={{ color: '#6b7280' }}>
                  ({recomendaciones.length} {recomendaciones.length === 1 ? 'recomendación' : 'recomendaciones'})
                </span>
              </div>
            )}
          </div>
        </div>

        {recomendaciones.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            background: 'white',
            borderRadius: '1rem',
            border: '2px dashed #e5e7eb'
          }}>
            <MessageCircle size={48} color="#d1d5db" style={{ margin: '0 auto 1rem' }} />
            <p style={{ fontSize: '1.125rem', color: '#6b7280', marginBottom: '0.5rem' }}>
              Aún no hay recomendaciones
            </p>
            <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
              Sé el primero en compartir tu experiencia con este tour
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {recomendaciones.map((rec) => {
              const recId = String(rec.id || rec._id || Math.random());
              return (
                <div
                  key={recId}
                  style={{
                    background: 'white',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e5e7eb',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.borderColor = '#10b981';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      {renderEstrellas(rec.calificacion)}
                    </div>
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {new Date(rec.fecha).toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  
                  <p style={{ 
                    color: '#374151', 
                    lineHeight: '1.6',
                    fontSize: '1rem'
                  }}>
                    {rec.comentario}
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

export default TourDetailPage;

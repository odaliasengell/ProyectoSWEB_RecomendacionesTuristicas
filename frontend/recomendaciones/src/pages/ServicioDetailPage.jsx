import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SimpleNavbar from '../components/SimpleNavbar';
import { MapPin, Clock, Users, DollarSign, Package, Phone, Mail, ArrowLeft, Calendar, Star, MessageCircle } from 'lucide-react';
import { getServicioById } from '../services/api/servicios.service';
import { crearContratacion } from '../services/api/contrataciones.service';
import { getRecomendaciones } from '../services/api/recomendaciones.service';
import { createPayment } from '../services/paymentService';
import { useAuth } from '../contexts/AuthContext';

const ServicioDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [servicio, setServicio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recomendaciones, setRecomendaciones] = useState([]);
  
  // Estados del formulario de contratación
  const [showContratacionForm, setShowContratacionForm] = useState(false);
  const [numViajeros, setNumViajeros] = useState(1);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteEmail, setClienteEmail] = useState('');
  const [clienteTelefono, setClienteTelefono] = useState('');
  const [notas, setNotas] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Estados para pago
  const [paymentProvider, setPaymentProvider] = useState('mock');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');

  useEffect(() => {
    cargarDatosServicio();
  }, [id]);

  useEffect(() => {
    if (user) {
      // El modelo usa 'nombre' y 'apellido', no 'firstName' y 'lastName'
      const nombreCompleto = user.nombre && user.apellido 
        ? `${user.nombre} ${user.apellido}` 
        : user.nombre || user.username || '';
      setClienteNombre(nombreCompleto);
      setClienteEmail(user.email || '');
      // El teléfono no está en el modelo de usuario, dejarlo vacío para que el usuario lo ingrese
    }
  }, [user]);

  const cargarDatosServicio = async () => {
    try {
      setLoading(true);
      
      if (!id) {
        setError('ID de servicio inválido');
        setLoading(false);
        return;
      }
      
      const servicioData = await getServicioById(id);
      setServicio(servicioData);
      
      // Cargar recomendaciones para este servicio
      await cargarRecomendaciones(id);
      
      setError(null);
    } catch (err) {
      console.error('Error cargando servicio:', err);
      setError('No se pudo cargar el servicio. Por favor, intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const cargarRecomendaciones = async (servicioId) => {
    try {
      const todasRecomendaciones = await getRecomendaciones();
      // Filtrar solo las recomendaciones de este servicio
      const recomendacionesServicio = todasRecomendaciones.filter(r => 
        r.tipo_recomendacion === 'servicio' && 
        String(r.id_servicio) === String(servicioId)
      );
      setRecomendaciones(recomendacionesServicio);
      console.log(`✅ ${recomendacionesServicio.length} recomendaciones cargadas para el servicio ${servicioId}`);
    } catch (err) {
      console.error('Error cargando recomendaciones:', err);
      // No es crítico si no se pueden cargar las recomendaciones
      setRecomendaciones([]);
    }
  };

  const calcularDiasDiferencia = () => {
    if (!fechaInicio || !fechaFin) return servicio?.duracion_dias || 1;
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diff = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 1;
  };

  const calcularTotal = () => {
    if (!servicio) return 0;
    const dias = calcularDiasDiferencia();
    return servicio.precio * dias * numViajeros;
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

  const handleContratar = () => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para contratar un servicio');
      navigate('/login');
      return;
    }
    
    // Mostrar formulario de contratación
    setShowContratacionForm(true);
  };

  const handleSubmitContratacion = async (e) => {
    e.preventDefault();
    
    if (!fechaInicio || !fechaFin) {
      alert('Por favor selecciona las fechas de inicio y fin');
      return;
    }

    if (new Date(fechaFin) < new Date(fechaInicio)) {
      alert('La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }

    try {
      setSubmitting(true);
      
      const total = calcularTotal();
      
      // Obtener el ID del usuario del contexto
      const userId = user?.id || user?.usuario_id;
      
      if (!userId) {
        alert('Error: No se pudo obtener tu ID de usuario');
        setSubmitting(false);
        return;
      }

      console.log('💳 Paso 1: Procesando pago...');
      
      // PASO 1: Crear el pago primero
      const paymentData = {
        amount: total,
        currency: 'USD',
        provider: paymentProvider,
        description: `Contratación: ${servicio.nombre} - ${numViajeros} persona(s)`,
        order_id: `servicio_${servicio.id}_${Date.now()}`,
        metadata: {
          servicio_id: servicio.id,
          servicio_nombre: servicio.nombre,
          cantidad_personas: numViajeros,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          usuario_email: clienteEmail || ''
        }
      };
      
      try {
        const pagoCreado = await createPayment(paymentData);
        console.log('✅ Pago creado exitosamente:', pagoCreado);
        
        // Verificar que el pago fue exitoso
        const validStatuses = ['completed', 'pending', 'processing'];
        if (!validStatuses.includes(pagoCreado.status)) {
          throw new Error(`El pago falló con estado: ${pagoCreado.status}`);
        }
        
        console.log('📝 Paso 2: Creando contratación...');
      
        const contratacionData = {
          servicio_id: servicio.id,
          usuario_id: userId,
          fecha_contratacion: new Date().toISOString(),
          fecha_inicio: fechaInicio ? new Date(fechaInicio).toISOString() : undefined,
          fecha_fin: fechaFin ? new Date(fechaFin).toISOString() : undefined,
          cantidad_personas: numViajeros,
          total: total,
          cliente_nombre: clienteNombre,
          cliente_email: clienteEmail,
          cliente_telefono: clienteTelefono,
          notas: notas || ''
        };

        console.log('Creando contratación:', contratacionData);
        
        const contratacionCreada = await crearContratacion(contratacionData);
        
        console.log('✅ Contratación creada exitosamente:', contratacionCreada);
        
        alert(`¡Contratación confirmada! 🎉\n\n` +
              `Servicio: ${servicio.nombre}\n` +
              `Personas: ${numViajeros}\n` +
              `Total pagado: $${total.toFixed(2)}\n` +
              `ID de Pago: ${pagoCreado.external_id}\n\n` +
              `Te contactaremos pronto con más detalles.`);
        setShowContratacionForm(false);
        
        // Resetear el formulario
        setFechaInicio('');
        setFechaFin('');
        setNotas('');
        setNumViajeros(1);
        setCardNumber('');
        setCardExpiry('');
        setCardCvc('');
        setCardName('');
        
      } catch (paymentError) {
        console.error('❌ Error en el pago:', paymentError);
        alert(`Error al procesar el pago: ${paymentError.message || 'Error desconocido'}`);
        return;
      }
      
    } catch (err) {
      console.error('Error creando contratación:', err);
      alert(err.message || 'No se pudo crear la contratación. Por favor, intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoriaColor = (categoria) => {
    const colores = {
      hotel: '#3b82f6',
      transporte: '#10b981',
      restaurante: '#f59e0b',
      actividad: '#8b5cf6',
      aventura: '#ef4444',
      cultural: '#06b6d4',
      gastronomico: '#f97316',
      spa: '#ec4899'
    };
    return colores[categoria] || '#6b7280';
  };

  const getBackgroundImage = () => {
    if (servicio?.imagen_url) {
      const imageUrl = servicio.imagen_url.startsWith('http') 
        ? servicio.imagen_url 
        : `http://localhost:8000${servicio.imagen_url}`;
      return `linear-gradient(135deg, rgba(16, 185, 129, 0.75) 0%, rgba(59, 130, 246, 0.65) 100%), url(${imageUrl})`;
    }
    return 'linear-gradient(135deg, rgba(16, 185, 129, 0.75) 0%, rgba(59, 130, 246, 0.65) 100%), url(/images/galapagos.png)';
  };

  const heroStyle = {
    minHeight: '40vh',
    backgroundImage: getBackgroundImage(),
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

  if (error || !servicio) {
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
              {error || 'Servicio no encontrado'}
            </p>
            <button
              onClick={() => navigate('/servicios')}
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
              Volver a Servicios
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
            onClick={() => navigate('/servicios')}
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
          
          <div style={{
            display: 'inline-block',
            background: `${getCategoriaColor(servicio.categoria)}`,
            padding: '0.5rem 1rem',
            borderRadius: '9999px',
            fontSize: '0.875rem',
            fontWeight: '600',
            marginBottom: '1rem',
            textTransform: 'uppercase'
          }}>
            {servicio.categoria}
          </div>
          
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: 'bold', 
            marginBottom: '1rem', 
            lineHeight: '1.1',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)' 
          }}>
            {servicio.nombre}
          </h1>
          
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
            {servicio.destino}
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
          
          {/* Columna Izquierda - Información del Servicio */}
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
                Descripción del Servicio
              </h2>
              <p style={{ color: '#6b7280', lineHeight: '1.75', fontSize: '1rem' }}>
                {servicio.descripcion}
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
                    background: `linear-gradient(135deg, ${getCategoriaColor(servicio.categoria)}, ${getCategoriaColor(servicio.categoria)}dd)`,
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
                    <p style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>
                      {servicio.duracion_dias} día{servicio.duracion_dias !== 1 ? 's' : ''}
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
                    <Users size={24} color="white" />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Capacidad</p>
                    <p style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>
                      {servicio.capacidad_maxima} personas
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
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Precio por día</p>
                    <p style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>
                      ${servicio.precio.toFixed(2)} USD
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    background: servicio.disponible 
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                      : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Package size={24} color="white" />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Estado</p>
                    <p style={{ fontSize: '1rem', fontWeight: '600', color: servicio.disponible ? '#10b981' : '#ef4444' }}>
                      {servicio.disponible ? 'Disponible' : 'No disponible'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Información del Proveedor */}
            <div style={{ 
              background: 'white', 
              borderRadius: '1rem', 
              padding: '2rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
                Proveedor del Servicio
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Package size={20} color="#10b981" />
                <p style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>
                  {servicio.proveedor}
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280' }}>
                  <Phone size={18} />
                  <span>{servicio.telefono_contacto}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280' }}>
                  <Mail size={18} />
                  <span>{servicio.email_contacto}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha - Tarjeta de Contratación */}
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
                Contratar Servicio
              </h3>

              {!showContratacionForm ? (
                <>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      paddingBottom: '1rem',
                      borderBottom: '2px solid #f3f4f6'
                    }}>
                      <span style={{ color: '#6b7280', fontSize: '1rem' }}>Precio por día</span>
                      <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                        ${servicio.precio.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                      Número de viajeros
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={servicio.capacidad_maxima}
                      value={numViajeros}
                      onChange={(e) => setNumViajeros(parseInt(e.target.value) || 1)}
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
                      <span style={{ color: '#6b7280' }}>Duración recomendada</span>
                      <span style={{ fontWeight: '600' }}>{servicio.duracion_dias} día{servicio.duracion_dias !== 1 ? 's' : ''}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ color: '#6b7280' }}>Subtotal</span>
                      <span style={{ fontWeight: '600' }}>${(servicio.precio * servicio.duracion_dias * numViajeros).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid #e5e7eb' }}>
                      <span style={{ fontWeight: '600', color: '#1f2937' }}>Total Estimado</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>
                        ${(servicio.precio * servicio.duracion_dias * numViajeros).toFixed(2)} USD
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleContratar}
                    disabled={!servicio.disponible}
                    style={{
                      width: '100%',
                      background: servicio.disponible 
                        ? `linear-gradient(135deg, ${getCategoriaColor(servicio.categoria)}, ${getCategoriaColor(servicio.categoria)}dd)`
                        : '#9ca3af',
                      color: 'white',
                      padding: '1rem',
                      border: 'none',
                      borderRadius: '0.5rem',
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      cursor: servicio.disponible ? 'pointer' : 'not-allowed',
                      transition: 'all 0.3s ease',
                      boxShadow: servicio.disponible ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (servicio.disponible) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.2)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (servicio.disponible) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                      }
                    }}
                  >
                    {servicio.disponible ? 'Contratar Ahora' : 'No Disponible'}
                  </button>
                </>
              ) : (
                <form onSubmit={handleSubmitContratacion}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      value={clienteNombre}
                      onChange={(e) => setClienteNombre(e.target.value)}
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
                      Email *
                    </label>
                    <input
                      type="email"
                      value={clienteEmail}
                      onChange={(e) => setClienteEmail(e.target.value)}
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
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      value={clienteTelefono}
                      onChange={(e) => setClienteTelefono(e.target.value)}
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
                      Fecha de inicio *
                    </label>
                    <input
                      type="date"
                      value={fechaInicio}
                      onChange={(e) => setFechaInicio(e.target.value)}
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
                      Fecha de fin *
                    </label>
                    <input
                      type="date"
                      value={fechaFin}
                      onChange={(e) => setFechaFin(e.target.value)}
                      min={fechaInicio || new Date().toISOString().split('T')[0]}
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
                      Número de viajeros *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={servicio.capacidad_maxima}
                      value={numViajeros}
                      onChange={(e) => setNumViajeros(parseInt(e.target.value) || 1)}
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
                      Notas o requisitos especiales
                    </label>
                    <textarea
                      value={notas}
                      onChange={(e) => setNotas(e.target.value)}
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

                  {/* Método de Pago */}
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                      Método de Pago *
                    </label>
                    <select
                      value={paymentProvider}
                      onChange={(e) => setPaymentProvider(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        outline: 'none',
                        backgroundColor: 'white',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="mock">💳 Mock (Pruebas)</option>
                      <option value="stripe">💵 Stripe</option>
                    </select>
                  </div>

                  {/* Campos de tarjeta para Stripe */}
                  {paymentProvider === 'stripe' && (
                    <div style={{ 
                      marginBottom: '1rem', 
                      padding: '1rem', 
                      backgroundColor: '#f0f9ff', 
                      borderRadius: '0.5rem',
                      border: '1px solid #bae6fd'
                    }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0369a1', marginBottom: '1rem' }}>
                        💳 Datos de Tarjeta
                      </p>
                      
                      <div style={{ marginBottom: '0.75rem' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
                          Nombre en la tarjeta
                        </label>
                        <input
                          type="text"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="JUAN PEREZ"
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem'
                          }}
                        />
                      </div>
                      
                      <div style={{ marginBottom: '0.75rem' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
                          Número de tarjeta
                        </label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                            const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                            setCardNumber(formatted);
                          }}
                          placeholder="4242 4242 4242 4242"
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem',
                            fontFamily: 'monospace'
                          }}
                        />
                      </div>
                      
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
                            Expiración
                          </label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => {
                              let value = e.target.value.replace(/\D/g, '').slice(0, 4);
                              if (value.length >= 2) {
                                value = value.slice(0, 2) + '/' + value.slice(2);
                              }
                              setCardExpiry(value);
                            }}
                            placeholder="MM/AA"
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '0.375rem',
                              fontSize: '0.875rem',
                              fontFamily: 'monospace'
                            }}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
                            CVC
                          </label>
                          <input
                            type="text"
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            placeholder="123"
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '0.375rem',
                              fontSize: '0.875rem',
                              fontFamily: 'monospace'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{
                    background: '#f0fdf4',
                    border: '1px solid #86efac',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ color: '#166534' }}>Duración</span>
                      <span style={{ fontWeight: '600', color: '#166534' }}>{calcularDiasDiferencia()} día{calcularDiasDiferencia() !== 1 ? 's' : ''}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ color: '#166534' }}>Total a pagar</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>
                        ${calcularTotal().toFixed(2)} USD
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setShowContratacionForm(false)}
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
                        background: `linear-gradient(135deg, ${getCategoriaColor(servicio.categoria)}, ${getCategoriaColor(servicio.categoria)}dd)`,
                        color: 'white',
                        padding: '0.75rem',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontWeight: '600',
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        opacity: submitting ? 0.7 : 1
                      }}
                    >
                      {submitting ? 'Procesando...' : 'Confirmar'}
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
                  ✓ Cancelación gratuita hasta 48h antes<br/>
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
              Sé el primero en compartir tu experiencia con este servicio
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

export default ServicioDetailPage;

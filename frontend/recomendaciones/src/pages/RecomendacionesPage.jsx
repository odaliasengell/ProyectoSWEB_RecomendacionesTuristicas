import React, { useState, useEffect } from 'react';
import SimpleNavbar from '../components/SimpleNavbar';
import { Star, Calendar, MessageSquare, MapPin, Briefcase, Filter } from 'lucide-react';
import { getRecomendaciones } from '../services/api/recomendaciones.service';

const RecomendacionesPage = () => {
  const [recomendaciones, setRecomendaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState('todos'); // 'todos', 'tour', 'servicio'
  const [filtroCalificacion, setFiltroCalificacion] = useState(0); // 0 = todas, 1-5 = mínima calificación

  useEffect(() => {
    cargarRecomendaciones();
  }, []);

  const cargarRecomendaciones = async () => {
    try {
      setLoading(true);
      const data = await getRecomendaciones();
      // Ordenar por fecha (más reciente primero)
      const ordenadas = data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      setRecomendaciones(ordenadas);
      setError(null);
    } catch (err) {
      console.error('Error cargando recomendaciones:', err);
      setError('No se pudieron cargar las recomendaciones. Por favor, intenta más tarde.');
    } finally {
      setLoading(false);
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

  const recomendacionesFiltradas = recomendaciones.filter(rec => {
    // Filtro por tipo
    if (filtroTipo !== 'todos' && rec.tipo_recomendacion !== filtroTipo) {
      return false;
    }
    
    // Filtro por calificación mínima
    if (filtroCalificacion > 0 && rec.calificacion < filtroCalificacion) {
      return false;
    }
    
    return true;
  });

  const heroStyle = {
    minHeight: '40vh',
    backgroundImage: 'linear-gradient(135deg, rgba(59, 130, 246, 0.85) 0%, rgba(16, 185, 129, 0.75) 100%), url(/images/galapagos.png)',
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
            fontSize: '3.5rem', 
            fontWeight: 'bold', 
            marginBottom: '1rem', 
            lineHeight: '1.1',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)' 
          }}>
            🌟 Recomendaciones de Viajeros
          </h1>
          <p style={{ 
            fontSize: '1.5rem', 
            opacity: 0.95, 
            lineHeight: '1.6',
            textShadow: '0 1px 2px rgba(0,0,0,0.2)' 
          }}>
            Descubre las experiencias de otros viajeros
          </p>
        </div>
      </div>

      {/* Contenido Principal */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 1rem' }}>
        
        {/* Filtros */}
        <div style={{
          background: 'white',
          borderRadius: '1rem',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <Filter size={20} color="#6b7280" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>Filtros</h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {/* Filtro por tipo */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Tipo de Recomendación
              </label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="todos">Todos</option>
                <option value="tour">Tours</option>
                <option value="servicio">Servicios</option>
              </select>
            </div>

            {/* Filtro por calificación */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Calificación Mínima
              </label>
              <select
                value={filtroCalificacion}
                onChange={(e) => setFiltroCalificacion(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value={0}>Todas</option>
                <option value={5}>5 ⭐</option>
                <option value={4}>4 ⭐ o más</option>
                <option value={3}>3 ⭐ o más</option>
                <option value={2}>2 ⭐ o más</option>
                <option value={1}>1 ⭐ o más</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
            Mostrando {recomendacionesFiltradas.length} de {recomendaciones.length} recomendaciones
          </div>
        </div>

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
              onClick={cargarRecomendaciones}
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

        {/* Lista de recomendaciones */}
        {!error && recomendacionesFiltradas.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '3rem',
            textAlign: 'center',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <MessageSquare size={64} color="#d1d5db" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.5rem', color: '#6b7280', marginBottom: '0.5rem' }}>
              No hay recomendaciones que coincidan
            </h3>
            <p style={{ color: '#9ca3af' }}>
              Intenta ajustar los filtros de búsqueda
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {recomendacionesFiltradas.map((recomendacion) => (
              <div
                key={recomendacion.id}
                style={{
                  background: 'white',
                  borderRadius: '1rem',
                  padding: '1.5rem',
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
                <div style={{ marginBottom: '1rem' }}>
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

                <p style={{ 
                  color: '#374151', 
                  fontSize: '1rem', 
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap'
                }}>
                  {recomendacion.comentario}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecomendacionesPage;

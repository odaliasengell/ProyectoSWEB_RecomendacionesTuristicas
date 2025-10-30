import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SimpleNavbar from '../components/SimpleNavbar';
import DestinosDestacados from '../components/DestinosDestacados';
import { Search, MapPin, Calendar, ArrowRight, Star, Shield, Clock, DollarSign, Package } from 'lucide-react';
import { getDestinos } from '../services/api/destinos.service';
import { getTours } from '../services/api/tours.service';
import { getServicios } from '../services/api/servicios.service';

const SimpleLandingPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [destinos, setDestinos] = useState([]);
  const [tours, setTours] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [destinosData, toursData, serviciosData] = await Promise.all([
        getDestinos().catch(() => []),
        getTours().catch(() => []),
        getServicios().catch(() => [])
      ]);
      setDestinos(destinosData);
      setTours(toursData);
      setServicios(serviciosData);
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setShowResults(true);
      // Scroll suave a los resultados
      setTimeout(() => {
        document.getElementById('search-results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      setShowResults(false);
    }
  };

  const filtrarResultados = (items, tipo) => {
    if (!searchTerm) return [];
    
    return items.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      
      if (tipo === 'destino') {
        return (
          item.nombre?.toLowerCase().includes(searchLower) ||
          item.descripcion?.toLowerCase().includes(searchLower) ||
          item.categoria?.toLowerCase().includes(searchLower) ||
          item.provincia?.toLowerCase().includes(searchLower) ||
          item.ciudad?.toLowerCase().includes(searchLower) ||
          item.ubicacion?.toLowerCase().includes(searchLower)
        );
      }
      
      if (tipo === 'tour') {
        return (
          item.nombre?.toLowerCase().includes(searchLower) ||
          item.descripcion?.toLowerCase().includes(searchLower) ||
          item.duracion?.toLowerCase().includes(searchLower)
        );
      }
      
      if (tipo === 'servicio') {
        return (
          item.nombre?.toLowerCase().includes(searchLower) ||
          item.descripcion?.toLowerCase().includes(searchLower) ||
          item.categoria?.toLowerCase().includes(searchLower) ||
          item.ubicacion?.toLowerCase().includes(searchLower)
        );
      }
      
      return false;
    });
  };

  const obtenerSugerencias = () => {
    if (!searchTerm || searchTerm.length < 2) return [];
    
    const sugerencias = [];
    const searchLower = searchTerm.toLowerCase();
    
    // Sugerencias de destinos
    destinos.forEach(item => {
      if (item.nombre?.toLowerCase().includes(searchLower) || 
          item.ciudad?.toLowerCase().includes(searchLower)) {
        sugerencias.push({ 
          texto: item.nombre || item.ciudad, 
          tipo: 'Destino',
          item: item
        });
      }
    });
    
    // Sugerencias de tours
    tours.forEach(item => {
      if (item.nombre?.toLowerCase().includes(searchLower)) {
        sugerencias.push({ 
          texto: item.nombre, 
          tipo: 'Tour',
          item: item
        });
      }
    });
    
    // Sugerencias de servicios
    servicios.forEach(item => {
      if (item.nombre?.toLowerCase().includes(searchLower)) {
        sugerencias.push({ 
          texto: item.nombre, 
          tipo: 'Servicio',
          item: item
        });
      }
    });
    
    return sugerencias.slice(0, 8); // Máximo 8 sugerencias
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSuggestions(value.length >= 2);
  };

  const seleccionarSugerencia = (sugerencia) => {
    setSearchTerm(sugerencia.texto);
    setShowSuggestions(false);
    setShowResults(true);
    setTimeout(() => {
      document.getElementById('search-results')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const destinosEncontrados = filtrarResultados(destinos, 'destino');
  const toursEncontrados = filtrarResultados(tours, 'tour');
  const serviciosEncontrados = filtrarResultados(servicios, 'servicio');
  const totalResultados = destinosEncontrados.length + toursEncontrados.length + serviciosEncontrados.length;
  const sugerencias = obtenerSugerencias();

  const heroStyle = {
    minHeight: '100vh',
    backgroundImage: 'url(/images/ecuador-collage.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const overlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.9) 0%, rgba(59, 130, 246, 0.8) 50%, rgba(249, 115, 22, 0.7) 100%)',
    zIndex: 1
  };

  const contentStyle = {
    position: 'relative',
    zIndex: 2,
    textAlign: 'center',
    color: 'white',
    padding: '0 1rem',
    maxWidth: '64rem'
  };

  const titleStyle = {
    fontSize: '3rem',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
    lineHeight: '1.1'
  };

  const subtitleStyle = {
    fontSize: '1.25rem',
    marginBottom: '3rem',
    opacity: 0.9,
    lineHeight: '1.6'
  };

  const searchBoxStyle = {
    background: 'white',
    borderRadius: '1rem',
    padding: '0.5rem',
    maxWidth: '32rem',
    margin: '0 auto 4rem auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
  };

  const inputStyle = {
    width: '100%',
    padding: '1rem 3rem',
    border: 'none',
    borderRadius: '0.75rem',
    fontSize: '1.125rem',
    color: '#374151'
  };

  const buttonStyle = {
    background: 'linear-gradient(135deg, #10b981, #2563eb)',
    color: 'white',
    padding: '1rem 2rem',
    border: 'none',
    borderRadius: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    justifyContent: 'center'
  };

  const sectionStyle = {
    padding: '5rem 0',
    background: 'linear-gradient(to bottom, #f9fafb, white)'
  };

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem'
  };

  const sectionTitleStyle = {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '1.5rem',
    textAlign: 'center'
  };

  const sectionSubtitleStyle = {
    fontSize: '1.25rem',
    color: '#4b5563',
    maxWidth: '48rem',
    margin: '0 auto 4rem auto',
    lineHeight: '1.6',
    textAlign: 'center'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem'
  };

  const cardStyle = {
    background: 'white',
    borderRadius: '1rem',
    overflow: 'hidden',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
  };

  const cardImageStyle = {
    width: '100%',
    height: '16rem',
    objectFit: 'cover'
  };

  const cardContentStyle = {
    padding: '1.5rem'
  };

  const cardTitleStyle = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '0.75rem'
  };

  const cardDescStyle = {
    color: '#4b5563',
    marginBottom: '1rem',
    lineHeight: '1.6'
  };

  const cardButtonStyle = {
    background: 'linear-gradient(135deg, #10b981, #2563eb)',
    color: 'white',
    padding: '0.5rem 1.5rem',
    border: 'none',
    borderRadius: '9999px',
    fontWeight: '500',
    cursor: 'pointer'
  };

  const ctaStyle = {
    padding: '5rem 0',
    background: 'linear-gradient(135deg, #10b981, #2563eb, #8b5cf6)',
    color: 'white',
    textAlign: 'center'
  };

  const footerStyle = {
    background: '#1f2937',
    color: 'white',
    padding: '3rem 0',
    textAlign: 'center'
  };

  return (
    <div style={{ minHeight: '100vh', background: 'white' }}>
      <SimpleNavbar />
      
      {/* Hero Section */}
      <section style={heroStyle}>
        <div style={overlayStyle}></div>
        <div style={contentStyle}>
          <h1 style={titleStyle}>
            Descubre la<br />
            <span style={{ background: 'linear-gradient(45deg, #fbbf24, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Magia de Ecuador
            </span>
          </h1>
          
          <p style={subtitleStyle}>
            Desde las místicas Islas Galápagos hasta la vibrante selva amazónica. 
            Explora destinos únicos, vive aventuras inolvidables y descubre la diversidad 
            natural y cultural que solo Ecuador puede ofrecerte.
          </p>

          <div style={searchBoxStyle}>
            <form onSubmit={handleSearch} style={{ width: '100%' }}>
              <div style={{ position: 'relative' }}>
                <MapPin style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', width: '1.25rem', height: '1.25rem', zIndex: 1 }} />
                <input
                  type="text"
                  placeholder="¿A dónde quieres ir? (busca destinos, tours o servicios)"
                  style={inputStyle}
                  value={searchTerm}
                  onChange={handleInputChange}
                  onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
                
                {/* Dropdown de sugerencias */}
                {showSuggestions && sugerencias.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'white',
                    borderRadius: '0 0 12px 12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    zIndex: 1000,
                    marginTop: '4px'
                  }}>
                    {sugerencias.map((sugerencia, index) => (
                      <div
                        key={index}
                        onClick={() => seleccionarSugerencia(sugerencia)}
                        style={{
                          padding: '12px 16px',
                          cursor: 'pointer',
                          borderBottom: index < sugerencias.length - 1 ? '1px solid #e5e7eb' : 'none',
                          transition: 'background 0.2s',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                      >
                        <span style={{ color: '#1f2937', fontSize: '14px' }}>{sugerencia.texto}</span>
                        <span style={{ 
                          color: '#6b7280', 
                          fontSize: '12px',
                          background: '#f3f4f6',
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}>
                          {sugerencia.tipo}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button type="submit" style={buttonStyle}>
                <Search style={{ width: '1.25rem', height: '1.25rem' }} />
                Buscar
              </button>
            </form>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '2rem', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>200+</div>
              <div style={{ opacity: 0.8 }}>Destinos</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>50k+</div>
              <div style={{ opacity: 0.8 }}>Viajeros Felices</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>4.9★</div>
              <div style={{ opacity: 0.8 }}>Calificación</div>
            </div>
          </div>
        </div>
      </section>

      {/* Resultados de Búsqueda */}
      {showResults && searchTerm && (
        <section id="search-results" style={{ padding: '3rem 0', background: '#f9fafb' }}>
          <div style={containerStyle}>
            <div style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '2px solid #e5e7eb' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
                Resultados de búsqueda
              </h2>
              <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
                Mostrando resultados para: <strong>"{searchTerm}"</strong>
              </p>
              <p style={{ color: '#059669', fontWeight: '600', marginTop: '0.5rem' }}>
                {totalResultados} resultado{totalResultados !== 1 ? 's' : ''} encontrado{totalResultados !== 1 ? 's' : ''}
              </p>
            </div>

            {totalResultados === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <Search size={64} color="#d1d5db" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '1.5rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                  No se encontraron resultados
                </h3>
                <p style={{ color: '#9ca3af' }}>
                  Intenta con otros términos de búsqueda
                </p>
              </div>
            ) : (
              <>
                {/* Destinos Encontrados */}
                {destinosEncontrados.length > 0 && (
                  <div style={{ marginBottom: '3rem' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin size={24} color="#10b981" />
                      Destinos ({destinosEncontrados.length})
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                      {destinosEncontrados.map(destino => (
                        <Link 
                          key={destino._id || destino.id} 
                          to={`/destinos/${destino._id || destino.id}`}
                          style={{ textDecoration: 'none' }}
                        >
                          <div style={{
                            background: 'white',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            transition: 'transform 0.3s ease',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                          >
                            <img 
                              src={destino.imagen_url || destino.ruta || '/images/default-destino.jpg'} 
                              alt={destino.nombre}
                              style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                              onError={(e) => e.target.src = '/images/default-destino.jpg'}
                            />
                            <div style={{ padding: '1rem' }}>
                              <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
                                {destino.nombre}
                              </h4>
                              <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {destino.descripcion}
                              </p>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
                                <MapPin size={16} color="#6b7280" />
                                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                  {destino.provincia || destino.ciudad || destino.ubicacion}
                                </span>
                              </div>
                              {destino.categoria && (
                                <span style={{
                                  display: 'inline-block',
                                  marginTop: '0.75rem',
                                  padding: '0.25rem 0.75rem',
                                  borderRadius: '9999px',
                                  fontSize: '0.75rem',
                                  fontWeight: '600',
                                  background: 'linear-gradient(135deg, #10b981, #2563eb)',
                                  color: 'white'
                                }}>
                                  {destino.categoria}
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tours Encontrados */}
                {toursEncontrados.length > 0 && (
                  <div style={{ marginBottom: '3rem' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={24} color="#2563eb" />
                      Tours ({toursEncontrados.length})
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                      {toursEncontrados.map(tour => (
                        <div 
                          key={tour._id || tour.id_tour}
                          style={{
                            background: 'white',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            transition: 'transform 0.3s ease',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                          <img 
                            src={tour.imagen_url || tour.imagenUrl || '/images/galapagos.png'} 
                            alt={tour.nombre}
                            style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                            onError={(e) => e.target.src = '/images/galapagos.png'}
                          />
                          <div style={{ padding: '1rem' }}>
                            <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
                              {tour.nombre}
                            </h4>
                            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {tour.descripcion}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.75rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <Clock size={16} color="#6b7280" />
                                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{tour.duracion}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <DollarSign size={16} color="#10b981" />
                                <span style={{ fontSize: '0.875rem', color: '#10b981', fontWeight: '600' }}>
                                  ${tour.precio}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Servicios Encontrados */}
                {serviciosEncontrados.length > 0 && (
                  <div style={{ marginBottom: '3rem' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Package size={24} color="#8b5cf6" />
                      Servicios ({serviciosEncontrados.length})
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                      {serviciosEncontrados.map(servicio => (
                        <div 
                          key={servicio.id_servicio}
                          style={{
                            background: 'white',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            transition: 'transform 0.3s ease',
                            cursor: 'pointer',
                            padding: '1rem'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                          <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
                            {servicio.nombre}
                          </h4>
                          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {servicio.descripcion}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.75rem' }}>
                            {servicio.ubicacion && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <MapPin size={16} color="#6b7280" />
                                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{servicio.ubicacion}</span>
                              </div>
                            )}
                            {servicio.precio_base && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <DollarSign size={16} color="#10b981" />
                                <span style={{ fontSize: '0.875rem', color: '#10b981', fontWeight: '600' }}>
                                  ${servicio.precio_base}
                                </span>
                              </div>
                            )}
                          </div>
                          {servicio.categoria && (
                            <span style={{
                              display: 'inline-block',
                              marginTop: '0.75rem',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              background: 'linear-gradient(135deg, #8b5cf6, #2563eb)',
                              color: 'white'
                            }}>
                              {servicio.categoria}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      )}

      {/* Destinos Section - Componente Dinámico */}
      {!showResults && <DestinosDestacados />}

      {/* CTA Section */}
      <section style={ctaStyle}>
        <div style={containerStyle}>
          <h2 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
            Tu Aventura Perfecta Te Espera
          </h2>
          <p style={{ fontSize: '1.25rem', marginBottom: '3rem', opacity: 0.9, maxWidth: '48rem', margin: '0 auto 3rem auto' }}>
            No esperes más para vivir experiencias inolvidables. Ecuador te está llamando 
            con sus paisajes únicos, su cultura vibrante y sus aventuras sin límites.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
            <Link to="/destinos" style={{ textDecoration: 'none' }}>
              <button style={{
                background: 'white',
                color: '#1f2937',
                padding: '1rem 2rem',
                border: 'none',
                borderRadius: '9999px',
                fontWeight: 'bold',
                fontSize: '1.125rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                Explorar Destinos
                <ArrowRight style={{ width: '1.25rem', height: '1.25rem' }} />
              </button>
            </Link>
            <Link to="/tours" style={{ textDecoration: 'none' }}>
              <button style={{
                background: 'linear-gradient(135deg, #fbbf24, #f97316)',
                color: 'white',
                padding: '1rem 2rem',
                border: 'none',
                borderRadius: '9999px',
                fontWeight: 'bold',
                fontSize: '1.125rem',
                cursor: 'pointer'
              }}>
                Reservar Ahora
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={footerStyle}>
        <div style={containerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <MapPin style={{ width: '2rem', height: '2rem', color: '#10b981' }} />
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Explora Ecuador</span>
          </div>
          <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>
            Tu puerta de entrada a las maravillas del Ecuador
          </p>
          
          {/* Enlace de administrador */}
          <div style={{ marginBottom: '2rem' }}>
            <Link 
              to="/admin/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: '#6b7280',
                textDecoration: 'none',
                fontSize: '0.875rem',
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid rgba(107, 114, 128, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = '#374151';
                e.target.style.borderColor = '#374151';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = '#6b7280';
                e.target.style.borderColor = 'rgba(107, 114, 128, 0.3)';
              }}
            >
              <Shield size={16} />
              Acceso Administrador
            </Link>
          </div>
          
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            © 2025 Explora Ecuador. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default SimpleLandingPage;
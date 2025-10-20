import React from 'react';
import { Link } from 'react-router-dom';
import SimpleNavbar from '../components/SimpleNavbar';
import { Search, MapPin, Calendar, ArrowRight, Star, Shield } from 'lucide-react';

const SimpleLandingPage = () => {
  const heroStyle = {
    minHeight: '100vh',
    backgroundImage: 'url(https://images.unsplash.com/photo-1508672019048-805c876b67e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1993&q=80)',
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

  const destinos = [
    {
      nombre: 'Galápagos',
      descripcion: 'Islas únicas con fauna endémica y paisajes volcánicos únicos en el mundo.',
      imagen: '/images/galapagos.png'
    },
    {
      nombre: 'Quito',
      descripcion: 'Centro histórico colonial declarado Patrimonio de la Humanidad por la UNESCO.',
      imagen: '/images/quito.png'
    },
    {
      nombre: 'Baños',
      descripcion: 'Aventura extrema entre cascadas, aguas termales y deportes de adrenalina.',
      imagen: '/images/baños.png'
    },
    {
      nombre: 'Montañita',
      descripcion: 'Paraíso surfero con playas doradas, vida nocturna vibrante y ambiente bohemio.',
      imagen: '/images/montañita.png'
    },
    {
      nombre: 'Cuenca',
      descripcion: 'Ciudad colonial con arquitectura impresionante y tradiciones artesanales únicas.',
      imagen: '/images/cuenca.png'
    },
    {
      nombre: 'Amazonía',
      descripcion: 'Selva tropical con increíble biodiversidad y comunidades indígenas ancestrales.',
      imagen: '/images/amazonia.png'
    }
  ];

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
            <div style={{ position: 'relative' }}>
              <MapPin style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', width: '1.25rem', height: '1.25rem' }} />
              <input
                type="text"
                placeholder="¿A dónde quieres ir?"
                style={inputStyle}
              />
            </div>
            <button style={buttonStyle}>
              <Search style={{ width: '1.25rem', height: '1.25rem' }} />
              Buscar
            </button>
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

      {/* Destinos Section */}
      <section style={sectionStyle}>
        <div style={containerStyle}>
          <h2 style={sectionTitleStyle}>
            Destinos <span style={{ background: 'linear-gradient(45deg, #10b981, #2563eb)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Destacados</span>
          </h2>
          <p style={sectionSubtitleStyle}>
            Descubre los lugares más espectaculares del Ecuador. Cada destino ofrece experiencias únicas 
            que te conectarán con la naturaleza, la cultura y la aventura.
          </p>

          <div style={gridStyle}>
            {destinos.map((destino, index) => (
              <div 
                key={index} 
                style={cardStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                }}
              >
                <img 
                  src={destino.imagen} 
                  alt={destino.nombre} 
                  style={cardImageStyle}
                  onError={(e) => {
                    // Fallback a una imagen de Unsplash si la local no carga
                    const fallbackImages = {
                      'Galápagos': 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                      'Quito': 'https://images.unsplash.com/photo-1561751499-34fa82092033?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                      'Baños': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                      'Montañita': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                      'Cuenca': 'https://images.unsplash.com/photo-1571123575409-95c61f8d41e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                      'Amazonía': 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
                    };
                    e.target.src = fallbackImages[destino.nombre] || 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
                  }}
                />
                <div style={cardContentStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h3 style={cardTitleStyle}>{destino.nombre}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', color: '#eab308' }}>
                      <Star style={{ width: '1rem', height: '1rem', fill: 'currentColor' }} />
                      <span style={{ marginLeft: '0.25rem', fontSize: '0.875rem', color: '#4b5563' }}>4.8</span>
                    </div>
                  </div>
                  <p style={cardDescStyle}>{destino.descripcion}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', color: '#6b7280', fontSize: '0.875rem' }}>
                      <MapPin style={{ width: '1rem', height: '1rem', marginRight: '0.25rem' }} />
                      Ecuador
                    </div>
                    <button style={cardButtonStyle}>Explorar</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
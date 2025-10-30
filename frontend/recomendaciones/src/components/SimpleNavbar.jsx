import { useState, useEffect, useRef } from 'react';
import { Menu, X, MapPin, User, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SimpleNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const userMenuRef = useRef(null);

  // Cerrar menú de usuario al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const navStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(229, 231, 235, 0.2)',
    padding: '1rem 2rem'
  };

  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: '1200px',
    margin: '0 auto'
  };

  const logoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#059669',
    textDecoration: 'none'
  };

  const navLinksStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem'
  };

  const linkStyle = {
    color: '#374151',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'color 0.3s ease'
  };

  const buttonStyle = {
    background: 'linear-gradient(135deg, #10b981, #2563eb)',
    color: 'white',
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '9999px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textDecoration: 'none',
    display: 'inline-block'
  };

  const registerButtonStyle = {
    background: 'transparent',
    color: '#059669',
    padding: '0.75rem 1.5rem',
    border: '2px solid #059669',
    borderRadius: '9999px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textDecoration: 'none',
    display: 'inline-block',
    marginRight: '1rem'
  };

  const mobileMenuStyle = {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    background: 'white',
    boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
    padding: '1rem',
    borderTop: '1px solid #e5e7eb'
  };

  const mobileButtonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    marginLeft: '1rem'
  };

  const userMenuStyle = {
    position: 'relative'
  };

  const userButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(5, 150, 105, 0.1)',
    border: '1px solid #059669',
    borderRadius: '9999px',
    padding: '0.5rem 1rem',
    color: '#059669',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  };

  const userDropdownStyle = {
    position: 'absolute',
    top: '100%',
    right: 0,
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
    padding: '0.5rem',
    minWidth: '200px',
    zIndex: 100
  };

  const userDropdownItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    color: '#374151',
    textDecoration: 'none',
    borderRadius: '0.375rem',
    transition: 'background-color 0.3s ease',
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    width: '100%',
    textAlign: 'left'
  };

  return (
    <>
      <nav style={navStyle}>
        <div style={containerStyle}>
          {/* Logo */}
          <Link to="/" style={logoStyle}>
            <MapPin size={28} />
            <span>Explora Ecuador</span>
          </Link>

          {/* Desktop Navigation */}
          <div style={navLinksStyle} className="desktop-nav">
            <Link to="/" style={linkStyle}>Inicio</Link>
            <Link to="/destinos" style={linkStyle}>Destinos</Link>
            <Link to="/tours" style={linkStyle}>Tours</Link>
            <Link to="/servicios" style={linkStyle}>Servicios</Link>
          </div>

          {/* Auth Buttons */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {isAuthenticated ? (
              <div className="desktop-auth" style={{ display: 'flex', alignItems: 'center' }}>
                <div style={userMenuStyle} ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    style={userButtonStyle}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(5, 150, 105, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(5, 150, 105, 0.1)';
                    }}
                  >
                    <User size={20} />
                    <span>{user?.firstName || 'Usuario'}</span>
                  </button>
                  
                  {isUserMenuOpen && (
                    <div style={userDropdownStyle}>
                      <Link
                        to="/profile"
                        style={userDropdownItemStyle}
                        onClick={() => setIsUserMenuOpen(false)}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        <User size={16} />
                        Mi Perfil
                      </Link>
                      <Link
                        to="/mis-reservas"
                        style={userDropdownItemStyle}
                        onClick={() => setIsUserMenuOpen(false)}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        Mis Reservas
                      </Link>
                      <Link
                        to="/mis-contrataciones"
                        style={userDropdownItemStyle}
                        onClick={() => setIsUserMenuOpen(false)}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        Mis Contrataciones
                      </Link>
                      <Link
                        to="/mis-recomendaciones"
                        style={userDropdownItemStyle}
                        onClick={() => setIsUserMenuOpen(false)}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        Mis Recomendaciones
                      </Link>
                      <hr style={{ margin: '0.5rem 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        style={userDropdownItemStyle}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#fef2f2'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        <LogOut size={16} />
                        Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="desktop-auth" style={{ display: 'flex', alignItems: 'center' }}>
                <Link
                  to="/register"
                  style={registerButtonStyle}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#059669';
                    e.target.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.color = '#059669';
                  }}
                >
                  Registrarse
                </Link>
                <Link
                  to="/login"
                  style={buttonStyle}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 10px 25px -3px rgba(0, 0, 0, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  Iniciar Sesión
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={mobileButtonStyle}
              className="mobile-menu-btn"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div style={mobileMenuStyle}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Link to="/" style={linkStyle} onClick={() => setIsMenuOpen(false)}>Inicio</Link>
              <Link to="/destinos" style={linkStyle} onClick={() => setIsMenuOpen(false)}>Destinos</Link>
              <Link to="/tours" style={linkStyle} onClick={() => setIsMenuOpen(false)}>Tours</Link>
              <Link to="/servicios" style={linkStyle} onClick={() => setIsMenuOpen(false)}>Servicios</Link>
              
              {isAuthenticated ? (
                <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#059669' }}>
                    <User size={20} />
                    <span style={{ fontWeight: '600' }}>Hola, {user?.firstName}!</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <Link
                      to="/profile"
                      style={{...userDropdownItemStyle, justifyContent: 'flex-start'}}
                      onClick={() => setIsMenuOpen(false)}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <User size={16} />
                      Mi Perfil
                    </Link>
                    <Link
                      to="/mis-reservas"
                      style={{...userDropdownItemStyle, justifyContent: 'flex-start'}}
                      onClick={() => setIsMenuOpen(false)}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      Mis Reservas
                    </Link>
                    <Link
                      to="/mis-contrataciones"
                      style={{...userDropdownItemStyle, justifyContent: 'flex-start'}}
                      onClick={() => setIsMenuOpen(false)}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      Mis Contrataciones
                    </Link>
                    <Link
                      to="/mis-recomendaciones"
                      style={{...userDropdownItemStyle, justifyContent: 'flex-start'}}
                      onClick={() => setIsMenuOpen(false)}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      Mis Recomendaciones
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      style={{...userDropdownItemStyle, justifyContent: 'flex-start', color: '#dc2626'}}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#fef2f2'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <LogOut size={16} />
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                  <Link to="/register" style={{...registerButtonStyle, marginRight: '0'}} onClick={() => setIsMenuOpen(false)}>
                    Registrarse
                  </Link>
                  <Link to="/login" style={buttonStyle} onClick={() => setIsMenuOpen(false)}>
                    Iniciar Sesión
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* CSS para responsive */}
      <style jsx="true">{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .desktop-auth {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-menu-btn {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default SimpleNavbar;
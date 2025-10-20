import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, MapPin, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../components/AuthStyles.css';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const { login, isLoading, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Limpiar errores cuando el usuario escribe
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [formData.username, formData.password]);

  const validateForm = () => {
    const errors = {};

    if (!formData.username.trim()) {
      errors.username = 'El username/email es requerido';
    }

    if (!formData.password) {
      errors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Limpiar error específico del campo cuando el usuario escribe
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);

    if (!validateForm()) {
      return;
    }

    const result = await login({
      username: formData.username,
      password: formData.password
    });

    if (result.success) {
      // El AuthContext ya maneja la redirección
      console.log('Login exitoso');
    }
  };

  const pageStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #065f46 0%, #047857 30%, #059669 70%, #10b981 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    fontFamily: 'Inter, system-ui, sans-serif'
  };

  const containerStyle = {
    display: 'flex',
    background: 'white',
    borderRadius: '2rem',
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    maxWidth: '900px',
    width: '100%',
    minHeight: '600px'
  };

  const leftPanelStyle = {
    flex: 1,
    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem'
  };

  const rightPanelStyle = {
    flex: 1,
    background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
    padding: '3rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    color: 'white'
  };

  const logoStyle = {
    position: 'absolute',
    top: '2rem',
    left: '2rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#047857',
    fontSize: '1.2rem',
    fontWeight: 'bold'
  };

  const illustrationStyle = {
    maxWidth: '100%',
    height: 'auto'
  };

  const formStyle = {
    width: '100%',
    maxWidth: '320px'
  };

  const titleStyle = {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    color: 'white'
  };

  const subtitleStyle = {
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: '2rem',
    fontSize: '1rem'
  };

  const inputGroupStyle = {
    marginBottom: '1.5rem'
  };

  const labelStyle = {
    display: 'block',
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '0.9rem',
    marginBottom: '0.5rem',
    fontWeight: '500'
  };

  const inputStyle = {
    width: '100%',
    padding: '0.875rem 1rem',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '0.75rem',
    color: 'white',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)'
  };

  const inputFocusStyle = {
    outline: 'none',
    borderColor: 'rgba(255, 255, 255, 0.4)',
    backgroundColor: 'rgba(255, 255, 255, 0.15)'
  };

  const passwordContainerStyle = {
    position: 'relative'
  };

  const eyeButtonStyle = {
    position: 'absolute',
    right: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.7)',
    cursor: 'pointer',
    padding: '0.25rem'
  };

  const forgotPasswordStyle = {
    textAlign: 'right',
    marginTop: '0.5rem'
  };

  const forgotLinkStyle = {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '0.875rem',
    textDecoration: 'none',
    transition: 'color 0.3s ease'
  };

  const buttonStyle = {
    width: '100%',
    padding: '1rem',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '0.75rem',
    color: 'white',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginBottom: '1.5rem',
    backdropFilter: 'blur(10px)'
  };

  const buttonHoverStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderColor: 'rgba(255, 255, 255, 0.4)'
  };

  const registerLinkStyle = {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '0.9rem'
  };

  const linkStyle = {
    color: 'white',
    textDecoration: 'underline',
    fontWeight: '500'
  };

  const footerStyle = {
    position: 'absolute',
    bottom: '1rem',
    left: '2rem',
    right: '2rem',
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
    color: '#6b7280'
  };

  // Estilos para errores y validación
  const inputErrorStyle = {
    ...inputStyle,
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)'
  };

  const errorMessageStyle = {
    color: '#fca5a5',
    fontSize: '0.8rem',
    marginTop: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem'
  };

  const generalErrorStyle = {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '0.5rem',
    padding: '0.75rem',
    marginBottom: '1rem',
    color: '#fca5a5',
    fontSize: '0.875rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  };

  const loadingButtonStyle = {
    ...buttonStyle,
    opacity: 0.7,
    cursor: 'not-allowed'
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        {/* Panel Izquierdo - Ilustración */}
        <div style={leftPanelStyle}>
          {/* Logo */}
          <div style={logoStyle}>
            <MapPin size={24} />
            <span>EXPLORA ECUADOR</span>
          </div>

          {/* Ilustración personalizada */}
          <div style={{ textAlign: 'center', maxWidth: '400px' }}>
            <svg width="300" height="300" viewBox="0 0 300 300" style={illustrationStyle}>
              {/* Fondo orgánico */}
              <defs>
                <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a7f3d0" />
                  <stop offset="100%" stopColor="#6ee7b7" />
                </linearGradient>
              </defs>
              
              {/* Forma orgánica de fondo */}
              <path d="M50 150 Q150 50 250 150 Q200 250 100 200 Q50 180 50 150" fill="url(#bgGradient)" opacity="0.7"/>
              
              {/* Árboles */}
              <circle cx="150" cy="120" r="40" fill="#059669" />
              <rect x="145" y="140" width="10" height="30" fill="#92400e" />
              
              {/* Montañas */}
              <polygon points="50,180 100,120 150,180" fill="#047857" opacity="0.8" />
              <polygon points="120,180 170,130 220,180" fill="#065f46" opacity="0.9" />
              
              {/* Elementos decorativos */}
              <circle cx="80" cy="100" r="3" fill="#fbbf24" />
              <circle cx="220" cy="110" r="4" fill="#f97316" />
              <circle cx="200" cy="80" r="2" fill="#ef4444" />
              
              {/* Personajes pequeños */}
              <circle cx="100" cy="170" r="8" fill="#3b82f6" />
              <circle cx="200" cy="170" r="8" fill="#8b5cf6" />
            </svg>
          </div>

          {/* Footer */}
          <div style={footerStyle}>
            <span>© 2025 Explora Ecuador</span>
            <span>Powered by Adventure</span>
          </div>
        </div>

        {/* Panel Derecho - Formulario */}
        <div style={rightPanelStyle}>
          <div style={formStyle}>
            <h1 style={titleStyle}>Login</h1>
            <p style={subtitleStyle}>Bienvenido de vuelta, aventurero</p>

            <form onSubmit={handleSubmit}>
              {/* Error general */}
              {error && (
                <div style={generalErrorStyle}>
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <div style={inputGroupStyle}>
                <label style={labelStyle}>Username o Email</label>
                <input
                  type="text"
                  name="username"
                  placeholder="Ingresa tu username o email"
                  value={formData.username}
                  onChange={handleInputChange}
                  style={validationErrors.username ? inputErrorStyle : inputStyle}
                  onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                  onBlur={(e) => Object.assign(e.target.style, validationErrors.username ? inputErrorStyle : inputStyle)}
                  disabled={isLoading}
                />
                {validationErrors.username && (
                  <div style={errorMessageStyle}>
                    <AlertCircle size={14} />
                    {validationErrors.username}
                  </div>
                )}
              </div>

              <div style={inputGroupStyle}>
                <label style={labelStyle}>Password</label>
                <div style={passwordContainerStyle}>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Ingresa tu contraseña"
                    value={formData.password}
                    onChange={handleInputChange}
                    style={validationErrors.password ? inputErrorStyle : inputStyle}
                    onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                    onBlur={(e) => Object.assign(e.target.style, validationErrors.password ? inputErrorStyle : inputStyle)}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    style={eyeButtonStyle}
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {validationErrors.password && (
                  <div style={errorMessageStyle}>
                    <AlertCircle size={14} />
                    {validationErrors.password}
                  </div>
                )}
                <div style={forgotPasswordStyle}>
                  <Link to="/forgot-password" style={forgotLinkStyle}>
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                style={isLoading ? loadingButtonStyle : buttonStyle}
                onMouseEnter={(e) => !isLoading && Object.assign(e.target.style, buttonHoverStyle)}
                onMouseLeave={(e) => !isLoading && Object.assign(e.target.style, buttonStyle)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                    <Loader size={20} className="animate-spin" />
                    Iniciando sesión...
                  </div>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </form>

            <div style={registerLinkStyle}>
              Don't have an account?{' '}
              <Link to="/register" style={linkStyle}>
                Register Now
              </Link>
            </div>

            <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)' }}>
              <Link to="/terms" style={{ color: 'rgba(255, 255, 255, 0.6)', textDecoration: 'none', marginRight: '1rem' }}>
                Terms and Services
              </Link>
              <span>Have a problem? Contact us at info@exploraecuador.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
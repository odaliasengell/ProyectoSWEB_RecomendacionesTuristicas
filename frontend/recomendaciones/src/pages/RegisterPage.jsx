import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, MapPin, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../components/AuthStyles.css';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
    acceptTerms: false
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const { register, isLoading, error, clearError, isAuthenticated } = useAuth();
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
  }, [formData]);

  const validateForm = () => {
    const errors = {};

    // Validar nombres
    if (!formData.firstName.trim()) {
      errors.firstName = 'El nombre es requerido';
    } else if (formData.firstName.length < 2) {
      errors.firstName = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'El apellido es requerido';
    } else if (formData.lastName.length < 2) {
      errors.lastName = 'El apellido debe tener al menos 2 caracteres';
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Ingresa un email válido';
    }

    // Validar username
    if (!formData.username.trim()) {
      errors.username = 'El username es requerido';
    } else if (formData.username.length < 3) {
      errors.username = 'El username debe tener al menos 3 caracteres';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = 'El username solo puede contener letras, números y guiones bajos';
    }

    // Validar contraseña
    if (!formData.password) {
      errors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'La contraseña debe contener al menos una mayúscula, una minúscula y un número';
    }

    // Validar confirmación de contraseña
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    // Validar fecha de nacimiento
    if (!formData.birthDate) {
      errors.birthDate = 'La fecha de nacimiento es requerida';
    } else {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 13) {
        errors.birthDate = 'Debes tener al menos 13 años';
      }
    }

    // Validar términos
    if (!formData.acceptTerms) {
      errors.acceptTerms = 'Debes aceptar los términos y condiciones';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData({
      ...formData,
      [name]: newValue
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

    const result = await register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      username: formData.username,
      password: formData.password,
      birthDate: formData.birthDate
    });

    if (result.success) {
      console.log('Registro exitoso');
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
    maxWidth: '1000px',
    width: '100%',
    minHeight: '700px'
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
    flex: 1.2,
    background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
    padding: '3rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    color: 'white',
    overflowY: 'auto'
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
    maxWidth: '380px'
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
    marginBottom: '1.2rem'
  };

  const inputRowStyle = {
    display: 'flex',
    gap: '0.75rem'
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

  const checkboxContainerStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
    marginBottom: '1.5rem'
  };

  const checkboxStyle = {
    width: '18px',
    height: '18px',
    marginTop: '2px'
  };

  const checkboxLabelStyle = {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '0.875rem',
    lineHeight: '1.4'
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

  const loginLinkStyle = {
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
            <svg width="300" height="350" viewBox="0 0 300 350" style={illustrationStyle}>
              {/* Fondo orgánico */}
              <defs>
                <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a7f3d0" />
                  <stop offset="100%" stopColor="#6ee7b7" />
                </linearGradient>
              </defs>
              
              {/* Forma orgánica de fondo más grande */}
              <path d="M40 180 Q150 60 260 180 Q220 280 120 250 Q40 220 40 180" fill="url(#bgGradient)" opacity="0.7"/>
              
              {/* Múltiples árboles */}
              <circle cx="120" cy="140" r="35" fill="#059669" />
              <rect x="116" y="160" width="8" height="25" fill="#92400e" />
              
              <circle cx="180" cy="130" r="30" fill="#047857" />
              <rect x="177" y="145" width="6" height="20" fill="#92400e" />
              
              <circle cx="90" cy="160" r="25" fill="#10b981" />
              <rect x="88" y="175" width="4" height="15" fill="#92400e" />
              
              {/* Montañas variadas */}
              <polygon points="40,200 80,140 120,200" fill="#047857" opacity="0.8" />
              <polygon points="100,200 150,150 200,200" fill="#065f46" opacity="0.9" />
              <polygon points="180,200 220,160 260,200" fill="#064e3b" opacity="0.7" />
              
              {/* Elementos decorativos */}
              <circle cx="70" cy="120" r="3" fill="#fbbf24" />
              <circle cx="230" cy="130" r="4" fill="#f97316" />
              <circle cx="210" cy="100" r="2" fill="#ef4444" />
              <circle cx="110" cy="110" r="3" fill="#8b5cf6" />
              <circle cx="190" cy="115" r="2" fill="#06b6d4" />
              
              {/* Grupo de aventureros */}
              <circle cx="80" cy="190" r="8" fill="#3b82f6" />
              <circle cx="150" cy="190" r="8" fill="#8b5cf6" />
              <circle cx="220" cy="190" r="8" fill="#f59e0b" />
              <circle cx="115" cy="200" r="6" fill="#ef4444" />
              
              {/* Sendero */}
              <path d="M20 220 Q150 210 280 220" stroke="#d1fae5" strokeWidth="3" fill="none" opacity="0.6"/>
            </svg>
          </div>

          {/* Footer */}
          <div style={footerStyle}>
            <span>© 2025 Explora Ecuador</span>
            <span>Start your adventure</span>
          </div>
        </div>

        {/* Panel Derecho - Formulario */}
        <div style={rightPanelStyle}>
          <div style={formStyle}>
            <h1 style={titleStyle}>Register</h1>
            <p style={subtitleStyle}>Únete a la aventura ecuatoriana</p>

            <form onSubmit={handleSubmit}>
              {/* Error general */}
              {error && (
                <div style={generalErrorStyle}>
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              {/* Nombres */}
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Nombre Completo</label>
                <div style={inputRowStyle}>
                  <div style={{ flex: 1 }}>
                    <input
                      type="text"
                      name="firstName"
                      placeholder="Nombre"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      style={validationErrors.firstName ? inputErrorStyle : inputStyle}
                      onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                      onBlur={(e) => Object.assign(e.target.style, validationErrors.firstName ? inputErrorStyle : inputStyle)}
                      disabled={isLoading}
                    />
                    {validationErrors.firstName && (
                      <div style={errorMessageStyle}>
                        <AlertCircle size={14} />
                        {validationErrors.firstName}
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Apellido"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      style={validationErrors.lastName ? inputErrorStyle : inputStyle}
                      onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                      onBlur={(e) => Object.assign(e.target.style, validationErrors.lastName ? inputErrorStyle : inputStyle)}
                      disabled={isLoading}
                    />
                    {validationErrors.lastName && (
                      <div style={errorMessageStyle}>
                        <AlertCircle size={14} />
                        {validationErrors.lastName}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Email */}
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={validationErrors.email ? inputErrorStyle : inputStyle}
                  onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                  onBlur={(e) => Object.assign(e.target.style, validationErrors.email ? inputErrorStyle : inputStyle)}
                  disabled={isLoading}
                />
                {validationErrors.email && (
                  <div style={errorMessageStyle}>
                    <AlertCircle size={14} />
                    {validationErrors.email}
                  </div>
                )}
              </div>

              {/* Username y Fecha */}
              <div style={inputGroupStyle}>
                <div style={inputRowStyle}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Username</label>
                    <input
                      type="text"
                      name="username"
                      placeholder="usuario123"
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
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Fecha de Nacimiento</label>
                    <input
                      type="date"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleInputChange}
                      style={validationErrors.birthDate ? inputErrorStyle : inputStyle}
                      onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                      onBlur={(e) => Object.assign(e.target.style, validationErrors.birthDate ? inputErrorStyle : inputStyle)}
                      disabled={isLoading}
                    />
                    {validationErrors.birthDate && (
                      <div style={errorMessageStyle}>
                        <AlertCircle size={14} />
                        {validationErrors.birthDate}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Password */}
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Password</label>
                <div style={passwordContainerStyle}>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Mínimo 8 caracteres con mayúscula, minúscula y número"
                    value={formData.password}
                    onChange={handleInputChange}
                    style={validationErrors.password ? inputErrorStyle : inputStyle}
                    onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                    onBlur={(e) => Object.assign(e.target.style, validationErrors.password ? inputErrorStyle : inputStyle)}
                    disabled={isLoading}
                    minLength="8"
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
              </div>

              {/* Confirm Password */}
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Confirmar Password</label>
                <div style={passwordContainerStyle}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirma tu password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    style={validationErrors.confirmPassword ? inputErrorStyle : inputStyle}
                    onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                    onBlur={(e) => Object.assign(e.target.style, validationErrors.confirmPassword ? inputErrorStyle : inputStyle)}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    style={eyeButtonStyle}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {validationErrors.confirmPassword && (
                  <div style={errorMessageStyle}>
                    <AlertCircle size={14} />
                    {validationErrors.confirmPassword}
                  </div>
                )}
              </div>

              {/* Términos y condiciones */}
              <div style={checkboxContainerStyle}>
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleInputChange}
                  style={checkboxStyle}
                  disabled={isLoading}
                />
                <label style={checkboxLabelStyle}>
                  Acepto los{' '}
                  <Link to="/terms" style={linkStyle}>términos y condiciones</Link>
                  {' '}y la{' '}
                  <Link to="/privacy" style={linkStyle}>política de privacidad</Link>
                  . Quiero recibir notificaciones sobre nuevos destinos y ofertas especiales.
                </label>
              </div>
              {validationErrors.acceptTerms && (
                <div style={errorMessageStyle}>
                  <AlertCircle size={14} />
                  {validationErrors.acceptTerms}
                </div>
              )}

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
                    Creando cuenta...
                  </div>
                ) : (
                  'Crear Cuenta'
                )}
              </button>
            </form>

            <div style={loginLinkStyle}>
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" style={linkStyle}>
                Iniciar Sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
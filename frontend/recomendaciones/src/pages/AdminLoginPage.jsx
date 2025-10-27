import React, { useState } from 'react';
import { Eye, EyeOff, Shield, Lock, User, AlertCircle, Loader } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

// URL del backend Python
const API_URL = 'http://localhost:8000';

const AdminLoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      setError('Todos los campos son requeridos');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/admin/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          contraseña: formData.password
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Guardar token y datos del admin
        localStorage.setItem('adminToken', data.access_token);
        localStorage.setItem('adminData', JSON.stringify(data.admin));
        
        // Redirigir al panel de administrador
        navigate('/admin/dashboard');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Credenciales incorrectas');
      }
    } catch (error) {
      console.error('Error de login admin:', error);
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const adminLoginStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #06b6d4 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
  };

  const containerStyle = {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '40px',
    width: '100%',
    maxWidth: '450px',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '40px'
  };

  const iconContainerStyle = {
    width: '80px',
    height: '80px',
    backgroundColor: '#1e3a8a',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    boxShadow: '0 10px 30px rgba(30, 58, 138, 0.3)'
  };

  const titleStyle = {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e3a8a',
    marginBottom: '8px'
  };

  const subtitleStyle = {
    fontSize: '16px',
    color: '#64748b',
    fontWeight: '500'
  };

  const inputGroupStyle = {
    position: 'relative',
    marginBottom: '25px'
  };

  const inputStyle = {
    width: '100%',
    padding: '16px 50px 16px 50px',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '16px',
    transition: 'all 0.3s ease',
    backgroundColor: '#f8fafc',
    boxSizing: 'border-box'
  };

  const inputFocusStyle = {
    borderColor: '#1e3a8a',
    backgroundColor: '#ffffff',
    outline: 'none',
    boxShadow: '0 0 0 4px rgba(30, 58, 138, 0.1)'
  };

  const iconLeftStyle = {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#64748b',
    zIndex: 1
  };

  const iconRightStyle = {
    position: 'absolute',
    right: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#64748b',
    cursor: 'pointer',
    zIndex: 1
  };

  const buttonStyle = {
    width: '100%',
    padding: '16px',
    backgroundColor: '#1e3a8a',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '20px'
  };

  const buttonHoverStyle = {
    backgroundColor: '#1e40af',
    transform: 'translateY(-2px)',
    boxShadow: '0 10px 25px rgba(30, 58, 138, 0.3)'
  };

  const errorStyle = {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#dc2626',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px'
  };

  const linkStyle = {
    textAlign: 'center',
    marginTop: '30px',
    paddingTop: '20px',
    borderTop: '1px solid #e2e8f0'
  };

  const linkTextStyle = {
    color: '#64748b',
    textDecoration: 'none',
    fontSize: '14px',
    transition: 'color 0.3s ease'
  };

  return (
    <div style={adminLoginStyle}>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <div style={iconContainerStyle}>
            <Shield size={40} color="white" />
          </div>
          <h1 style={titleStyle}>Panel de Administrador</h1>
          <p style={subtitleStyle}>Acceso restringido - Solo administradores</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={errorStyle}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div style={inputGroupStyle}>
            <User style={iconLeftStyle} size={20} />
            <input
              type="text"
              name="username"
              placeholder="Usuario administrador"
              value={formData.username}
              onChange={handleChange}
              style={inputStyle}
              onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
              onBlur={(e) => Object.assign(e.target.style, inputStyle)}
              disabled={isLoading}
            />
          </div>

          <div style={inputGroupStyle}>
            <Lock style={iconLeftStyle} size={20} />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Contraseña"
              value={formData.password}
              onChange={handleChange}
              style={inputStyle}
              onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
              onBlur={(e) => Object.assign(e.target.style, inputStyle)}
              disabled={isLoading}
            />
            <div
              style={iconRightStyle}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </div>
          </div>

          <button
            type="submit"
            style={buttonStyle}
            onMouseEnter={(e) => Object.assign(e.target.style, buttonHoverStyle)}
            onMouseLeave={(e) => Object.assign(e.target.style, buttonStyle)}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader size={20} className="animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <Shield size={20} />
                Acceder al Panel
              </>
            )}
          </button>
        </form>

        <div style={linkStyle}>
          <Link to="/" style={linkTextStyle}>
            ← Volver al sitio principal
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
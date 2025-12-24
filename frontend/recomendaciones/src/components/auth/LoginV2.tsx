import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, LoginData } from '../../services/api/auth.service';
import { useAppContext } from '../../contexts/AppContext';
import './LoginV2.css';

const LoginV2: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<LoginData>({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { setUser } = useAppContext();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      const resp = await login(form);
      setSuccess(true);
      
      if (resp?.user && resp?.access_token) {
        const userData = { 
          id: resp.user.id, 
          name: resp.user.nombre,
          email: resp.user.email 
        };
        
        setUser(userData);
        
        // Guardar tokens (preparación para refresh token)
        localStorage.setItem('access_token', resp.access_token);
        localStorage.setItem('userData', JSON.stringify(resp.user));
        
        // Opcional: Remember me functionality
        if (rememberMe) {
          localStorage.setItem('remember_user', resp.user.email);
        }
        
        console.log('🔐 Login exitoso, tokens guardados');
        setTimeout(() => navigate('/dashboard'), 800);
      }
    } catch (err: any) {
      let errorMessage = 'Error al iniciar sesión';
      
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (Array.isArray(detail)) {
          errorMessage = detail.map((e: any) => 
            typeof e === 'string' ? e : e.msg || 'Error de validación'
          ).join('; ');
        } else if (typeof detail === 'string') {
          errorMessage = detail;
        }
      } else if (err.response?.status === 401) {
        errorMessage = 'Credenciales incorrectas. Verifica tu email y contraseña.';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Error del servidor. Inténtalo más tarde.';
      }
      
      setError(errorMessage);
      console.error('❌ Error en login:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-v2-container">
      {/* Left Panel - Login Form */}
      <div className="login-v2-form-panel">
        <div className="login-v2-form-content">
          <div className="login-v2-header">
            <h1 className="login-v2-title">Bienvenido de vuelta</h1>
            <p className="login-v2-subtitle">
              Accede a tu cuenta de Sistema de Recomendaciones Turísticas
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-v2-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                value={form.email}
                onChange={handleChange}
                className="form-input"
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                className="form-input"
                required
                autoComplete="current-password"
              />
            </div>

            <div className="form-options">
              <label className="checkbox-wrapper">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="checkmark"></span>
                Recordar sesión
              </label>
              
              <Link to="/forgot-password" className="forgot-link">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button 
              type="submit" 
              className={`login-btn ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <span className="loading-content">
                  <span className="spinner"></span>
                  Ingresando...
                </span>
              ) : (
                'Iniciar Sesión'
              )}
            </button>

            {/* Status Messages */}
            {error && (
              <div className="status-message error">
                <span className="status-icon">⚠️</span>
                {error}
              </div>
            )}
            
            {success && (
              <div className="status-message success">
                <span className="status-icon">✅</span>
                ¡Bienvenido! Redirigiendo...
              </div>
            )}

            <div className="signup-prompt">
              <p>¿No tienes cuenta? 
                <Link to="/register/user" className="signup-link">
                  Crear cuenta
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Right Panel - Info & Features Preview */}
      <div className="login-v2-info-panel">
        <div className="login-v2-info-content">
          <div className="info-header">
            <h2>Sistema de Turismo v2.0</h2>
            <p>Descubre, reserva y paga de forma inteligente</p>
          </div>

          <div className="features-preview">
            <div className="feature-item">
              <div className="feature-icon">🤖</div>
              <div className="feature-text">
                <h4>Chat IA Inteligente</h4>
                <p>Asistente virtual para recomendaciones personalizadas</p>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">💳</div>
              <div className="feature-text">
                <h4>Pagos Seguros</h4>
                <p>Procesa pagos con múltiples métodos de forma segura</p>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">🔔</div>
              <div className="feature-text">
                <h4>Notificaciones en Tiempo Real</h4>
                <p>Mantente actualizado con WebSocket</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">🤝</div>
              <div className="feature-text">
                <h4>Integración B2B</h4>
                <p>Conectado con otros sistemas turísticos</p>
              </div>
            </div>
          </div>

          <div className="info-footer">
            <p>Powered by Microservices Architecture</p>
            <div className="tech-badges">
              <span className="tech-badge">React</span>
              <span className="tech-badge">FastAPI</span>
              <span className="tech-badge">GraphQL</span>
              <span className="tech-badge">WebSocket</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginV2;
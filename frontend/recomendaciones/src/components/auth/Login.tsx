import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, LoginData } from '../../services/api/auth.service';
import { useAppContext } from '../../contexts/AppContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<LoginData>({ email: '', contraseña: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
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
      // Asumir que la respuesta contiene datos de usuario mínimos
      setSuccess(true);
      if (resp?.user) {
        const userData = { id: resp.user.id_usuario, name: resp.user.nombre };
        setUser(userData);
        // Guardar token en localStorage
        if (resp.access_token) {
          localStorage.setItem('auth_token', resp.access_token);
        }
      }
      // Redirigir después de 1 segundo para que el usuario vea el mensaje
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err: any) {
      // Manejar diferentes tipos de errores
      let errorMessage = 'Error al iniciar sesión';

      if (err.response?.status === 422) {
        // Error de validación de Pydantic
        const detail = err.response?.data?.detail;
        if (Array.isArray(detail)) {
          errorMessage = detail.join('; ');
        } else if (typeof detail === 'string') {
          errorMessage = detail;
        }
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        errorMessage =
          typeof detail === 'string' ? detail : JSON.stringify(detail);
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-wrapper">
        <div className="login-card glass">
          <h2 className="login-title">Sign In</h2>

          <form onSubmit={handleSubmit} className="auth-form">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />

            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              name="contraseña"
              type="password"
              placeholder="Password"
              value={form.contraseña}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />

            <div className="form-row">
              <label htmlFor="remember-me" className="remember">
                <input id="remember-me" name="remember" type="checkbox" />{' '}
                Remember me
              </label>
              <a href="#" className="muted">
                Forgot Password ?
              </a>
            </div>

            <button type="submit" disabled={loading} className="primary-btn">
              {loading ? 'Ingresando...' : 'Sign In'}
            </button>

            <div className="divider" />

            <div className="register-row">
              <span>Don't have an account ?</span>
              <Link to="/register" className="register-btn">
                Sign up
              </Link>
            </div>

            {error && <div className="error-msg">{error}</div>}
            {success && <div className="success-msg">¡Bienvenido!</div>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

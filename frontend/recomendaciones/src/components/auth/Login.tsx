import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, LoginData } from '../../services/api/auth.service';
import { useAppContext } from '../../contexts/AppContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<any>({ email: '', password: '' });
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
      const resp = await login(form as LoginData);
      setSuccess(true);
      if (resp?.user) {
        const userData = { id: resp.user.id, name: resp.user.nombre };
        setUser(userData);
        if (resp.access_token) {
          localStorage.setItem('token', resp.access_token);
          localStorage.setItem('userData', JSON.stringify(resp.user));
        }
      }
      setTimeout(() => navigate('/dashboard'), 800);
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
        } else {
          errorMessage = 'Error en los datos enviados';
        }
      } else if (err.response?.data?.message && typeof err.response.data.message === 'string') {
        errorMessage = err.response.data.message;
      } else if (err.message && typeof err.message === 'string') {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card-container">
        <div className="auth-hero">
          <div className="auth-hero-content">
            <h2>Business Startup</h2>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis.</p>
          </div>
        </div>

        <div className="auth-panel">
          <div className="auth-panel-inner">
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <p style={{ color: '#8b2ca3', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '2px', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
                User Login
              </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <input
                name="email"
                type="email"
                placeholder="Username"
                value={form.email}
                onChange={handleChange}
                required
              />

              <input
                name="password"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
              />

              <div className="form-row">
                <label className="remember" style={{ fontSize: '0.85rem', color: '#666' }}>
                  <input type="checkbox" style={{ marginRight: '6px' }} /> Remember password?
                </label>
              </div>

              <button className="btn-primary" type="submit" disabled={loading}>
                {loading ? 'Ingresando...' : 'LOGIN'}
              </button>

              <div className="register-row" style={{ marginTop: '16px' }}>
                <Link to="/register/user" className="link" style={{ color: '#8b2ca3', fontWeight: 600, textDecoration: 'none' }}>
                  Create Account
                </Link>
              </div>

              {error && <div className="error-msg">{error}</div>}
              {success && <div className="success-msg">¡Bienvenido!</div>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

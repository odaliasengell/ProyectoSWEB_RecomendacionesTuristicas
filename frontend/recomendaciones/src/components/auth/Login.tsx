import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { login, LoginData } from '../../services/api/auth.service';
import { useAppContext } from '../../contexts/AppContext';

const Login: React.FC = () => {
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
      try {
        if (resp?.data?.user) setUser({ id: resp.data.user.id, name: resp.data.user.name });
      } catch (_) {}
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al iniciar sesión');
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
            <label className="visually-hidden">Email</label>
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <label className="visually-hidden">Password</label>
            <input
              name="contraseña"
              type="password"
              placeholder="Password"
              value={form.contraseña}
              onChange={handleChange}
              required
            />

            <div className="form-row">
              <label className="remember">
                <input type="checkbox" /> Remember me
              </label>
              <a href="#" className="muted">Forgot Password ?</a>
            </div>

            <button type="submit" disabled={loading} className="primary-btn">
              {loading ? 'Ingresando...' : 'Sign In'}
            </button>

            <div className="divider" />

            <div className="register-row">
              <span>Don't have an account ?</span>
              <Link to="/register" className="register-btn">Sign up</Link>
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

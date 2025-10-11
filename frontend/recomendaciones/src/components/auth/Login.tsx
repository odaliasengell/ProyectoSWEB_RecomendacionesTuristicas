import React, { useState } from 'react';
import { login, LoginData } from '../../services/api/auth.service';

const Login: React.FC = () => {
  const [form, setForm] = useState<LoginData>({ email: '', contraseña: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await login(form);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="contraseña"
          type="password"
          placeholder="Contraseña"
          value={form.contraseña}
          onChange={handleChange}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">¡Bienvenido!</div>}
      </form>
    </div>
  );
};

export default Login;

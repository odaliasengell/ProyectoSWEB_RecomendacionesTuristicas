import React, { useState } from 'react';
import { register, RegisterData } from '../../services/api/auth.service';

const Register: React.FC = () => {
  const [form, setForm] = useState<RegisterData>({
    nombre: '',
    email: '',
    contraseña: '',
    pais: '',
  });
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
      await register(form);
      setSuccess(true);
      setForm({ nombre: '', email: '', contraseña: '', pais: '' });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al registrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <h2>Registro de Usuario</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          name="nombre"
          placeholder="Nombre"
          value={form.nombre}
          onChange={handleChange}
          required
        />
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
        <input
          name="pais"
          placeholder="País"
          value={form.pais}
          onChange={handleChange}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">¡Registro exitoso!</div>}
      </form>
    </div>
  );
};

export default Register;

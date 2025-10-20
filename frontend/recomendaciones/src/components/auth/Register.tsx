import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { register, RegisterData } from '../../services/api/auth.service';

type RegisterPayload = RegisterData & { role?: string };

type RegisterRef = { scrollToForm: () => void; setEmail: (e: string) => void };

const Register = forwardRef(function Register(
  {
    role = 'user',
    initialEmail,
  }: { role?: 'user' | 'guide'; initialEmail?: string },
  ref: React.Ref<RegisterRef | null>
) {
  const [form, setForm] = useState<RegisterPayload>({
    nombre: '',
    email: '',
    contraseña: '',
    pais: '',
    role,
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
      // La API puede no tipar 'role' en RegisterData; forzamos payload compatible
      const payload = { ...(form as any), role } as any;
      await register(payload);
      setSuccess(true);
      setForm({ nombre: '', email: '', contraseña: '', pais: '' });
    } catch (err: any) {
      console.error('Register error', err);
      const respData = err.response?.data;
      const status = err.response?.status;
      
      let message = 'Error al registrar';
      
      if (respData?.detail) {
        if (Array.isArray(respData.detail)) {
          // Manejar errores de validación de Pydantic
          message = respData.detail.map((e: any) => 
            typeof e === 'string' ? e : e.msg || 'Error de validación'
          ).join(', ');
        } else if (typeof respData.detail === 'string') {
          message = respData.detail;
        } else {
          message = JSON.stringify(respData.detail);
        }
      } else if (respData?.message && typeof respData.message === 'string') {
        message = respData.message;
      } else if (err.message && typeof err.message === 'string') {
        message = err.message;
      }
      
      const full = status ? `${message} (status ${status})` : message;
      setError(full);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialEmail) setForm((s) => ({ ...s, email: initialEmail }));
  }, [initialEmail]);

  useImperativeHandle(ref, () => ({
    scrollToForm: () => {
      // intentar llevar el foco al primer input
      const el = document.querySelector('.auth-form-container');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
    setEmail: (e: string) => {
      setForm((s) => ({ ...s, email: e }));
    },
  }));

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <label htmlFor="register-nombre">Nombre</label>
      <input
        id="register-nombre"
        name="nombre"
        placeholder="Nombre"
        value={form.nombre}
        onChange={handleChange}
        autoComplete="name"
        required
      />

      <label htmlFor="register-email">Correo electrónico</label>
      <input
        id="register-email"
        name="email"
        type="email"
        placeholder="Correo"
        value={form.email}
        onChange={handleChange}
        autoComplete="email"
        required
      />

      <label htmlFor="register-password">Contraseña</label>
      <input
        id="register-password"
        name="contraseña"
        type="password"
        placeholder="Contraseña"
        value={form.contraseña}
        onChange={handleChange}
        autoComplete="new-password"
        required
      />

      <label htmlFor="register-pais">País</label>
      <input
        id="register-pais"
        name="pais"
        placeholder="País"
        value={form.pais}
        onChange={handleChange}
        autoComplete="country-name"
      />

      <button className="btn-primary" type="submit" disabled={loading}>
        {loading ? 'Registrando...' : 'Crear cuenta'}
      </button>

      <div className="register-row" style={{ marginTop: '8px' }}>
        <span>¿Ya tienes cuenta?</span>
        <a href="/login" className="link">Iniciar sesión</a>
      </div>

      {error && <div className="error-msg">{error}</div>}
      {success && <div className="success-msg">¡Registro exitoso!</div>}
    </form>
  );
});

export default Register;

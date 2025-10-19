import React, { useRef, useState } from 'react';
import Register from '../components/auth/Register';

const RegisterUserPage: React.FC = () => {
  const formRef = useRef<{ scrollToForm: () => void; setEmail: (e: string) => void } | null>(null);
  const [role, setRole] = useState<'user' | 'guide'>('user');

  return (
    <div className="register-page">
      <div className="login-wrapper">
        <div className="login-card glass">
          <h2 className="login-title">Sign Up</h2>

          {/* Role selector */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <div className="role-toggle">
              <button
                type="button"
                className={`role-btn ${role === 'user' ? 'active' : ''}`}
                onClick={() => setRole('user')}
              >
                Cliente
              </button>
              <button
                type="button"
                className={`role-btn ${role === 'guide' ? 'active' : ''}`}
                onClick={() => setRole('guide')}
              >
                Guía
              </button>
            </div>
          </div>

          <div style={{ maxWidth: 420, margin: '0 auto' }}>
            <Register ref={formRef} role={role} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterUserPage;

import React, { useRef } from 'react';
import Register from '../components/auth/Register';

const RegisterGuidePage: React.FC = () => {
  const formRef = useRef<{ scrollToForm: () => void; setEmail: (e: string) => void } | null>(null);

  return (
    <div className="register-page">
      <div className="login-wrapper">
        <div className="login-card glass">
          <h2 className="login-title">Register as Guide</h2>
          <div style={{ maxWidth: 420, margin: '0 auto' }}>
            <Register ref={formRef} role="guide" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterGuidePage;

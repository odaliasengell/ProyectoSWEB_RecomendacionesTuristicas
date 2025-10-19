import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => (
  <footer className="footer" style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(46,42,40,0.04)', background: 'transparent' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
      <p style={{ margin: 0, color: 'var(--muted)' }}>
        © 2025 Recomendaciones Turísticas
      </p>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <Link to="/contact" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Contacto</Link>
        <a href="#" aria-label="twitter" style={{ color: 'var(--muted)' }}>Twitter</a>
        <a href="#" aria-label="instagram" style={{ color: 'var(--muted)' }}>Instagram</a>
      </div>
    </div>
  </footer>
);

export default Footer;

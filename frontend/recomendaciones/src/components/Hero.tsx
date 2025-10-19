import React, { useState } from 'react';

type HeroProps = {
  title: string;
  subtitle?: string;
  placeholder?: string;
  ctaLabel?: string;
  onSubmit?: (email: string) => void;
};

const Hero: React.FC<HeroProps> = ({ title, subtitle, placeholder = 'nombre@ejemplo.com', ctaLabel = 'Crear cuenta gratis', onSubmit }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) onSubmit(email.trim());
  };

  return (
    <section className="hero">
      <div className="hero-inner">
        <h1 className="hero-title">{title}</h1>
        {subtitle && <p className="hero-sub">{subtitle}</p>}

        <form className="hero-cta" onSubmit={handleSubmit}>
          <input
            aria-label="email"
            className="hero-input"
            placeholder={placeholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />
          <button className="hero-button" type="submit">
            {ctaLabel}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Hero;

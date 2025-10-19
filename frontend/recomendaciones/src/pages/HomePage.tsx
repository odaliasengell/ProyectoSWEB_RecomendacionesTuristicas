import React from 'react';
import { Link } from 'react-router-dom';

const sampleTours = [
  { id: 1, title: 'Shadowpeak Canyon', location: 'Colorado, USA', price: '$240', img: '' },
  { id: 2, title: 'Crimson Rift', location: 'Wadi Rum, Jordan', price: '$400', img: '' },
  { id: 3, title: 'Whispering Dunes', location: 'Namib Desert, Namibia', price: '$300', img: '' },
  { id: 4, title: 'Frostveil Summit', location: 'Svalbard, Norway', price: '$300', img: '' },
  { id: 5, title: 'The Obsidian Hollow', location: "Iceland's Highlands", price: '$250', img: '' },
  { id: 6, title: 'Stormbreaker Isles', location: 'Faroe Islands, Denmark', price: '$450', img: '' },
];

const HomePage: React.FC = () => {

  // Si subes la imagen a public/images/Redondo.jpg usa esta ruta:
  const heroImage = '/images/Redondo.png';
  return (
    <div>
      <section className="hero hero-explore">
        <div className="hero-inner hero-grid">
          <div className="hero-copy">
            <h1 className="hero-title large">EXPLORA<br/>EL MUNDO</h1>
            <p className="hero-sub">Travel is the movement of people between distant geographical locations. Travel can be done by foot, bicycle.</p>
            <div className="hero-cta">
              <Link to="/tours" className="hero-cta-primary">...</Link>
              <Link to="/features" className="hero-cta-ghost">...</Link>
            </div>
          </div>

          <div className="hero-media" aria-hidden>
            {/* Circular media - usa la imagen desde public/images/hero.jpg */}
            <div className="hero-media-circle" style={{ backgroundImage: `url(${heroImage})` }} />
          </div>
        </div>
      </section>

      <section className="discover">
        <h2>Discover the world</h2>
        <div className="tours-grid">
          {sampleTours.map((t) => (
            <article key={t.id} className="tour-card card">
              <div className="tour-media" />
              <div className="tour-body">
                <small className="tour-location">{t.location}</small>
                <h3 className="tour-title">{t.title}</h3>
                <div className="tour-footer">
                  <span className="tour-price">{t.price}</span>
                  <Link to={`/tours/${t.id}`} className="tour-button">View Details ›</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;

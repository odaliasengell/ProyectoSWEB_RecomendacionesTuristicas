import React from 'react';
import { useTours } from '../hooks/useTours';
import TourCard from '../components/tours/TourCard';

const ToursPage: React.FC = () => {
  const { tours, loading } = useTours();

  if (loading) return <div>Cargando tours...</div>;

  return (
    <div>
      <h2>Tours</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        {tours.map((tour: any) => (
          <div key={tour.id_tour} style={{ width: 300 }}>
            <TourCard tour={tour} />
            <div style={{ marginTop: 8 }}>
              <button style={{ padding: '0.6rem 0.9rem', borderRadius: 8, background: 'var(--accent)', color: 'var(--surface)', border: 'none' }}>Reservar Tour</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ToursPage;

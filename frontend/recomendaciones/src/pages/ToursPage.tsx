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
        {tours.map((tour) => (
          <TourCard key={tour.id_tour} tour={tour} />
        ))}
      </div>
    </div>
  );
};

export default ToursPage;

import React from 'react';
import { Tour } from '../../models';

interface TourCardProps {
  tour: Tour;
}

const TourCard: React.FC<TourCardProps> = ({ tour }) => (
  <div className="tour-card">
    <h3>{tour.nombre}</h3>
    <p>
      <strong>Duración:</strong> {tour.duracion}
    </p>
    <p>
      <strong>Precio:</strong> ${tour.precio}
    </p>
  </div>
);

export default TourCard;

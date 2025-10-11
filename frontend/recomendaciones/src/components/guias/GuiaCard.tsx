import React from 'react';
import { Guia } from '../../models';

interface GuiaCardProps {
  guia: Guia;
}

const GuiaCard: React.FC<GuiaCardProps> = ({ guia }) => (
  <div className="guia-card">
    <h3>{guia.nombre}</h3>
    <p>
      <strong>Idiomas:</strong> {guia.idiomas}
    </p>
    <p>
      <strong>Experiencia:</strong> {guia.experiencia}
    </p>
  </div>
);

export default GuiaCard;

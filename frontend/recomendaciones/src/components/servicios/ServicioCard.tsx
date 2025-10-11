import React from 'react';
import { Servicio } from '../../models';

interface ServicioCardProps {
  servicio: Servicio;
}

const ServicioCard: React.FC<ServicioCardProps> = ({ servicio }) => (
  <div className="servicio-card">
    <h3>{servicio.nombre}</h3>
    <p>
      <strong>Descripción:</strong> {servicio.descripcion}
    </p>
    <p>
      <strong>Precio:</strong> ${servicio.precio}
    </p>
  </div>
);

export default ServicioCard;

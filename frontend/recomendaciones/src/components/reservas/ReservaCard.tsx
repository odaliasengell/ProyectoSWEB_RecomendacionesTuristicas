import React from 'react';
import { Reserva } from '../../models';

interface ReservaCardProps {
  reserva: Reserva;
}

const ReservaCard: React.FC<ReservaCardProps> = ({ reserva }) => (
  <div className="reserva-card">
    <h3>Reserva #{reserva.id_reserva}</h3>
    <p>
      <strong>Fecha:</strong> {reserva.fecha_reserva}
    </p>
    <p>
      <strong>Cantidad de personas:</strong> {reserva.cantidad_personas}
    </p>
  </div>
);

export default ReservaCard;

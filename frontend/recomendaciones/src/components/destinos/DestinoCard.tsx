import React from 'react';
import { Destino } from '../../models';

interface DestinoCardProps {
  destino: Destino;
}

const DestinoCard: React.FC<DestinoCardProps> = ({ destino }) => (
  <div className="destino-card">
    <h3>{destino.nombre}</h3>
    <p>
      <strong>Descripción:</strong> {destino.descripcion}
    </p>
    <p>
      <strong>Ubicación:</strong> {destino.ubicacion}
    </p>
    <img
      src={destino.ruta}
      alt={destino.nombre}
      style={{ width: '100%', maxWidth: 300 }}
    />
  </div>
);

export default DestinoCard;

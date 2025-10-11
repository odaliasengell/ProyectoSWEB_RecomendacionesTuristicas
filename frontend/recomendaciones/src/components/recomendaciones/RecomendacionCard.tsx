import React from 'react';
import { Recomendacion } from '../../models';

interface RecomendacionCardProps {
  recomendacion: Recomendacion;
}

const RecomendacionCard: React.FC<RecomendacionCardProps> = ({
  recomendacion,
}) => (
  <div className="recomendacion-card">
    <h3>Recomendación #{recomendacion.id_recomendacion}</h3>
    <p>
      <strong>Fecha:</strong> {recomendacion.fecha}
    </p>
    <p>
      <strong>Calificación:</strong> {recomendacion.calificacion}
    </p>
    <p>
      <strong>Comentario:</strong> {recomendacion.comentario}
    </p>
  </div>
);

export default RecomendacionCard;

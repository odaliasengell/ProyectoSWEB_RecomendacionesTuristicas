import React from 'react';
import { ContratacionServicio } from '../../models';

interface ContratacionServicioCardProps {
  contratacion: ContratacionServicio;
}

const ContratacionServicioCard: React.FC<ContratacionServicioCardProps> = ({
  contratacion,
}) => (
  <div className="contratacion-card">
    <h3>Contratación #{contratacion.id_contratacion}</h3>
    <p>
      <strong>Fecha de contratación:</strong> {contratacion.fecha_contratacion}
    </p>
  </div>
);

export default ContratacionServicioCard;

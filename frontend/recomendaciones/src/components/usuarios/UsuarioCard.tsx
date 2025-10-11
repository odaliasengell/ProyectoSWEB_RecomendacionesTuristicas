import React from 'react';
import { Usuario } from '../../models';

interface UsuarioCardProps {
  usuario: Usuario;
}

const UsuarioCard: React.FC<UsuarioCardProps> = ({ usuario }) => (
  <div className="usuario-card">
    <h3>{usuario.nombre}</h3>
    <p>
      <strong>Email:</strong> {usuario.email}
    </p>
    <p>
      <strong>País:</strong> {usuario.pais}
    </p>
  </div>
);

export default UsuarioCard;

import React from 'react';
import { useAppContext } from '../contexts/AppContext';

const ProfilePage: React.FC = () => {
  const { user } = useAppContext();

  if (!user) {
    return (
      <div>
        <h2>Perfil</h2>
        <p>No has iniciado sesión.</p>
      </div>
    );
  }

  const u: any = user;

  return (
    <div>
      <h2>Perfil de {u.name}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
        <div className="card">
          <p><strong>Email:</strong> {u.email || '-'}</p>
          <p><strong>País:</strong> {u.country || '-'}</p>
          <p><strong>Rol:</strong> {u.role || '-'}</p>
        </div>

        <div className="card">
          <h3>Reservas</h3>
          <p>Listado de reservas (disponible en futuras integraciones).</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

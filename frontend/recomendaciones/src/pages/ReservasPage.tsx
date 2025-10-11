import React from 'react';
import { useReservas } from '../hooks/useReservas';
import ReservaCard from '../components/reservas/ReservaCard';

const ReservasPage: React.FC = () => {
  const { reservas, loading } = useReservas();

  if (loading) return <div>Cargando reservas...</div>;

  return (
    <div>
      <h2>Reservas</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        {reservas.map((reserva) => (
          <ReservaCard key={reserva.id_reserva} reserva={reserva} />
        ))}
      </div>
    </div>
  );
};

export default ReservasPage;

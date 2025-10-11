import { Reserva } from '../../models';

const reservas: Reserva[] = [
  { id_reserva: 1, fecha_reserva: '2025-10-10', cantidad_personas: 2 },
  { id_reserva: 2, fecha_reserva: '2025-11-01', cantidad_personas: 4 },
];

export const getReservas = async (): Promise<Reserva[]> => {
  return Promise.resolve(reservas);
};

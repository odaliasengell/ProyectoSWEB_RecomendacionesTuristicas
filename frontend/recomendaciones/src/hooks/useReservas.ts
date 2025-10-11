import { useEffect, useState } from 'react';
import { Reserva } from '../models';
import { getReservas } from '../services/api/reservas.service';

export function useReservas() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReservas().then((data) => {
      setReservas(data);
      setLoading(false);
    });
  }, []);

  return { reservas, loading };
}

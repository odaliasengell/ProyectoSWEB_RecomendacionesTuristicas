import { useEffect, useState } from 'react';
import { Destino } from '../models';
import { getDestinos } from '../services/api/destinos.service';

export function useDestinos() {
  const [destinos, setDestinos] = useState<Destino[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDestinos().then((data) => {
      setDestinos(data);
      setLoading(false);
    });
  }, []);

  return { destinos, loading };
}

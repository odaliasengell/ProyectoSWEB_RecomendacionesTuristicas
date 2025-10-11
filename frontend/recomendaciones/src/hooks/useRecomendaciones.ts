import { useEffect, useState } from 'react';
import { Recomendacion } from '../models';
import { getRecomendaciones } from '../services/api/recomendaciones.service';

export function useRecomendaciones() {
  const [recomendaciones, setRecomendaciones] = useState<Recomendacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecomendaciones().then((data) => {
      setRecomendaciones(data);
      setLoading(false);
    });
  }, []);

  return { recomendaciones, loading };
}

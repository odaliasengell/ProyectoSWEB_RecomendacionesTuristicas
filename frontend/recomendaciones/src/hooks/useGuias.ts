import { useEffect, useState } from 'react';
import { Guia } from '../models';
import { getGuias } from '../services/api/guias.service';

export function useGuias() {
  const [guias, setGuias] = useState<Guia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGuias().then((data) => {
      setGuias(data);
      setLoading(false);
    });
  }, []);

  return { guias, loading };
}

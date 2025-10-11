import { useEffect, useState } from 'react';
import { Tour } from '../models';
import { getTours } from '../services/api/tours.service';

export function useTours() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTours().then((data) => {
      setTours(data);
      setLoading(false);
    });
  }, []);

  return { tours, loading };
}

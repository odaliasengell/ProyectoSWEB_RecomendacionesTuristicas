import { Recomendacion } from '../../models';

const recomendaciones: Recomendacion[] = [
  {
    id_recomendacion: 1,
    fecha: '2025-10-10',
    calificacion: 5,
    comentario: '¡Excelente experiencia!',
  },
  {
    id_recomendacion: 2,
    fecha: '2025-10-11',
    calificacion: 4,
    comentario: 'Muy bueno.',
  },
];

export const getRecomendaciones = async (): Promise<Recomendacion[]> => {
  return Promise.resolve(recomendaciones);
};

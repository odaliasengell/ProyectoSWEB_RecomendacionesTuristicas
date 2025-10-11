import { Tour } from '../../models';

const tours: Tour[] = [
  { id_tour: 1, nombre: 'Tour Galápagos', duracion: '3 días', precio: 350 },
  { id_tour: 2, nombre: 'Tour Quito Colonial', duracion: '1 día', precio: 50 },
];

export const getTours = async (): Promise<Tour[]> => {
  return Promise.resolve(tours);
};

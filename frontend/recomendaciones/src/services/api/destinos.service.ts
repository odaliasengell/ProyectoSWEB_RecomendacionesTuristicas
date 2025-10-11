import { Destino } from '../../models';

const destinos: Destino[] = [
  {
    id_destino: 1,
    nombre: 'Galápagos',
    descripcion: 'Islas únicas',
    ubicacion: 'Ecuador',
    ruta: '/img/galapagos.jpg',
  },
  {
    id_destino: 2,
    nombre: 'Quito',
    descripcion: 'Capital de Ecuador',
    ubicacion: 'Ecuador',
    ruta: '/img/quito.jpg',
  },
];

export const getDestinos = async (): Promise<Destino[]> => {
  return Promise.resolve(destinos);
};

import { Guia } from '../../models';

// Ejemplo de datos mock
const guias: Guia[] = [
  {
    id_guia: 1,
    nombre: 'Juan Pérez',
    idiomas: 'Español, Inglés',
    experiencia: '5 años',
  },
  {
    id_guia: 2,
    nombre: 'Ana Torres',
    idiomas: 'Español, Francés',
    experiencia: '3 años',
  },
];

export const getGuias = async (): Promise<Guia[]> => {
  // Aquí iría la llamada real a la API
  return Promise.resolve(guias);
};

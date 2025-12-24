import React from 'react';
import { Link } from 'react-router-dom';

const CTAFinal = () => {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-purple-700 py-16">
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
          ¿Listo para tu próxima aventura?
        </h2>
        <p className="mt-4 text-xl text-blue-100">
          Únete a miles de viajeros que han descubierto destinos increíbles con nosotros
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/destinos"
            className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 transition-colors duration-300"
          >
            Explorar Destinos
          </Link>
          <Link
            to="/tours"
            className="inline-flex items-center px-8 py-3 border border-white text-base font-medium rounded-md text-white bg-transparent hover:bg-white hover:text-blue-700 transition-colors duration-300"
          >
            Ver Tours
          </Link>
        </div>
        <div className="mt-8 text-blue-100 text-sm">
          <p>🌟 Más de 1,000 clientes satisfechos</p>
        </div>
      </div>
    </section>
  );
};

export default CTAFinal;
import React from 'react';

const ComoFunciona = () => {
  return (
    <section id="como-funciona" className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            ¿Cómo funciona?
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Encuentra tu destino perfecto en 3 simples pasos
          </p>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-blue-500 rounded-full">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">
                Explora Destinos
              </h3>
              <p className="mt-2 text-gray-600">
                Navega por nuestra amplia selección de destinos turísticos únicos y emocionantes.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-green-500 rounded-full">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">
                Obtén Recomendaciones
              </h3>
              <p className="mt-2 text-gray-600">
                Recibe recomendaciones personalizadas basadas en tus preferencias y presupuesto.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-purple-500 rounded-full">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">
                Reserva y Viaja
              </h3>
              <p className="mt-2 text-gray-600">
                Reserva tu tour con guías locales y disfruta de una experiencia inolvidable.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComoFunciona;
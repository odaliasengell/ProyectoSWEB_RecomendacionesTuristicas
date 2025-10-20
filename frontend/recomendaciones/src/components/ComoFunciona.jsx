import { Search, MapPin, Camera, CheckCircle } from 'lucide-react';

const ComoFunciona = () => {
  const pasos = [
    {
      numero: '01',
      titulo: 'Explora Destinos',
      descripcion: 'Descubre lugares increíbles con nuestro buscador inteligente y recomendaciones personalizadas basadas en tus intereses.',
      icono: Search,
      color: 'from-emerald-400 to-emerald-600',
      delay: '0s'
    },
    {
      numero: '02',
      titulo: 'Planifica tu Viaje',
      descripcion: 'Selecciona tus destinos favoritos, reserva tours y actividades. Nosotros nos encargamos de todos los detalles logísticos.',
      icono: MapPin,
      color: 'from-blue-400 to-blue-600',
      delay: '0.2s'
    },
    {
      numero: '03',
      titulo: 'Vive la Experiencia',
      descripcion: 'Disfruta de aventuras únicas con guías expertos locales y crea recuerdos inolvidables en Ecuador.',
      icono: Camera,
      color: 'from-orange-400 to-orange-600',
      delay: '0.4s'
    }
  ];

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-emerald-100 to-transparent rounded-full -translate-x-32 -translate-y-32 opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-blue-100 to-transparent rounded-full translate-x-48 translate-y-48 opacity-50"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-6">
            ¿Cómo <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">Funciona?</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Tres simples pasos para vivir la aventura perfecta en Ecuador. 
            Desde la planificación hasta la experiencia, te acompañamos en todo el camino.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {pasos.map((paso, index) => (
            <div
              key={index}
              className="relative group animate-fadeInUp"
              style={{ animationDelay: paso.delay }}
            >
              {/* Connection Line (Desktop only) */}
              {index < pasos.length - 1 && (
                <div className="hidden lg:block absolute top-20 left-full w-full h-0.5 bg-gradient-to-r from-gray-300 to-gray-200 z-0">
                  <div className="absolute top-1/2 right-0 transform translate-y--1/2 w-3 h-3 bg-gray-300 rounded-full"></div>
                </div>
              )}

              <div className="relative z-10 text-center">
                {/* Step Number */}
                <div className="relative mb-8">
                  <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${paso.color} text-white text-2xl font-bold rounded-2xl shadow-lg transform group-hover:scale-110 transition-all duration-300`}>
                    {paso.numero}
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <CheckCircle className="w-8 h-8 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>

                {/* Icon */}
                <div className="mb-6">
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${paso.color} bg-opacity-10 rounded-xl group-hover:bg-opacity-20 transition-all duration-300`}>
                    <paso.icono className={`w-8 h-8 bg-gradient-to-br ${paso.color} bg-clip-text text-transparent`} />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-emerald-600 transition-colors duration-300">
                  {paso.titulo}
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {paso.descripcion}
                </p>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10 transform scale-95 group-hover:scale-100"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Statistics */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
            <div className="text-4xl font-bold text-emerald-600 mb-2">98%</div>
            <div className="text-gray-600">Satisfacción del Cliente</div>
          </div>
          <div className="text-center animate-fadeInUp" style={{ animationDelay: '0.7s' }}>
            <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
            <div className="text-gray-600">Soporte al Viajero</div>
          </div>
          <div className="text-center animate-fadeInUp" style={{ animationDelay: '0.8s' }}>
            <div className="text-4xl font-bold text-orange-600 mb-2">500+</div>
            <div className="text-gray-600">Tours Disponibles</div>
          </div>
          <div className="text-center animate-fadeInUp" style={{ animationDelay: '0.9s' }}>
            <div className="text-4xl font-bold text-purple-600 mb-2">15+</div>
            <div className="text-gray-600">Años de Experiencia</div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-3xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              ¿Listo para tu próxima aventura?
            </h3>
            <p className="text-gray-600 mb-6">
              Únete a miles de viajeros que han descubierto la magia de Ecuador con nosotros.
            </p>
            <button className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-emerald-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-xl">
              Comenzar mi Viaje
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComoFunciona;
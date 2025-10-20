import { ArrowRight, Star, MapPin } from 'lucide-react';

const DestinosDestacados = () => {
  const destinos = [
    {
      id: 1,
      nombre: 'Galápagos',
      descripcion: 'Islas únicas con fauna endémica y paisajes volcánicos únicos en el mundo.',
      imagen: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1934&q=80',
      rating: 4.9,
      precio: 'Desde $1,200',
      categoria: 'Naturaleza'
    },
    {
      id: 2,
      nombre: 'Quito',
      descripcion: 'Centro histórico colonial declarado Patrimonio de la Humanidad por la UNESCO.',
      imagen: 'https://images.unsplash.com/photo-1561751499-34fa82092033?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      rating: 4.7,
      precio: 'Desde $300',
      categoria: 'Cultura'
    },
    {
      id: 3,
      nombre: 'Baños',
      descripcion: 'Aventura extrema entre cascadas, aguas termales y deportes de adrenalina.',
      imagen: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      rating: 4.8,
      precio: 'Desde $450',
      categoria: 'Aventura'
    },
    {
      id: 4,
      nombre: 'Montañita',
      descripcion: 'Paraíso surfero con playas doradas, vida nocturna vibrante y ambiente bohemio.',
      imagen: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      rating: 4.6,
      precio: 'Desde $280',
      categoria: 'Playa'
    },
    {
      id: 5,
      nombre: 'Cuenca',
      descripcion: 'Ciudad colonial con arquitectura impresionante y tradiciones artesanales únicas.',
      imagen: 'https://images.unsplash.com/photo-1571123575409-95c61f8d41e5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      rating: 4.7,
      precio: 'Desde $350',
      categoria: 'Cultura'
    },
    {
      id: 6,
      nombre: 'Amazonía',
      descripcion: 'Selva tropical con increíble biodiversidad y comunidades indígenas ancestrales.',
      imagen: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80',
      rating: 4.8,
      precio: 'Desde $600',
      categoria: 'Naturaleza'
    }
  ];

  const getCategoryColor = (categoria) => {
    const colors = {
      'Naturaleza': 'bg-emerald-100 text-emerald-800',
      'Cultura': 'bg-blue-100 text-blue-800',
      'Aventura': 'bg-orange-100 text-orange-800',
      'Playa': 'bg-cyan-100 text-cyan-800'
    };
    return colors[categoria] || 'bg-gray-100 text-gray-800';
  };

  return (
    <section id="destinos" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-6">
            Destinos <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">Destacados</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Descubre los lugares más espectaculares del Ecuador. Cada destino ofrece experiencias únicas 
            que te conectarán con la naturaleza, la cultura y la aventura.
          </p>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinos.map((destino, index) => (
            <div
              key={destino.id}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden animate-fadeInUp"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image Container */}
              <div className="relative overflow-hidden">
                <img
                  src={destino.imagen}
                  alt={destino.nombre}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(destino.categoria)}`}>
                    {destino.categoria}
                  </span>
                </div>

                {/* Price Badge */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span className="text-sm font-semibold text-gray-800">{destino.precio}</span>
                </div>

                {/* Overlay Content */}
                <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="w-full bg-white/20 backdrop-blur-sm text-white border border-white/30 px-4 py-2 rounded-lg font-medium hover:bg-white/30 transition-colors duration-200 flex items-center justify-center">
                    Ver Detalles
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-2xl font-bold text-gray-800 group-hover:text-emerald-600 transition-colors duration-300">
                    {destino.nombre}
                  </h3>
                  <div className="flex items-center text-yellow-500">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="ml-1 text-sm font-medium text-gray-600">
                      {destino.rating}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 mb-4 leading-relaxed">
                  {destino.descripcion}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">Ecuador</span>
                  </div>
                  
                  <button className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-6 py-2 rounded-full font-medium hover:from-emerald-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                    Explorar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-16">
          <button className="inline-flex items-center bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-emerald-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-xl">
            Ver Todos los Destinos
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default DestinosDestacados;
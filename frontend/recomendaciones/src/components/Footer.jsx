import { MapPin, Phone, Mail, Facebook, Instagram, Twitter, Youtube, Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const enlaces = {
    destinos: [
      'Galápagos',
      'Quito',
      'Baños',
      'Montañita',
      'Cuenca',
      'Amazonía'
    ],
    servicios: [
      'Tours Personalizados',
      'Guías Turísticos',
      'Transporte',
      'Alojamiento',
      'Actividades',
      'Paquetes Completos'
    ],
    soporte: [
      'Centro de Ayuda',
      'Términos y Condiciones',
      'Política de Privacidad',
      'Política de Cancelación',
      'Contacto',
      'Preguntas Frecuentes'
    ]
  };

  const redesSociales = [
    { icono: Facebook, url: 'https://facebook.com/exploraecuador', color: 'hover:text-blue-500' },
    { icono: Instagram, url: 'https://instagram.com/exploraecuador', color: 'hover:text-pink-500' },
    { icono: Twitter, url: 'https://twitter.com/exploraecuador', color: 'hover:text-blue-400' },
    { icono: Youtube, url: 'https://youtube.com/exploraecuador', color: 'hover:text-red-500' }
  ];

  return (
    <footer className="bg-gray-900 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-10 right-10 opacity-10">
        <div className="w-32 h-32 border-2 border-white rounded-full"></div>
      </div>
      <div className="absolute bottom-10 left-10 opacity-10">
        <div className="w-24 h-24 bg-white/5 rounded-lg rotate-45"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <MapPin className="h-8 w-8 text-emerald-400" />
              <span className="text-2xl font-bold">Explora Ecuador</span>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Tu puerta de entrada a las maravillas del Ecuador. Creamos experiencias 
              inolvidables que conectan a los viajeros con la naturaleza, cultura y aventura.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center text-gray-300">
                <Phone className="h-5 w-5 mr-3 text-emerald-400" />
                <span>+593 2 123-4567</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Mail className="h-5 w-5 mr-3 text-emerald-400" />
                <span>info@exploraecuador.com</span>
              </div>
              <div className="flex items-start text-gray-300">
                <MapPin className="h-5 w-5 mr-3 text-emerald-400 mt-0.5" />
                <span>Quito, Ecuador<br />Centro Histórico</span>
              </div>
            </div>
          </div>

          {/* Destinos */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-emerald-400">Destinos Populares</h3>
            <ul className="space-y-3">
              {enlaces.destinos.map((destino, index) => (
                <li key={index}>
                  <a
                    href={`#${destino.toLowerCase()}`}
                    className="text-gray-400 hover:text-white hover:text-emerald-300 transition-colors duration-200 block"
                  >
                    {destino}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Servicios */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-emerald-400">Nuestros Servicios</h3>
            <ul className="space-y-3">
              {enlaces.servicios.map((servicio, index) => (
                <li key={index}>
                  <button
                    onClick={() => {
                      const element = document.getElementById('servicios');
                      if (element) element.scrollIntoView({ behavior: 'smooth' });
                      else window.location.href = '/#servicios';
                    }}
                    className="text-gray-400 hover:text-white hover:text-emerald-300 transition-colors duration-200 block bg-transparent border-0 cursor-pointer text-left p-0"
                    style={{ font: 'inherit' }}
                  >
                    {servicio}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Soporte */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-emerald-400">Soporte</h3>
            <ul className="space-y-3 mb-6">
              {enlaces.soporte.map((enlace, index) => (
                <li key={index}>
                  <button
                    onClick={() => {
                      const element = document.getElementById('soporte');
                      if (element) element.scrollIntoView({ behavior: 'smooth' });
                      else window.location.href = '/#soporte';
                    }}
                    className="text-gray-400 hover:text-white hover:text-emerald-300 transition-colors duration-200 block bg-transparent border-0 cursor-pointer text-left p-0"
                    style={{ font: 'inherit' }}
                  >
                    {enlace}
                  </button>
                </li>
              ))}
            </ul>

            {/* Newsletter */}
            <div>
              <h4 className="text-lg font-semibold mb-3 text-white">Suscríbete</h4>
              <p className="text-gray-400 text-sm mb-3">
                Recibe ofertas exclusivas y destinos increíbles.
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Tu email"
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-l-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500 text-white"
                />
                <button className="bg-gradient-to-r from-emerald-500 to-blue-600 px-4 py-2 rounded-r-lg hover:from-emerald-600 hover:to-blue-700 transition-all duration-300">
                  <Mail className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media & Copyright */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Social Media */}
            <div className="flex space-x-6 mb-4 md:mb-0">
              {redesSociales.map((red, index) => (
                <a
                  key={index}
                  href={red.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-gray-400 ${red.color} transition-colors duration-200 transform hover:scale-110`}
                >
                  <red.icono className="h-6 w-6" />
                </a>
              ))}
            </div>

            {/* Copyright */}
            <div className="text-center md:text-right">
              <p className="text-gray-400 text-sm flex items-center justify-center md:justify-end">
                © {currentYear} Explora Ecuador. Hecho con 
                <Heart className="h-4 w-4 mx-1 text-red-400 fill-current" />
                para los aventureros.
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-2">
                <span className="text-emerald-400 font-bold text-xl">✓</span>
              </div>
              <span className="text-gray-400 text-sm">Turismo Certificado</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-2">
                <span className="text-blue-400 font-bold text-xl">🛡️</span>
              </div>
              <span className="text-gray-400 text-sm">Viajes Seguros</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-2">
                <span className="text-green-400 font-bold text-xl">🌱</span>
              </div>
              <span className="text-gray-400 text-sm">Eco-Friendly</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-2">
                <span className="text-yellow-400 font-bold text-xl">⭐</span>
              </div>
              <span className="text-gray-400 text-sm">Calidad Premium</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
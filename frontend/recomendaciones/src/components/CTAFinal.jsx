import { ArrowRight, Sparkles, Globe, Heart } from 'lucide-react';

const CTAFinal = () => {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-blue-600 to-purple-700"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Floating shapes */}
        <div className="absolute top-1/4 left-1/6 w-20 h-20 bg-white/10 rounded-full animate-float-slow"></div>
        <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-yellow-300/20 rounded-full animate-float-medium"></div>
        <div className="absolute bottom-1/4 left-1/3 w-16 h-16 bg-emerald-300/30 rounded-full animate-float-fast"></div>
        <div className="absolute bottom-1/3 right-1/6 w-24 h-24 bg-blue-300/20 rounded-full animate-float-slow"></div>
        
        {/* Gradient orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-radial from-white/10 to-transparent rounded-full -translate-x-48 -translate-y-48"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-radial from-yellow-300/20 to-transparent rounded-full translate-x-48 translate-y-48"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Icons Animation */}
          <div className="flex justify-center space-x-8 mb-8">
            <div className="animate-bounce" style={{ animationDelay: '0s' }}>
              <Globe className="w-12 h-12 text-white/80" />
            </div>
            <div className="animate-bounce" style={{ animationDelay: '0.2s' }}>
              <Sparkles className="w-12 h-12 text-yellow-300" />
            </div>
            <div className="animate-bounce" style={{ animationDelay: '0.4s' }}>
              <Heart className="w-12 h-12 text-red-300" />
            </div>
          </div>

          {/* Main Content */}
          <div className="animate-fadeInUp">
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight">
              Tu Aventura
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                Perfecta Te Espera
              </span>
            </h2>
            
            <p className="text-xl sm:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              No esperes más para vivir experiencias inolvidables. Ecuador te está llamando 
              con sus paisajes únicos, su cultura vibrante y sus aventuras sin límites.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <div className="bg-white/20 backdrop-blur-sm border border-white/30 px-6 py-3 rounded-full text-white font-medium">
                ✨ Experiencias Únicas
              </div>
              <div className="bg-white/20 backdrop-blur-sm border border-white/30 px-6 py-3 rounded-full text-white font-medium">
                🌿 Turismo Sostenible
              </div>
              <div className="bg-white/20 backdrop-blur-sm border border-white/30 px-6 py-3 rounded-full text-white font-medium">
                👥 Guías Expertos
              </div>
              <div className="bg-white/20 backdrop-blur-sm border border-white/30 px-6 py-3 rounded-full text-white font-medium">
                💎 Calidad Garantizada
              </div>
            </div>

            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <button className="group bg-white text-gray-800 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center">
                Explorar Destinos
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
              
              <button className="group bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center">
                Reservar Ahora
                <Sparkles className="ml-3 h-6 w-6 group-hover:animate-spin transition-transform duration-300" />
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              <div className="animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                <div className="text-3xl sm:text-4xl font-bold text-white mb-2">50,000+</div>
                <div className="text-white/80 text-lg">Viajeros Satisfechos</div>
              </div>
              <div className="animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                <div className="text-3xl sm:text-4xl font-bold text-white mb-2">4.9/5</div>
                <div className="text-white/80 text-lg">Calificación Promedio</div>
              </div>
              <div className="animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
                <div className="text-3xl sm:text-4xl font-bold text-white mb-2">15+</div>
                <div className="text-white/80 text-lg">Años de Experiencia</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom decoration */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
          <div className="w-24 h-24 bg-white/10 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Geometric shapes decoration */}
      <div className="absolute top-1/4 left-8 opacity-20">
        <div className="w-0 h-0 border-l-12 border-r-12 border-b-20 border-transparent border-b-white transform rotate-12"></div>
      </div>
      <div className="absolute bottom-1/4 right-8 opacity-20">
        <div className="w-8 h-8 bg-white transform rotate-45"></div>
      </div>
    </section>
  );
};

export default CTAFinal;
import { useState } from 'react';
import { Search, MapPin, Calendar } from 'lucide-react';

const HeroSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const ecuadorDestinations = [
    'Galápagos', 'Quito', 'Baños', 'Montañita', 'Cuenca', 'Amazonía',
    'Otavalo', 'Mindo', 'Salinas', 'Guayaquil', 'Imbabura', 'Cotopaxi',
    'Vilcabamba', 'Puerto López', 'Puyo', 'Riobamba'
  ];

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length > 0) {
      const filtered = ecuadorDestinations.filter(dest =>
        dest.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Buscando:', searchTerm);
    // Aquí iría la lógica de búsqueda
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/90 via-blue-600/80 to-orange-500/70 z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1508672019048-805c876b67e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1993&q=80"
          alt="Ecuador landscape"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Floating elements animation */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-white/20 rounded-full animate-float-slow"></div>
        <div className="absolute top-1/3 right-1/4 w-6 h-6 bg-yellow-300/30 rounded-full animate-float-medium"></div>
        <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-emerald-300/40 rounded-full animate-float-fast"></div>
      </div>

      {/* Content */}
      <div className="relative z-30 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="animate-fadeInUp">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Descubre la
            <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent block">
              Magia de Ecuador
            </span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
            Desde las místicas Islas Galápagos hasta la vibrante selva amazónica. 
            Explora destinos únicos, vive aventuras inolvidables y descubre la diversidad 
            natural y cultural que solo Ecuador puede ofrecerte.
          </p>

          {/* Search Form */}
          <div className="max-w-2xl mx-auto mb-16">
            <form onSubmit={handleSearch} className="relative">
              <div className="flex flex-col sm:flex-row bg-white rounded-2xl p-2 shadow-2xl">
                <div className="relative flex-1">
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="¿A dónde quieres ir?"
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className="w-full pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-700 text-lg"
                    />
                  </div>
                  
                  {/* Suggestions dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl mt-1 shadow-lg z-40 max-h-60 overflow-y-auto">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => selectSuggestion(suggestion)}
                          className="w-full text-left px-4 py-3 hover:bg-emerald-50 text-gray-700 border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 text-emerald-500 mr-3" />
                            {suggestion}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center mt-2 sm:mt-0 sm:ml-2">
                  <div className="relative flex-1 mr-2">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="date"
                      className="w-full pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-700"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-emerald-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center"
                  >
                    <Search className="h-5 w-5 mr-2" />
                    Buscar
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div className="animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              <div className="text-3xl sm:text-4xl font-bold text-white mb-2">200+</div>
              <div className="text-white/80 text-lg">Destinos</div>
            </div>
            <div className="animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
              <div className="text-3xl sm:text-4xl font-bold text-white mb-2">50k+</div>
              <div className="text-white/80 text-lg">Viajeros Felices</div>
            </div>
            <div className="animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
              <div className="text-3xl sm:text-4xl font-bold text-white mb-2">4.9★</div>
              <div className="text-white/80 text-lg">Calificación</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
        <div className="animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
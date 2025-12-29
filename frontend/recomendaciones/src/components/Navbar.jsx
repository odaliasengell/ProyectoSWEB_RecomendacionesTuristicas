import { useState, useContext } from 'react';
import { Menu, X, MapPin } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { NotificationPanel } from './notifications/NotificationPanel';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav style={{ 
        position: 'fixed', 
        top: 0, 
        width: '100%', 
        background: 'rgba(255, 255, 255, 0.95)', 
        backdropFilter: 'blur(10px)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', 
        zIndex: 50 
      }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <MapPin className="h-8 w-8 text-emerald-600" />
              <span className="text-xl font-bold text-gray-800">
                Explora Ecuador
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive('/') ? 'text-emerald-600 bg-emerald-50' : 'text-gray-700 hover:text-emerald-600'
                  }`}
                >
                  Inicio
                </Link>
                <Link
                  to="/destinos"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive('/destinos') ? 'text-emerald-600 bg-emerald-50' : 'text-gray-700 hover:text-emerald-600'
                  }`}
                >
                  Destinos
                </Link>
                <Link
                  to="/tours"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive('/tours') ? 'text-emerald-600 bg-emerald-50' : 'text-gray-700 hover:text-emerald-600'
                  }`}
                >
                  Tours
                </Link>
                <Link
                  to="/services"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive('/services') ? 'text-emerald-600 bg-emerald-50' : 'text-gray-700 hover:text-emerald-600'
                  }`}
                >
                  Servicios
                </Link>
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive('/dashboard') ? 'text-emerald-600 bg-emerald-50' : 'text-gray-700 hover:text-emerald-600'
                  }`}
                >
                  📊 Dashboard
                </Link>
              </div>
            </div>

            {/* User Actions - Login/Notifications/Profile */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated && user ? (
                <>
                  {/* Panel de Notificaciones */}
                  <NotificationPanel />
                  
                  {/* Información del Usuario */}
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-700">
                        Hola, {user.nombre || user.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user.email}
                      </p>
                    </div>
                    
                    {/* Avatar */}
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {(user.nombre || user.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    
                    {/* Botón de Logout */}
                    <button
                      onClick={() => {
                        if (logout) logout();
                        window.location.href = '/';
                      }}
                      className="text-gray-500 hover:text-red-600 text-sm font-medium transition-colors duration-200"
                      title="Cerrar sesión"
                    >
                      Salir
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-6 py-2 rounded-full font-medium hover:from-emerald-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Iniciar Sesión
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="text-gray-700 hover:text-emerald-600 p-2"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
                <Link
                  to="/"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/') ? 'text-emerald-600 bg-emerald-50' : 'text-gray-700 hover:text-emerald-600'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Inicio
                </Link>
                <Link
                  to="/destinos"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/destinos') ? 'text-emerald-600 bg-emerald-50' : 'text-gray-700 hover:text-emerald-600'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Destinos
                </Link>
                <Link
                  to="/tours"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/tours') ? 'text-emerald-600 bg-emerald-50' : 'text-gray-700 hover:text-emerald-600'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Tours
                </Link>
                <Link
                  to="/services"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/services') ? 'text-emerald-600 bg-emerald-50' : 'text-gray-700 hover:text-emerald-600'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Servicios
                </Link>
                <button
                  onClick={() => {
                    setShowLoginModal(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-3 py-2 rounded-md text-base font-medium mt-2"
                >
                  Iniciar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Iniciar Sesión</h2>
              <button
                onClick={() => setShowLoginModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                  placeholder="tu@email.com"
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 text-white py-2 rounded-lg font-medium hover:from-emerald-600 hover:to-blue-700 transition-all duration-300"
              >
                Ingresar
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
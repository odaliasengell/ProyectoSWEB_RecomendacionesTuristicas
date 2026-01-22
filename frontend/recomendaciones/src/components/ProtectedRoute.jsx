import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  console.log('🛡️ ProtectedRoute - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #d1fae5 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '3rem', 
            marginBottom: '1rem',
            animation: 'spin 1s linear infinite' 
          }}>
            🔄
          </div>
          <p style={{ color: '#374151', fontSize: '1.1rem' }}>
            Verificando acceso...
          </p>
        </div>
        <style jsx="true">{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Redirigir al login si no está autenticado, guardando la ubicación actual
  if (!isAuthenticated) {
    console.log('❌ No autenticado, redirigiendo a login desde:', location.pathname);
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }

  console.log('✅ Autenticado, mostrando contenido protegido');
  // Renderizar el componente protegido si está autenticado
  return children;
};

export default ProtectedRoute;
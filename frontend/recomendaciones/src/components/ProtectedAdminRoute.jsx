import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader } from 'lucide-react';

const ProtectedAdminRoute = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      // Opción 1: Sistema admin antiguo (adminToken + adminData)
      const adminToken = localStorage.getItem('adminToken');
      const adminData = localStorage.getItem('adminData');

      if (adminToken && adminData) {
        try {
          const admin = JSON.parse(adminData);
          // Verificar que sea el usuario admin
          if (admin.email === 'admin@turismo.com') {
            setIsAuthenticated(true);
            setIsChecking(false);
            return;
          }
        } catch (error) {
          console.error('Error parsing admin data:', error);
        }
      }

      // Opción 2: Sistema JWT de Auth Service (verificar rol admin)
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('userData');

      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          console.log('🔍 [ProtectedAdminRoute] Usuario:', user);
          console.log('🔍 [ProtectedAdminRoute] Rol:', user.role);

          // Verificar que sea admin
          if (user.role === 'admin') {
            console.log(
              '✅ [ProtectedAdminRoute] Acceso admin permitido para:',
              user.email,
            );
            setIsAuthenticated(true);
          } else {
            console.warn(
              '❌ [ProtectedAdminRoute] Usuario no es admin:',
              user.role,
            );
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }

      setIsChecking(false);
    };

    checkAuth();
  }, []);

  if (isChecking) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background:
            'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #06b6d4 100%)',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            color: 'white',
          }}
        >
          <div className="animate-spin">
            <Loader size={48} />
          </div>
          <p style={{ marginTop: '1rem', fontSize: '1.125rem' }}>
            Verificando acceso de administrador...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;

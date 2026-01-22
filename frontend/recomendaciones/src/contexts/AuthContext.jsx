import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import Notification from '../components/Notification';
import authService from '../services/authService';

const AuthContext = createContext();

export { AuthContext };

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });
  const refreshTimerRef = useRef(null);

  // Función para mostrar notificaciones
  const showNotification = (message, type = 'info') => {
    setNotification({ show: true, message, type });
  };

  // Limpiar timer de renovación al desmontar
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);

  // Función para renovar el token automáticamente
  const setupTokenRefresh = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    const expiresIn = parseInt(localStorage.getItem('tokenExpiresIn') || '0');

    if (refreshToken && expiresIn > 0) {
      // Configurar renovación 2 minutos antes de expirar
      refreshTimerRef.current = authService.setupAutoRefresh(async () => {
        try {
          const result = await authService.refreshToken(refreshToken);
          
          if (result.success) {
            // Actualizar tokens
            localStorage.setItem('token', result.accessToken);
            localStorage.setItem('refreshToken', result.refreshToken);
            localStorage.setItem('tokenExpiresIn', result.expiresIn);
            
            console.log('🔄 Token renovado automáticamente');
            
            // Configurar próxima renovación
            setupTokenRefresh();
          }
        } catch (error) {
          console.error('Error al renovar token:', error);
          // Si falla la renovación, cerrar sesión
          logout();
        }
      }, expiresIn);
    }
  };

  // Verificar token al cargar la app
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // Configurar renovación automática
        setupTokenRefresh();
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('tokenExpiresIn');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials) => {
    setIsLoading(true);
    setError('');

    try {
      // Usar el Auth Service
      const result = await authService.login(credentials);
      
      if (result.success) {
        // Guardar tokens y datos del usuario
        localStorage.setItem('token', result.accessToken);
        localStorage.setItem('refreshToken', result.refreshToken);
        localStorage.setItem('userData', JSON.stringify(result.user));
        localStorage.setItem('tokenExpiresIn', result.expiresIn);
        
        console.log('👤 AuthContext - Usuario guardado:', result.user);
        console.log('🔑 AuthContext - Tokens guardados');
        
        setUser(result.user);
        
        // Configurar renovación automática
        setupTokenRefresh();
        
        console.log('✅ AuthContext - Estado actualizado, isAuthenticated debería ser true');
        showNotification('¡Bienvenido de vuelta! Has iniciado sesión correctamente.', 'success');
        return { success: true };
      }
    } catch (error) {
      console.error('Error de login:', error);
      const errorMessage = error.message || 'Error de conexión con el servidor. Intenta nuevamente.';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    setError('');

    try {
      // Usar el Auth Service
      const result = await authService.register(userData);
      
      if (result.success) {
        // Guardar tokens y datos del usuario
        localStorage.setItem('token', result.accessToken);
        localStorage.setItem('refreshToken', result.refreshToken);
        localStorage.setItem('userData', JSON.stringify(result.user));
        localStorage.setItem('tokenExpiresIn', result.expiresIn);
        
        setUser(result.user);
        
        // Configurar renovación automática
        setupTokenRefresh();
        
        showNotification('¡Cuenta creada exitosamente! Bienvenido a Explora Ecuador.', 'success');
        return { success: true };
      }
    } catch (error) {
      console.error('Error de registro:', error);
      const errorMessage = error.message || 'Error de conexión con el servidor. Intenta nuevamente.';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    
    // Limpiar timer de renovación
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }
    
    // Cerrar sesión en el servidor
    if (token && refreshToken) {
      try {
        await authService.logout(token, refreshToken);
      } catch (error) {
        console.error('Error al cerrar sesión en el servidor:', error);
      }
    }
    
    // Limpiar localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('tokenExpiresIn');
    
    setUser(null);
    setError('');
    showNotification('Has cerrado sesión correctamente. ¡Hasta pronto!', 'info');
  };

  const clearError = () => {
    setError('');
  };

  const clearNotification = () => {
    setNotification({ show: false, message: '', type: 'info' });
  };

  const updateProfile = async (updatedData) => {
    try {
      // Obtener el ID del usuario (puede estar en diferentes campos)
      let userId = user.id || user._id || user.id_usuario;
      
      // Si no hay ID, intentar obtenerlo desde el backend usando el email
      if (!userId) {
        console.warn('⚠️ Usuario sin ID, intentando obtener del backend por email...');
        
        try {
          const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
          const searchResponse = await fetch(`${API_URL}/usuarios/buscar-por-email?email=${user.email}`, {
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
              'Content-Type': 'application/json',
            }
          });
          
          if (searchResponse.ok) {
            const userData = await searchResponse.json();
            userId = userData.id;
            
            // Actualizar el usuario en memoria y localStorage con el ID
            const updatedUser = { ...user, id: userId, id_usuario: userId };
            setUser(updatedUser);
            localStorage.setItem('userData', JSON.stringify(updatedUser));
            
            console.log('✅ ID de usuario obtenido:', userId);
          }
        } catch (error) {
          console.error('Error al buscar usuario por email:', error);
        }
      }
      
      if (!userId) {
        console.error('❌ No se encontró ID de usuario:', user);
        return { success: false, error: 'No se pudo identificar al usuario. Por favor, cierra sesión y vuelve a iniciar sesión.' };
      }
      
      console.log('📝 Actualizando perfil del usuario:', userId);
      
      // Hacer llamada al backend para actualizar el perfil
      const response = await fetch(`${API_URL}/usuarios/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: updatedData.firstName,
          apellido: updatedData.lastName,
          email: updatedData.email,
          username: updatedData.username,
          fecha_nacimiento: updatedData.birthDate,
          pais: updatedData.country
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Perfil actualizado en el backend:', result);
        
        // Actualizar en el estado local
        const updatedUser = { ...user, ...updatedData, id: userId, id_usuario: userId };
        setUser(updatedUser);
        localStorage.setItem('userData', JSON.stringify(updatedUser));
        
        return { success: true };
      } else {
        const errorData = await response.json();
        console.error('❌ Error al actualizar perfil:', response.status, errorData);
        return { success: false, error: errorData.detail || 'Error al actualizar el perfil' };
      }
    } catch (error) {
      console.error('❌ Error en updateProfile:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    isLoading,
    error,
    notification,
    login,
    register,
    logout,
    clearError,
    showNotification,
    clearNotification,
    updateProfile,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <Notification
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={clearNotification}
        duration={4000}
      />
    </AuthContext.Provider>
  );
};
import React, { createContext, useContext, useState, useEffect } from 'react';
import Notification from '../components/Notification';

// URL del backend Python
const API_URL = 'http://localhost:8000';

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

  // Función para mostrar notificaciones
  const showNotification = (message, type = 'info') => {
    setNotification({ show: true, message, type });
  };

  // Verificar token al cargar la app
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials) => {
    setIsLoading(true);
    setError('');

    try {
      // Llamar al endpoint de login del backend (POST /usuarios/login)
      const response = await fetch(`${API_URL}/usuarios/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email || credentials.username, // Aceptar email o username
          password: credentials.password
        })
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.access_token;
        const backendUser = data.user;
        
        // Mapear datos del backend al formato del frontend
        const user = {
          id: backendUser.id,
          id_usuario: backendUser.id,
          firstName: backendUser.nombre,
          lastName: backendUser.apellido,
          email: backendUser.email,
          username: backendUser.username,
          birthDate: backendUser.fecha_nacimiento,
          createdAt: backendUser.fecha_registro
        };
        
        // Guardar en localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('userData', JSON.stringify(user));
        
        setUser(user);
        showNotification('¡Bienvenido de vuelta! Has iniciado sesión correctamente.', 'success');
        return { success: true };
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Credenciales incorrectas' }));
        const errorMessage = errorData.detail || 'Credenciales incorrectas';
        setError(errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      console.error('Error de login:', error);
      const errorMessage = 'Error de conexión con el servidor. Intenta nuevamente.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    setError('');

    try {
      // Enviar datos al endpoint de registro (POST /usuarios/register)
      const response = await fetch(`${API_URL}/usuarios/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: userData.firstName,
          apellido: userData.lastName,
          email: userData.email,
          username: userData.username,
          password: userData.password,
          fecha_nacimiento: userData.birthDate || null,
          pais: userData.country || 'Ecuador'
        })
      });

      if (response.ok) {
        const backendUser = await response.json();
        
        // Después de registrar, hacer login automáticamente con las credenciales
        const loginResult = await login({
          email: userData.email,
          password: userData.password
        });
        
        if (loginResult.success) {
          showNotification('¡Cuenta creada exitosamente! Bienvenido a Explora Ecuador.', 'success');
          return { success: true };
        } else {
          // Si el login falla, al menos informamos que el registro fue exitoso
          showNotification('Cuenta creada exitosamente. Por favor inicia sesión.', 'success');
          return { success: true };
        }
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.detail || 'Error al crear la cuenta';
        setError(errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      console.error('Error de registro:', error);
      const errorMessage = 'Error de conexión con el servidor. Intenta nuevamente.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
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
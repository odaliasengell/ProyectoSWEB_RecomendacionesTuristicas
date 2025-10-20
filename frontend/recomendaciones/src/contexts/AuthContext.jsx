import React, { createContext, useContext, useState, useEffect } from 'react';
import Notification from '../components/Notification';

const AuthContext = createContext();

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

  // Simular verificación de token al cargar la app
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    
    // Inicializar usuarios de prueba si no existen
    const existingUsers = localStorage.getItem('registeredUsers');
    if (!existingUsers) {
      const defaultUsers = [
        {
          id: 1,
          firstName: 'Admin',
          lastName: 'Ecuador',
          email: 'admin@exploraecuador.com',
          username: 'admin',
          password: 'Admin123',
          birthDate: '1990-01-01',
          bio: 'Administrador de Explora Ecuador. Apasionado por mostrar las maravillas naturales y culturales de nuestro hermoso país.',
          favoriteDestination: 'Islas Galápagos',
          travelStyle: 'ecologico',
          createdAt: '2025-01-01T00:00:00.000Z'
        },
        {
          id: 2,
          firstName: 'Usuario',
          lastName: 'Prueba',
          email: 'usuario1@test.com',
          username: 'usuario1',
          password: 'Test123',
          birthDate: '1995-05-15',
          bio: 'Aventurero de corazón, siempre buscando nuevas experiencias en Ecuador. Me encanta el senderismo y la fotografía de naturaleza.',
          favoriteDestination: 'Quilotoa',
          travelStyle: 'aventura',
          createdAt: '2025-01-01T00:00:00.000Z'
        },
        {
          id: 3,
          firstName: 'María',
          lastName: 'Quintana',
          email: 'maria@ecuador.com',
          username: 'maria_ecuador',
          password: 'Ecuador2025',
          birthDate: '1988-12-03',
          bio: 'Guía turística local con 10 años de experiencia. Especializada en turismo cultural y gastronómico del Ecuador.',
          favoriteDestination: 'Centro Histórico de Quito',
          travelStyle: 'cultural',
          createdAt: '2025-01-01T00:00:00.000Z'
        }
      ];
      localStorage.setItem('registeredUsers', JSON.stringify(defaultUsers));
    }
    
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
      // Simular API call - reemplazar con tu endpoint real
      const response = await simulateLogin(credentials);
      
      if (response.success) {
        const { user, token } = response.data;
        
        // Guardar en localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('userData', JSON.stringify(user));
        
        setUser(user);
        showNotification('¡Bienvenido de vuelta! Has iniciado sesión correctamente.', 'success');
        return { success: true };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      const errorMessage = 'Error de conexión. Intenta nuevamente.';
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
      // Enviar datos al backend real de Python
      const response = await fetch('http://localhost:8000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: userData.firstName,
          apellido: userData.lastName,
          email: userData.email,
          username: userData.username,
          contraseña: userData.password,
          fecha_nacimiento: userData.birthDate || null,
          pais: userData.country || 'Ecuador'
        })
      });

      if (response.ok) {
        const backendUser = await response.json();
        
        // Crear el usuario en el formato del frontend
        const user = {
          id: backendUser.id_usuario,
          firstName: backendUser.nombre,
          lastName: backendUser.apellido,
          email: backendUser.email,
          username: backendUser.username,
          birthDate: backendUser.fecha_nacimiento,
          createdAt: new Date().toISOString()
        };
        
        // También guardarlo en localStorage para mantener compatibilidad
        const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        existingUsers.push(user);
        localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
        
        // Guardar token simulado y datos del usuario
        const token = `token_${Date.now()}_${Math.random()}`;
        localStorage.setItem('token', token);
        localStorage.setItem('userData', JSON.stringify(user));
        
        setUser(user);
        showNotification('¡Cuenta creada exitosamente! Bienvenido a Explora Ecuador.', 'success');
        return { success: true };
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

  const updateProfile = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem('userData', JSON.stringify(updatedUser));
    
    // También actualizar en la lista de usuarios registrados
    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const userIndex = existingUsers.findIndex(u => u.id === user.id);
    
    if (userIndex !== -1) {
      existingUsers[userIndex] = { ...existingUsers[userIndex], ...updatedData };
      localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
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

// Simulación de API calls - reemplazar con llamadas reales a tu backend
const simulateLogin = async (credentials) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simular usuarios existentes
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const user = users.find(u => 
        (u.email === credentials.username || u.username === credentials.username) &&
        u.password === credentials.password
      );

      if (user) {
        const { password, ...userWithoutPassword } = user;
        resolve({
          success: true,
          data: {
            user: userWithoutPassword,
            token: `token_${Date.now()}_${Math.random()}`
          }
        });
      } else {
        resolve({
          success: false,
          message: 'Credenciales incorrectas'
        });
      }
    }, 1000); // Simular delay de red
  });
};

const simulateRegister = async (userData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      
      // Verificar si el usuario ya existe
      const existingUser = users.find(u => 
        u.email === userData.email || u.username === userData.username
      );

      if (existingUser) {
        resolve({
          success: false,
          message: 'El email o username ya están registrados'
        });
        return;
      }

      // Crear nuevo usuario
      const newUser = {
        id: Date.now(),
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        username: userData.username,
        password: userData.password, // En producción, esto debe estar hasheado
        birthDate: userData.birthDate,
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      localStorage.setItem('registeredUsers', JSON.stringify(users));

      const { password, ...userWithoutPassword } = newUser;
      resolve({
        success: true,
        data: {
          user: userWithoutPassword,
          token: `token_${Date.now()}_${Math.random()}`
        }
      });
    }, 1500); // Simular delay de red
  });
};
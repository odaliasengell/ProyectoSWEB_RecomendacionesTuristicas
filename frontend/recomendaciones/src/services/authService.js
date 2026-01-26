/**
 * Auth Service - Cliente para el microservicio de autenticación
 * Conecta con el Auth Service en puerto 8001
 */

const AUTH_SERVICE_URL = 'http://localhost:8001';

class AuthService {
  /**
   * Registrar nuevo usuario
   */
  async register(userData) {
    try {
      const response = await fetch(`${AUTH_SERVICE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          full_name:
            userData.fullName || `${userData.firstName} ${userData.lastName}`,
          role: userData.role || 'user',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error en el registro');
      }

      return {
        success: true,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        user: this.mapUserFromAuthService(data.user),
        expiresIn: data.expires_in,
      };
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  }

  /**
   * Iniciar sesión
   */
  async login(credentials) {
    try {
      const requestBody = {
        email: credentials.email || credentials.username,
        password: credentials.password,
      };

      console.log('🔑 [AuthService] Enviando login con:', {
        email: requestBody.email,
        password: '****',
      });
      console.log('🔗 [AuthService] URL:', `${AUTH_SERVICE_URL}/auth/login`);

      const response = await fetch(`${AUTH_SERVICE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      console.log('📡 [AuthService] Response status:', response.status);
      console.log('📦 [AuthService] Response data:', data);

      if (!response.ok) {
        throw new Error(data.detail || 'Credenciales incorrectas');
      }

      return {
        success: true,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        user: this.mapUserFromAuthService(data.user),
        expiresIn: data.expires_in,
      };
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  /**
   * Renovar access token usando refresh token
   */
  async refreshToken(refreshToken) {
    try {
      const response = await fetch(`${AUTH_SERVICE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error al renovar token');
      }

      return {
        success: true,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        user: this.mapUserFromAuthService(data.user),
        expiresIn: data.expires_in,
      };
    } catch (error) {
      console.error('Error al renovar token:', error);
      throw error;
    }
  }

  /**
   * Cerrar sesión
   */
  async logout(accessToken, refreshToken) {
    try {
      const response = await fetch(`${AUTH_SERVICE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: accessToken,
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        console.warn('Error al cerrar sesión en el servidor');
      }

      return { success: true };
    } catch (error) {
      console.error('Error en logout:', error);
      // No lanzamos error para permitir logout local
      return { success: true };
    }
  }

  /**
   * Obtener usuario actual
   */
  async getCurrentUser(accessToken) {
    try {
      const response = await fetch(`${AUTH_SERVICE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error al obtener usuario');
      }

      return {
        success: true,
        user: this.mapUserFromAuthService(data),
      };
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      throw error;
    }
  }

  /**
   * Validar token
   */
  async validateToken(token) {
    try {
      const response = await fetch(`${AUTH_SERVICE_URL}/auth/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { valid: false };
      }

      return {
        valid: data.valid,
        userId: data.user_id,
        email: data.email,
        role: data.role,
        error: data.error,
      };
    } catch (error) {
      console.error('Error al validar token:', error);
      return { valid: false };
    }
  }

  /**
   * Mapear usuario del Auth Service al formato del frontend
   */
  mapUserFromAuthService(authUser) {
    // Separar nombre completo en firstName y lastName
    const nameParts = authUser.full_name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    return {
      id: authUser.id,
      id_usuario: authUser.id,
      email: authUser.email,
      username: authUser.email, // Usar email como username
      firstName: firstName,
      lastName: lastName,
      fullName: authUser.full_name,
      role: authUser.role,
      isActive: authUser.is_active,
    };
  }

  /**
   * Verificar si el token está próximo a expirar (menos de 2 minutos)
   */
  isTokenExpiringSoon(expiresIn) {
    return expiresIn < 120; // 2 minutos en segundos
  }

  /**
   * Configurar renovación automática del token
   */
  setupAutoRefresh(refreshCallback, expiresIn) {
    // Renovar 2 minutos antes de que expire
    const refreshTime = (expiresIn - 120) * 1000;

    if (refreshTime > 0) {
      return setTimeout(refreshCallback, refreshTime);
    }

    return null;
  }
}

export default new AuthService();

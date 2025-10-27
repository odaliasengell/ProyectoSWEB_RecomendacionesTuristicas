import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export class AuthMiddleware {
  private static jwtSecret = process.env.JWT_SECRET || 'tu-secreto-super-seguro-websocket-2024';

  /**
   * Middleware para validar tokens JWT
   */
  static validateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        return res.status(401).json({
          success: false,
          message: 'Token de autorización requerido'
        });
      }

      const token = authHeader.split(' ')[1]; // Bearer <token>
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Formato de token inválido. Use: Bearer <token>'
        });
      }

      const decoded = jwt.verify(token, AuthMiddleware.jwtSecret) as any;
      req.user = decoded;
      
      console.log(`🔐 Usuario autenticado: ${decoded.email} (${decoded.role})`);
      next();
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expirado'
        });
      }
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Token inválido'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Error de autenticación',
        error: error.message
      });
    }
  }

  /**
   * Middleware para validar roles específicos
   */
  static requireRole(roles: string[]) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: `Acceso denegado. Roles requeridos: ${roles.join(', ')}`
        });
      }

      next();
    };
  }

  /**
   * Middleware opcional para rutas que pueden funcionar con o sin autenticación
   */
  static optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;
      
      if (authHeader) {
        const token = authHeader.split(' ')[1];
        if (token) {
          const decoded = jwt.verify(token, AuthMiddleware.jwtSecret) as any;
          req.user = decoded;
          console.log(`🔐 Usuario autenticado (opcional): ${decoded.email}`);
        }
      }
      
      next();
    } catch (error) {
      // En modo opcional, simplemente continúa sin autenticación
      next();
    }
  }

  /**
   * Genera un token JWT para testing
   */
  static generateTestToken(userId: string, email: string, role: string = 'user'): string {
    return jwt.sign(
      { id: userId, email, role },
      AuthMiddleware.jwtSecret,
      { expiresIn: '24h' }
    );
  }
}
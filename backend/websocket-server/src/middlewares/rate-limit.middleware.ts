import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

export class RateLimitMiddleware {
  
  /**
   * Rate limit general para todas las rutas API
   */
  static general = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por ventana de tiempo por IP
    message: {
      success: false,
      message: 'Demasiadas peticiones desde esta IP, intenta de nuevo en 15 minutos',
      retryAfter: '15 minutos'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      console.log(`🚫 Rate limit excedido para IP: ${req.ip}`);
      res.status(429).json({
        success: false,
        message: 'Demasiadas peticiones desde esta IP, intenta de nuevo en 15 minutos',
        retryAfter: '15 minutos'
      });
    }
  });

  /**
   * Rate limit estricto para rutas de autenticación
   */
  static auth = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // máximo 5 intentos de login por IP
    message: {
      success: false,
      message: 'Demasiados intentos de autenticación, intenta de nuevo en 15 minutos',
      retryAfter: '15 minutos'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // no contar requests exitosos
    handler: (req: Request, res: Response) => {
      console.log(`🚫 Rate limit de autenticación excedido para IP: ${req.ip}`);
      res.status(429).json({
        success: false,
        message: 'Demasiados intentos de autenticación fallidos, intenta de nuevo en 15 minutos',
        retryAfter: '15 minutos'
      });
    }
  });

  /**
   * Rate limit para WebSocket connections
   */
  static websocket = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 10, // máximo 10 conexiones WebSocket por minuto por IP
    message: {
      success: false,
      message: 'Demasiadas conexiones WebSocket desde esta IP',
      retryAfter: '1 minuto'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      console.log(`🚫 Rate limit WebSocket excedido para IP: ${req.ip}`);
      res.status(429).json({
        success: false,
        message: 'Demasiadas conexiones WebSocket desde esta IP, intenta de nuevo en 1 minuto',
        retryAfter: '1 minuto'
      });
    }
  });

  /**
   * Rate limit para notificaciones (endpoint /notify)
   */
  static notifications = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 30, // máximo 30 notificaciones por minuto por IP
    message: {
      success: false,
      message: 'Demasiadas notificaciones enviadas desde esta IP',
      retryAfter: '1 minuto'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      console.log(`🚫 Rate limit de notificaciones excedido para IP: ${req.ip}`);
      res.status(429).json({
        success: false,
        message: 'Demasiadas notificaciones enviadas, intenta de nuevo en 1 minuto',
        retryAfter: '1 minuto'
      });
    }
  });

  /**
   * Rate limit flexible para proxying a otros servicios
   */
  static proxy = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 60, // máximo 60 requests por minuto por IP a través del proxy
    message: {
      success: false,
      message: 'Demasiadas peticiones al gateway, intenta de nuevo en 1 minuto',
      retryAfter: '1 minuto'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      console.log(`🚫 Rate limit del proxy excedido para IP: ${req.ip} - Ruta: ${req.path}`);
      res.status(429).json({
        success: false,
        message: 'Demasiadas peticiones al gateway, intenta de nuevo en 1 minuto',
        retryAfter: '1 minuto'
      });
    }
  });
}
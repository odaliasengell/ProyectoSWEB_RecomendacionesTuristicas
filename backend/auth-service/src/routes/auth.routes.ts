import { Router, Request, Response, NextFunction } from 'express';
import { RateLimitRequestHandler } from 'express-rate-limit';
import { authService } from '../services/auth.service';
import { validateJWT } from '../middleware/jwt.middleware';

export function authRoutes(loginLimiter: RateLimitRequestHandler): Router {
  const router = Router();

  // POST /auth/register
  router.post(
    '/register',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { email, password, name } = req.body;

        if (!email || !password) {
          return res
            .status(400)
            .json({ error: 'Email y contraseña requeridos' });
        }

        const user = await authService.register(email, password, name);
        res
          .status(201)
          .json({ message: 'Usuario registrado exitosamente', user });
      } catch (error) {
        next(error);
      }
    }
  );

  // POST /auth/login
  router.post(
    '/login',
    loginLimiter,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { email, password } = req.body;

        if (!email || !password) {
          return res
            .status(400)
            .json({ error: 'Email y contraseña requeridos' });
        }

        const tokens = await authService.login(email, password);
        res.json(tokens);
      } catch (error) {
        next(error);
      }
    }
  );

  // POST /auth/refresh
  router.post(
    '/refresh',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
          return res.status(400).json({ error: 'Refresh token requerido' });
        }

        const tokens = await authService.refresh(refreshToken);
        res.json(tokens);
      } catch (error) {
        next(error);
      }
    }
  );

  // GET /auth/me
  router.get(
    '/me',
    validateJWT,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = (req as any).userId;
        const user = await authService.getUser(userId);
        res.json(user);
      } catch (error) {
        next(error);
      }
    }
  );

  // POST /auth/logout
  router.post(
    '/logout',
    validateJWT,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = (req as any).userId;
        const token = (req as any).token;

        await authService.logout(userId, token);
        res.json({ message: 'Sesión cerrada' });
      } catch (error) {
        next(error);
      }
    }
  );

  // GET /auth/validate (interno)
  router.get(
    '/validate',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
          return res
            .status(401)
            .json({ valid: false, error: 'Token no proporcionado' });
        }

        const decoded = await authService.validateToken(token);
        res.json({ valid: true, decoded });
      } catch (error) {
        res.status(401).json({ valid: false, error: error.message });
      }
    }
  );

  // GET /auth/public-key (para validación local en otros servicios)
  router.get('/public-key', (req: Request, res: Response) => {
    // En un entorno real, usar claves RSA
    res.json({
      publicKey: process.env.JWT_PUBLIC_KEY || 'public-key-placeholder',
      algorithm: 'HS256',
      keyId: 'auth-service-1',
    });
  });

  return router;
}

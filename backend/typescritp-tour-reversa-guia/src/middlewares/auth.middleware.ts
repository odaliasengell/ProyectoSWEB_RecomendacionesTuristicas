import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/environment';
import { ResponseUtil } from '../utils/response.util';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return ResponseUtil.unauthorized(res, 'Token no proporcionado');
  }

  try {
    const payload = jwt.verify(token, config.jwt.secret);
    // adjuntar payload si se necesita en controladores
    (req as any).user = payload;
    next();
  } catch (error: any) {
    return ResponseUtil.unauthorized(res, 'Token inválido');
  }
};

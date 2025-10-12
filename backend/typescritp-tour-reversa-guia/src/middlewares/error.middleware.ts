import { Request, Response, NextFunction } from 'express';
import { ResponseUtil } from '../utils/response.util';

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Middleware de error:', err);
  return ResponseUtil.error(res, err.message || 'Error interno del servidor', err.status || 500, err.errors);
};

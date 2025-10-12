import { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { ResponseUtil } from '../utils/response.util';

export const validationMiddleware = (dtoClass: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dtoObj = plainToClass(dtoClass, req.body);
    const errors = await validate(dtoObj);
    if (errors.length > 0) {
      return ResponseUtil.badRequest(res, 'Errores de validación', errors);
    }
    next();
  };
};

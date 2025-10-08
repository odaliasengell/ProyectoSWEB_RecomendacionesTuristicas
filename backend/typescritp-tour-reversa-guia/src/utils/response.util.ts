import type { Response } from 'express';

export class ResponseUtil {
  static success(res: Response, data: any, message: string = 'Operación exitosa', statusCode: number = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  static error(res: Response, message: string = 'Error en la operación', statusCode: number = 500, errors?: any) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString(),
    });
  }

  static created(res: Response, data: any, message: string = 'Recurso creado exitosamente') {
    return this.success(res, data, message, 201);
  }

  static notFound(res: Response, message: string = 'Recurso no encontrado') {
    return this.error(res, message, 404);
  }

  static badRequest(res: Response, message: string = 'Solicitud inválida', errors?: any) {
    return this.error(res, message, 400, errors);
  }

  static unauthorized(res: Response, message: string = 'No autorizado') {
    return this.error(res, message, 401);
  }
}
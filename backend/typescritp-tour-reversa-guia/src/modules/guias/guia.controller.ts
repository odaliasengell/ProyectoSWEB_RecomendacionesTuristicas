import type { Request, Response } from 'express';
import { GuiaService } from './guia.service';
import { ResponseUtil } from '../../utils/response.util';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateGuiaDto } from './dto/create-guia.dto';
import { UpdateGuiaDto } from './dto/update-guia.dto';

export class GuiaController {
  private guiaService: GuiaService;

  constructor() {
    this.guiaService = new GuiaService();
  }

  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const guias = await this.guiaService.findAll();
      return ResponseUtil.success(res, guias, 'Guías obtenidos exitosamente');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  }

  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      if (!id) {
        return ResponseUtil.badRequest(res, 'ID de guía es requerido');
      }
      const guia = await this.guiaService.findById(parseInt(id));

      if (!guia) {
        return ResponseUtil.notFound(res, 'Guía no encontrado');
      }

      return ResponseUtil.success(res, guia, 'Guía obtenido exitosamente');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  }

  async getAvailable(req: Request, res: Response): Promise<Response> {
    try {
      const guias = await this.guiaService.findAvailable();
      return ResponseUtil.success(res, guias, 'Guías disponibles obtenidos exitosamente');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  }

  async create(req: Request, res: Response): Promise<Response> {
    try {
      const createGuiaDto = plainToClass(CreateGuiaDto, req.body);
      const errors = await validate(createGuiaDto);

      if (errors.length > 0) {
        return ResponseUtil.badRequest(res, 'Errores de validación', errors);
      }

      const guia = await this.guiaService.create(createGuiaDto);
      return ResponseUtil.created(res, guia, 'Guía creado exitosamente');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  }

  async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      if (!id) {
        return ResponseUtil.badRequest(res, 'ID de guía es requerido');
      }
      const updateGuiaDto = plainToClass(UpdateGuiaDto, req.body);
      const errors = await validate(updateGuiaDto);

      if (errors.length > 0) {
        return ResponseUtil.badRequest(res, 'Errores de validación', errors);
      }

      const guia = await this.guiaService.update(parseInt(id), updateGuiaDto);
      return ResponseUtil.success(res, guia, 'Guía actualizado exitosamente');
    } catch (error: any) {
      if (error.message === 'Guía no encontrado') {
        return ResponseUtil.notFound(res, error.message);
      }
      return ResponseUtil.error(res, error.message);
    }
  }

  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      if (!id) {
        return ResponseUtil.badRequest(res, 'ID de guía es requerido');
      }
      await this.guiaService.delete(parseInt(id));
      return ResponseUtil.success(res, null, 'Guía eliminado exitosamente');
    } catch (error: any) {
      if (error.message === 'Guía no encontrado') {
        return ResponseUtil.notFound(res, error.message);
      }
      return ResponseUtil.error(res, error.message);
    }
  }

  async toggleDisponibilidad(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      if (!id) {
        return ResponseUtil.badRequest(res, 'ID de guía es requerido');
      }
      const guia = await this.guiaService.toggleDisponibilidad(parseInt(id));
      return ResponseUtil.success(res, guia, 'Disponibilidad actualizada exitosamente');
    } catch (error: any) {
      if (error.message === 'Guía no encontrado') {
        return ResponseUtil.notFound(res, error.message);
      }
      return ResponseUtil.error(res, error.message);
    }
  }
}
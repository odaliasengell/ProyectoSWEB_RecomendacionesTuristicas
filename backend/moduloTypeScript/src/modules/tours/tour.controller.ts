import type { Request } from 'express';
import type { Response } from 'express';
import { TourService } from './tour.service';
import { ResponseUtil } from '../../utils/response.util';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';

export class TourController {
  private tourService: TourService;

  constructor() {
    this.tourService = new TourService();
  }

  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const tours = await this.tourService.findAll();
      return ResponseUtil.success(res, tours, 'Tours obtenidos exitosamente');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  }

  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      if (typeof id !== 'string') {
        return ResponseUtil.badRequest(res, 'ID de tour inválido');
      }
      const tour = await this.tourService.findById(parseInt(id));

      if (!tour) {
        return ResponseUtil.notFound(res, 'Tour no encontrado');
      }

      return ResponseUtil.success(res, tour, 'Tour obtenido exitosamente');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  }

  async getAvailable(req: Request, res: Response): Promise<Response> {
    try {
      const tours = await this.tourService.findAvailable();
      return ResponseUtil.success(res, tours, 'Tours disponibles obtenidos exitosamente');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  }

  async create(req: Request, res: Response): Promise<Response> {
    try {
      const createTourDto = plainToClass(CreateTourDto, req.body);
      const errors = await validate(createTourDto);

      if (errors.length > 0) {
        return ResponseUtil.badRequest(res, 'Errores de validación', errors);
      }

      const tour = await this.tourService.create(createTourDto);
      return ResponseUtil.created(res, tour, 'Tour creado exitosamente');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  }

  async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      if (typeof id !== 'string') {
        return ResponseUtil.badRequest(res, 'ID de tour inválido');
      }
      const updateTourDto = plainToClass(UpdateTourDto, req.body);
      const errors = await validate(updateTourDto);

      if (errors.length > 0) {
        return ResponseUtil.badRequest(res, 'Errores de validación', errors);
      }

      const tour = await this.tourService.update(parseInt(id), updateTourDto);
      return ResponseUtil.success(res, tour, 'Tour actualizado exitosamente');
    } catch (error: any) {
      if (error.message === 'Tour no encontrado') {
        return ResponseUtil.notFound(res, error.message);
      }
      return ResponseUtil.error(res, error.message);
    }
  }

  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      if (typeof id !== 'string') {
        return ResponseUtil.badRequest(res, 'ID de tour inválido');
      }
      await this.tourService.delete(parseInt(id));
      return ResponseUtil.success(res, null, 'Tour eliminado exitosamente');
    } catch (error: any) {
      if (error.message === 'Tour no encontrado') {
        return ResponseUtil.notFound(res, error.message);
      }
      return ResponseUtil.error(res, error.message);
    }
  }

  async toggleDisponibilidad(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      if (typeof id !== 'string') {
        return ResponseUtil.badRequest(res, 'ID de tour inválido');
      }
      const tour = await this.tourService.toggleDisponibilidad(parseInt(id));
      return ResponseUtil.success(res, tour, 'Disponibilidad actualizada exitosamente');
    } catch (error: any) {
      if (error.message === 'Tour no encontrado') {
        return ResponseUtil.notFound(res, error.message);
      }
      return ResponseUtil.error(res, error.message);
    }
  }
}
import type { Request, Response } from 'express';
import { ReservaService } from './reserva.service';
import { ResponseUtil } from '../../utils/response.util';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';

export class ReservaController {
  private reservaService: ReservaService;

  constructor() {
    this.reservaService = new ReservaService();
  }

  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const reservas = await this.reservaService.findAll();
      return ResponseUtil.success(res, reservas, 'Reservas obtenidas exitosamente');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  }

  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      if (!id) {
        return ResponseUtil.badRequest(res, 'ID de reserva no proporcionado');
      }
      const reserva = await this.reservaService.findById(parseInt(id));

      if (!reserva) {
        return ResponseUtil.notFound(res, 'Reserva no encontrada');
      }

      return ResponseUtil.success(res, reserva, 'Reserva obtenida exitosamente');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  }

  async create(req: Request, res: Response): Promise<Response> {
    try {
      const createDto = plainToClass(CreateReservaDto, req.body);
      const errors = await validate(createDto);

      if (errors.length > 0) {
        return ResponseUtil.badRequest(res, 'Errores de validación', errors);
      }

      const reserva = await this.reservaService.create(createDto);
      return ResponseUtil.created(res, reserva, 'Reserva creada exitosamente');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  }

  async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      if (!id) {
        return ResponseUtil.badRequest(res, 'ID de reserva no proporcionado');
      }
      const updateDto = plainToClass(UpdateReservaDto, req.body);
      const errors = await validate(updateDto);

      if (errors.length > 0) {
        return ResponseUtil.badRequest(res, 'Errores de validación', errors);
      }

      const reserva = await this.reservaService.update(parseInt(id), updateDto);
      return ResponseUtil.success(res, reserva, 'Reserva actualizada exitosamente');
    } catch (error: any) {
      if (error.message === 'Reserva no encontrada') {
        return ResponseUtil.notFound(res, error.message);
      }
      return ResponseUtil.error(res, error.message);
    }
  }

  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      if (!id) {
        return ResponseUtil.badRequest(res, 'ID de reserva no proporcionado');
      }
      await this.reservaService.delete(parseInt(id));
      return ResponseUtil.success(res, null, 'Reserva eliminada exitosamente');
    } catch (error: any) {
      if (error.message === 'Reserva no encontrada') {
        return ResponseUtil.notFound(res, error.message);
      }
      return ResponseUtil.error(res, error.message);
    }
  }

  async getByUsuario(req: Request, res: Response): Promise<Response> {
    try {
      const { id_usuario } = req.params;
      if (!id_usuario) {
        return ResponseUtil.badRequest(res, 'ID de usuario no proporcionado');
      }
      const reservas = await this.reservaService.findByUsuario(parseInt(id_usuario));
      return ResponseUtil.success(res, reservas, 'Reservas del usuario obtenidas');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  }
}

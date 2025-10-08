import { Repository } from 'typeorm';
import { AppDataSource } from '../../config/database';
import { Tour } from '../../entities/Tour.entity';
import { Guia } from '../../entities/Guia.entity';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { httpClient } from '../../utils/http-client.util';

export class TourService {
  private tourRepository: Repository<Tour>;
  private guiaRepository: Repository<Guia>;

  constructor() {
    this.tourRepository = AppDataSource.getRepository(Tour);
    this.guiaRepository = AppDataSource.getRepository(Guia);
  }

  async findAll(): Promise<any[]> {
    const tours = await this.tourRepository.find({
      relations: ['guia', 'reservas'],
      order: { createdAt: 'DESC' },
    });

    return tours;
  }

  async findById(id: number): Promise<any | null> {
    const tour = await this.tourRepository.findOne({
      where: { id_tour: id },
      relations: ['guia', 'reservas'],
    });

    if (!tour) {
      return null;
    }

    return tour;
  }

  async findAvailable(): Promise<Tour[]> {
    return await this.tourRepository.find({
      where: { disponible: true },
      relations: ['guia'],
      order: { precio: 'ASC' },
    });
  }

  async create(createTourDto: CreateTourDto): Promise<Tour> {
    // Validar que el guía existe
    const guia = await this.guiaRepository.findOne({
      where: { id_guia: createTourDto.id_guia },
    });

    if (!guia) {
      throw new Error('El guía especificado no existe');
    }

    if (!guia.disponible) {
      throw new Error('El guía no está disponible');
    }



    const tour = this.tourRepository.create(createTourDto);
    const savedTour = await this.tourRepository.save(tour);

    // Notificar al WebSocket
    await httpClient.notifyWebSocket('tour_creado', {
      id_tour: savedTour.id_tour,
      nombre: savedTour.nombre,
      precio: savedTour.precio,
    });

    return savedTour;
  }

  async update(id: number, updateTourDto: UpdateTourDto): Promise<Tour> {
    const tour = await this.tourRepository.findOne({
      where: { id_tour: id },
    });

    if (!tour) {
      throw new Error('Tour no encontrado');
    }

    // Si se actualiza el guía, validar que existe y está disponible
    if (updateTourDto.id_guia) {
      const guia = await this.guiaRepository.findOne({
        where: { id_guia: updateTourDto.id_guia },
      });

      if (!guia) {
        throw new Error('El guía especificado no existe');
      }

      if (!guia.disponible) {
        throw new Error('El guía no está disponible');
      }
    }



    Object.assign(tour, updateTourDto);
    const updatedTour = await this.tourRepository.save(tour);

    // Notificar actualización
    await httpClient.notifyWebSocket('tour_actualizado', {
      id_tour: updatedTour.id_tour,
      nombre: updatedTour.nombre,
    });

    return updatedTour;
  }

  async delete(id: number): Promise<void> {
    const tour = await this.tourRepository.findOne({
      where: { id_tour: id },
      relations: ['reservas'],
    });

    if (!tour) {
      throw new Error('Tour no encontrado');
    }

    if (tour.reservas && tour.reservas.length > 0) {
      throw new Error('No se puede eliminar un tour con reservas activas');
    }

    await this.tourRepository.remove(tour);

    // Notificar eliminación
    await httpClient.notifyWebSocket('tour_eliminado', {
      id_tour: id,
    });
  }

  async toggleDisponibilidad(id: number): Promise<Tour> {
    const tour = await this.tourRepository.findOne({
      where: { id_tour: id },
    });

    if (!tour) {
      throw new Error('Tour no encontrado');
    }

    tour.disponible = !tour.disponible;
    return await this.tourRepository.save(tour);
  }
}
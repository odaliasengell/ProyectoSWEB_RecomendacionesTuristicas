import { AppDataSource } from '../../config/database';
import { Tour } from '../../entities/Tour.entity';
import { Guia } from '../../entities/Guia.entity';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { httpClient } from '../../utils/http-client.util';

export class TourService {
  private tourRepository = AppDataSource.getMongoRepository(Tour);
  private guiaRepository = AppDataSource.getMongoRepository(Guia);

  async findAll(): Promise<Tour[]> {
    return await this.tourRepository.find({
      order: { createdAt: 'DESC' }
    });
  }

  async findById(id: number): Promise<Tour | null> {
    const tour = await this.tourRepository.findOne({
      where: { id_tour: id }
    });

    return tour;
  }

  async findAvailable(): Promise<Tour[]> {
    return await this.tourRepository.find({
      where: { disponible: true },
      order: { precio: 'ASC' }
    });
  }

  async create(createTourDto: CreateTourDto): Promise<Tour> {
    console.log('🔍 Datos recibidos en servicio Tour:', createTourDto);
    
    // Generar id_tour automáticamente si no se proporciona
    if (!createTourDto.id_tour) {
      const allTours = await this.tourRepository.find({
        order: { id_tour: 'DESC' },
      });
      const maxId = allTours.length > 0 ? Math.max(...allTours.map(t => t.id_tour || 0)) : 0;
      createTourDto.id_tour = maxId + 1;
      console.log('✅ ID Tour generado automáticamente:', createTourDto.id_tour);
    }
    
    // Validar que el guía existe (solo si se proporciona)
    if (createTourDto.id_guia) {
      const guia = await this.guiaRepository.findOne({
        where: { id_guia: createTourDto.id_guia }
      });

      if (!guia) {
        throw new Error('El guía especificado no existe');
      }

      if (!guia.disponible) {
        throw new Error('El guía no está disponible');
      }
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
    console.log(`\n🔍 UPDATE TOUR - ID recibido: ${id}`);
    console.log(`📦 Datos recibidos:`, updateTourDto);
    
    const tour = await this.tourRepository.findOne({
      where: { id_tour: id }
    });

    console.log(`🔍 Resultado de búsqueda:`, tour ? `Tour encontrado: ${tour.nombre}` : 'NO encontrado');

    if (!tour) {
      console.log(`❌ Tour NO encontrado con ID: ${id}`);
      throw new Error('Tour no encontrado');
    }

    // Si se actualiza el guía, validar que existe y está disponible
    if (updateTourDto.id_guia) {
      const guia = await this.guiaRepository.findOne({
        where: { id_guia: updateTourDto.id_guia }
      });

      if (!guia) {
        throw new Error('El guía especificado no existe');
      }

      if (!guia.disponible) {
        throw new Error('El guía no está disponible');
      }
    }

    console.log(`💾 Actualizando tour...`);
    // Usar update() en lugar de save() para evitar conflictos con _id
    await this.tourRepository.update(
      { id_tour: id },
      updateTourDto
    );

    // Obtener el tour actualizado
    const updatedTour = await this.tourRepository.findOne({
      where: { id_tour: id }
    });

    if (!updatedTour) {
      throw new Error('Error al obtener el tour actualizado');
    }

    console.log(`✅ Tour actualizado exitosamente`);

    // Notificar actualización
    await httpClient.notifyWebSocket('tour_actualizado', {
      id_tour: updatedTour.id_tour,
      nombre: updatedTour.nombre,
    });

    return updatedTour;
  }

  async delete(id: number): Promise<void> {
    const tour = await this.tourRepository.findOne({
      where: { id_tour: id }
    });

    if (!tour) {
      throw new Error('Tour no encontrado');
    }

    // Verificar si hay reservas asociadas (si implementas la relación en el futuro)
    // if (tour.reservas && tour.reservas.length > 0) {
    //   throw new Error('No se puede eliminar un tour con reservas activas');
    // }

    await this.tourRepository.delete({ id_tour: id });

    // Notificar eliminación
    await httpClient.notifyWebSocket('tour_eliminado', {
      id_tour: id,
    });
  }

  async toggleDisponibilidad(id: number): Promise<Tour> {
    const tour = await this.tourRepository.findOne({
      where: { id_tour: id }
    });

    if (!tour) {
      throw new Error('Tour no encontrado');
    }

    tour.disponible = !tour.disponible;
    return await this.tourRepository.save(tour);
  }
}
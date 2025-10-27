import { AppDataSource } from '../../config/database';
import { Guia } from '../../entities/Guia.entity';
import { CreateGuiaDto } from './dto/create-guia.dto';
import { UpdateGuiaDto } from './dto/update-guia.dto';
import { httpClient } from '../../utils/http-client.util';

export class GuiaService {
  private guiaRepository = AppDataSource.getMongoRepository(Guia);

  async findAll(): Promise<Guia[]> {
    return await this.guiaRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: number): Promise<Guia | null> {
    return await this.guiaRepository.findOne({
      where: { id_guia: id },
    });
  }

  async findAvailable(): Promise<Guia[]> {
    return await this.guiaRepository.find({
      where: { disponible: true },
      order: { calificacion: 'DESC' },
    });
  }

  async create(createGuiaDto: CreateGuiaDto): Promise<Guia> {
    console.log('🔍 Datos recibidos en servicio:', createGuiaDto);
    
    // Verificar si el email ya existe
    const existingGuia = await this.guiaRepository.findOne({
      where: { email: createGuiaDto.email },
    });

    if (existingGuia) {
      throw new Error('Ya existe un guía con este email');
    }

    // Generar id_guia automáticamente si no se proporciona
    if (!createGuiaDto.id_guia) {
      const allGuias = await this.guiaRepository.find({
        order: { id_guia: 'DESC' },
      });
      const maxId = allGuias.length > 0 ? Math.max(...allGuias.map(g => g.id_guia || 0)) : 0;
      createGuiaDto.id_guia = maxId + 1;
      console.log('✅ ID generado automáticamente:', createGuiaDto.id_guia);
    }

    const guia = this.guiaRepository.create(createGuiaDto);
    const savedGuia = await this.guiaRepository.save(guia);

    // Notificar al WebSocket sobre nuevo guía
    await httpClient.notifyWebSocket('guia_creado', {
      id_guia: savedGuia.id_guia,
      nombre: savedGuia.nombre,
    });

    return savedGuia;
  }

  async update(id: number, updateGuiaDto: UpdateGuiaDto): Promise<Guia> {
    const guia = await this.findById(id);

    if (!guia) {
      throw new Error('Guía no encontrado');
    }

    // Si se está actualizando el email, verificar que no exista
    if (updateGuiaDto.email && updateGuiaDto.email !== guia.email) {
      const existingGuia = await this.guiaRepository.findOne({
        where: { email: updateGuiaDto.email },
      });

      if (existingGuia) {
        throw new Error('Ya existe un guía con este email');
      }
    }

    Object.assign(guia, updateGuiaDto);
    const updatedGuia = await this.guiaRepository.save(guia);

    // Notificar actualización
    await httpClient.notifyWebSocket('guia_actualizado', {
      id_guia: updatedGuia.id_guia,
      nombre: updatedGuia.nombre,
    });

    return updatedGuia;
  }

  async delete(id: number): Promise<void> {
    const guia = await this.findById(id);

    if (!guia) {
      throw new Error('Guía no encontrado');
    }

    await this.guiaRepository.remove(guia);

    // Notificar eliminación
    await httpClient.notifyWebSocket('guia_eliminado', {
      id_guia: id,
    });
  }

  async toggleDisponibilidad(id: number): Promise<Guia> {
    const guia = await this.findById(id);

    if (!guia) {
      throw new Error('Guía no encontrado');
    }

    guia.disponible = !guia.disponible;
    return await this.guiaRepository.save(guia);
  }
}
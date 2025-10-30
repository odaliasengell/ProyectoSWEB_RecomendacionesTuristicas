import { AppDataSource } from '../../config/database';
import { Reserva, EstadoReserva } from '../../entities/Reserva.entity';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import { httpClient } from '../../utils/http-client.util';
import { ObjectId } from 'mongodb';

export class ReservaService {
  private reservaRepository = AppDataSource.getMongoRepository(Reserva);

  async findAll(): Promise<Reserva[]> {
    return await this.reservaRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: number): Promise<Reserva | null> {
    return await this.reservaRepository.findOne({
      where: { id_reserva: id },
    });
  }

  async create(createReservaDto: CreateReservaDto): Promise<Reserva> {
    // Generar id_reserva automáticamente si no se proporciona
    if (!createReservaDto.id_reserva) {
      const allReservas = await this.reservaRepository.find({
        order: { id_reserva: 'DESC' },
      });
      const maxId = allReservas.length > 0 ? Math.max(...allReservas.map(r => r.id_reserva || 0)) : 0;
      createReservaDto.id_reserva = maxId + 1;
      console.log('✅ ID Reserva generado automáticamente:', createReservaDto.id_reserva);
    }

    const reserva = this.reservaRepository.create({
      ...createReservaDto,
      estado: (createReservaDto.estado as EstadoReserva) || EstadoReserva.PENDIENTE,
    });

    const savedReserva = await this.reservaRepository.save(reserva);

    // Notificar con más información
    await httpClient.notifyWebSocket('nueva_reserva', {
      id_reserva: savedReserva.id_reserva,
      id_tour: savedReserva.id_tour,
      tour_nombre: 'Tour',  // Se puede enriquecer más adelante
      id_usuario: savedReserva.id_usuario,
      usuario_nombre: 'Usuario', // Se puede enriquecer más adelante
      cantidad_personas: savedReserva.cantidad_personas || 1,
      precio_total: savedReserva.precio_total || 0,
    });

    return savedReserva as Reserva;
  }

  async update(id: number, updateReservaDto: UpdateReservaDto): Promise<Reserva> {
    const reserva = await this.findById(id);

    if (!reserva) {
      throw new Error('Reserva no encontrada');
    }

    Object.assign(reserva, updateReservaDto);
    const updated = await this.reservaRepository.save(reserva);

    await httpClient.notifyWebSocket('reserva_actualizada', {
      id_reserva: updated.id_reserva,
      estado: updated.estado,
    });

    return updated;
  }

  async updateById(id: string, updateReservaDto: UpdateReservaDto): Promise<Reserva> {
    let reserva: Reserva | null = null;

    // Intentar primero como ObjectID de MongoDB
    if (id.length === 24 && /^[a-f0-9]{24}$/i.test(id)) {
      reserva = await this.reservaRepository.findOne({
        where: { _id: new ObjectId(id) } as any,
      });
    }

    // Si no se encontró, intentar como id_reserva numérico
    if (!reserva && !isNaN(Number(id))) {
      reserva = await this.findById(parseInt(id));
    }

    if (!reserva) {
      throw new Error('Reserva no encontrada');
    }

    Object.assign(reserva, updateReservaDto);
    const updated = await this.reservaRepository.save(reserva);

    await httpClient.notifyWebSocket('reserva_actualizada', {
      id_reserva: updated.id_reserva,
      estado: updated.estado,
    });

    return updated;
  }

  async updateEstado(id: number, estado: string): Promise<Reserva> {
    const reserva = await this.findById(id);

    if (!reserva) {
      throw new Error('Reserva no encontrada');
    }

    reserva.estado = estado as EstadoReserva;
    const updated = await this.reservaRepository.save(reserva);

    await httpClient.notifyWebSocket('reserva_actualizada', {
      id_reserva: updated.id_reserva,
      estado: updated.estado,
    });

    return updated;
  }

  async delete(id: number): Promise<void> {
    const reserva = await this.findById(id);

    if (!reserva) {
      throw new Error('Reserva no encontrada');
    }

    await this.reservaRepository.remove(reserva);

    await httpClient.notifyWebSocket('reserva_eliminada', {
      id_reserva: id,
    });
  }

  async findByUsuario(id_usuario: string | number): Promise<Reserva[]> {
    return await this.reservaRepository.find({
      where: { id_usuario },
      order: { fecha_reserva: 'DESC' },
    });
  }
}

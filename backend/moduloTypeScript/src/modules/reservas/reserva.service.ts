import { Repository } from 'typeorm';
import { AppDataSource } from '../../config/database';
import { Reserva, EstadoReserva } from '../../entities/Reserva.entity';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import { httpClient } from '../../utils/http-client.util';

export class ReservaService {
  private reservaRepository: Repository<Reserva>;

  constructor() {
    this.reservaRepository = AppDataSource.getRepository(Reserva);
  }

  async findAll(): Promise<Reserva[]> {
    return await this.reservaRepository.find({
      relations: ['tour', 'tour.guia'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: number): Promise<Reserva | null> {
    return await this.reservaRepository.findOne({
      where: { id_reserva: id },
      relations: ['tour', 'tour.guia'],
    });
  }

  async create(createReservaDto: CreateReservaDto): Promise<Reserva> {
    const reserva = this.reservaRepository.create({
      ...createReservaDto,
      estado: (createReservaDto.estado as EstadoReserva) || EstadoReserva.PENDIENTE,
    });

    const savedReserva = await this.reservaRepository.save(reserva);

    await httpClient.notifyWebSocket('reserva_creada', {
      id_reserva: savedReserva.id_reserva,
      id_tour: savedReserva.id_tour,
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

  async findByUsuario(id_usuario: number): Promise<Reserva[]> {
    return await this.reservaRepository.find({
      where: { id_usuario },
      relations: ['tour'],
      order: { fecha_reserva: 'DESC' },
    });
  }
}

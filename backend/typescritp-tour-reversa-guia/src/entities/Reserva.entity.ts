import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Tour } from './Tour.entity';

export enum EstadoReserva {
  PENDIENTE = 'pendiente',
  CONFIRMADA = 'confirmada',
  CANCELADA = 'cancelada',
  COMPLETADA = 'completada',
}

@Entity('reservas')
export class Reserva {
  @PrimaryColumn()
  id_reserva!: number;

  @Column()
  id_usuario!: number;

  @ManyToOne(() => Tour, (tour) => tour.reservas)
  @JoinColumn({ name: 'id_tour' })
  tour!: Tour;

  @Column()
  id_tour!: number;

  @Column({ type: 'date' })
  fecha_reserva!: Date;

  @Column({ type: 'int', default: 1 })
  cantidad_personas!: number;

  @Column({
    type: 'enum',
    enum: EstadoReserva,
    default: EstadoReserva.PENDIENTE,
  })
  estado!: EstadoReserva;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio_total!: number;

  @Column({ type: 'text', nullable: true })
  comentarios!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

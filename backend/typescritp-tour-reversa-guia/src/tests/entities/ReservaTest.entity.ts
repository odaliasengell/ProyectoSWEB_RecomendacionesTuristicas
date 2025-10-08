import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Tour } from '../../entities/Tour.entity';

export enum EstadoReserva {
  PENDIENTE = 'pendiente',
  CONFIRMADA = 'confirmada',
  CANCELADA = 'cancelada',
  COMPLETADA = 'completada',
}

@Entity('reservas')
export class ReservaTest {
  @PrimaryGeneratedColumn()
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

  // En SQLite usamos string en lugar de enum
  @Column({ type: 'varchar', default: 'pendiente' })
  estado!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio_total!: number;

  @Column({ type: 'text', nullable: true })
  comentarios!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
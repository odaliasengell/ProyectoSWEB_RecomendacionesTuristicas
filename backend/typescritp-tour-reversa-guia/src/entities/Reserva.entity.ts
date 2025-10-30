import { Entity, ObjectIdColumn, ObjectId, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum EstadoReserva {
  PENDIENTE = 'pendiente',
  CONFIRMADA = 'confirmada',
  CANCELADA = 'cancelada',
  COMPLETADA = 'completada',
}

@Entity('reservas')
export class Reserva {
  @ObjectIdColumn()
  _id!: ObjectId;

  @Column()
  id_reserva!: number;

  // Soportar tanto número como string para compatibilidad con microservicio de Python
  @Column()
  id_usuario!: string | number;

  @Column()
  id_tour!: number;

  @Column()
  fecha_reserva!: Date;

  @Column({ default: 1 })
  cantidad_personas!: number;

  @Column({ type: 'enum', enum: EstadoReserva, default: EstadoReserva.PENDIENTE })
  estado!: EstadoReserva;

  @Column()
  precio_total!: number;

  @Column({ nullable: true })
  comentarios?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}



import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Guia } from './Guia.entity';
import { Reserva } from './Reserva.entity';

@Entity('tours')
export class Tour {
  @PrimaryColumn()
  id_tour!: number;

  @Column({ type: 'varchar', length: 150 })
  nombre!: string;

  @Column({ type: 'text' })
  descripcion!: string;

  @Column({ type: 'varchar', length: 50 })
  duracion!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio!: number;

  @Column({ type: 'int', default: 10 })
  capacidad_maxima!: number;

  @Column({ type: 'boolean', default: true })
  disponible!: boolean;

  @ManyToOne(() => Guia, (guia) => guia.tours)
  @JoinColumn({ name: 'id_guia' })
  guia!: Guia;

  @Column()
  id_guia!: number;

  @OneToMany(() => Reserva, (reserva) => reserva.tour)
  reservas!: Reserva[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

import 'reflect-metadata';
import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Tour } from './Tour.entity';

@Entity('guias')
export class Guia {
  @PrimaryColumn()
  id_guia!: number;

  @Column({ type: 'varchar', length: 100 })
  nombre!: string;

  @Column({ type: 'varchar', length: 50 })
  idiomas!: string;

  @Column({ type: 'text' })
  experiencia!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 20 })
  telefono!: string;

  @Column({ type: 'boolean', default: true })
  disponible!: boolean;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  calificacion!: number;

  @OneToMany(() => Tour, (tour: Tour) => tour.guia)
  tours!: Tour[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

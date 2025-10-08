import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

// Entidad Tour simplificada para pruebas (sin relaciones)
@Entity('tours')
export class TourTest {
  @PrimaryGeneratedColumn()
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

  @Column()
  id_guia!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

// Entidad Guía simplificada para pruebas (sin relaciones)
@Entity('guias')
export class GuiaTest {
  @PrimaryGeneratedColumn()
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

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
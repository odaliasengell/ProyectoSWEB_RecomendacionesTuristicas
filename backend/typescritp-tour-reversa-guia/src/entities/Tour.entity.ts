import { Entity, ObjectIdColumn, ObjectId, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('tours')
export class Tour {
  @ObjectIdColumn()
  _id!: ObjectId;

  @Column()
  id_tour!: number;

  @Column({ length: 150 })
  nombre!: string;

  @Column()
  descripcion!: string;

  @Column({ length: 50 })
  duracion!: string;

  @Column()
  precio!: number;

  @Column({ default: 10 })
  capacidad_maxima!: number;

  @Column({ default: true })
  disponible!: boolean;

  @Column({ nullable: true })
  id_guia!: number;

  @Column({ nullable: true })
  id_destino?: string; // ObjectId de MongoDB (destino de Python API)

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}



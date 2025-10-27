import { Entity, ObjectIdColumn, ObjectId, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('guias')
export class Guia {
  @ObjectIdColumn()
  _id!: ObjectId;

  @Column()
  id_guia!: number;

  @Column({ length: 100 })
  nombre!: string;

  @Column({ length: 50 })
  idiomas!: string;

  @Column()
  experiencia!: string;

  @Column({ unique: true, length: 100 })
  email!: string;

  @Column({ length: 20 })
  telefono!: string;

  @Column({ default: true })
  disponible!: boolean;

  @Column({ default: 0 })
  calificacion!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}



import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { Incident } from '../../incidents/entity/incident.entity';

@Entity('ciudadanos')
export class Ciudadano {
  @PrimaryGeneratedColumn()
  id_ciudadano: number;

  @Column()
  nombre: string;

  @Column()
  apellidos: string;

  @Column({ length: 20 })
  cedula: string;

  @Column({ unique: true })
  email: string;

  @Column()
  contraseña: string;

  @Column({ length: 20, nullable: true })
  telefono: string;

  @Column()
  provincia: string;

  @Column()
  canton: string;

  @Column()
  distrito: string;

  @Column('text', { nullable: true })
  direccion: string;

  @Column({ default: 0 })
  strikes: number;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  fecha_creacion: Date;

  @OneToMany(() => Incident, incident => incident.ciudadano)
  incidentes: Incident[];
}

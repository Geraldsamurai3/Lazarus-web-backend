import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Incident } from '../../incidents/entity/incident.entity';

@Entity('ciudadanos')
export class Ciudadano {
  @PrimaryGeneratedColumn()
  id_ciudadano: number;

  @Column()
  nombre: string;

  @Column()
  apellidos: string;

  @Exclude() // ← Ocultar cédula
  @Column({ length: 20 })
  cedula: string;

  @Exclude() // ← Ocultar email
  @Column({ unique: true })
  email: string;

  @Exclude() // ← Ocultar contraseña
  @Column()
  contraseña: string;

  @Exclude() // ← Ocultar teléfono
  @Column({ length: 20, nullable: true })
  telefono: string;

  @Column()
  provincia: string;

  @Column()
  canton: string;

  @Column()
  distrito: string;

  @Exclude() // ← Ocultar dirección exacta
  @Column('text', { nullable: true })
  direccion: string;

  @Exclude() // ← Ocultar strikes (solo admin)
  @Column({ default: 0 })
  strikes: number;

  @Exclude() // ← Ocultar estado de cuenta
  @Column({ default: true })
  activo: boolean;

  @Exclude() // ← Ocultar fecha de creación
  @CreateDateColumn()
  fecha_creacion: Date;

  @OneToMany(() => Incident, incident => incident.ciudadano)
  incidentes: Incident[];
}

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Ciudadano } from '../../users/entity/ciudadano.entity';

export enum IncidentType {
  INCENDIO = 'INCENDIO',
  ACCIDENTE = 'ACCIDENTE',
  INUNDACION = 'INUNDACION',
  DESLIZAMIENTO = 'DESLIZAMIENTO',
  TERREMOTO = 'TERREMOTO',
  OTRO = 'OTRO',
}

export enum IncidentSeverity {
  BAJA = 'BAJA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
  CRITICA = 'CRITICA',
}

export enum IncidentStatus {
  PENDIENTE = 'PENDIENTE',
  EN_PROCESO = 'EN_PROCESO',
  RESUELTO = 'RESUELTO',
  CANCELADO = 'CANCELADO',
}

@Entity('incidentes')
export class Incident {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ciudadano_id: number;

  @ManyToOne(() => Ciudadano, ciudadano => ciudadano.incidentes)
  @JoinColumn({ name: 'ciudadano_id' })
  ciudadano: Ciudadano;

  @Column({
    type: 'enum',
    enum: IncidentType,
  })
  tipo: IncidentType;

  @Column('text')
  descripcion: string;

  @Column({
    type: 'enum',
    enum: IncidentSeverity,
  })
  severidad: IncidentSeverity;

  @Column('decimal', { precision: 10, scale: 8 })
  latitud: number;

  @Column('decimal', { precision: 11, scale: 8 })
  longitud: number;

  @Column()
  direccion: string;

  @Column({
    type: 'enum',
    enum: IncidentStatus,
    default: IncidentStatus.PENDIENTE,
  })
  estado: IncidentStatus;

  @Column('simple-array', { nullable: true })
  imagenes: string[];

  @CreateDateColumn()
  fecha_creacion: Date;

  @UpdateDateColumn()
  fecha_actualizacion: Date;
}

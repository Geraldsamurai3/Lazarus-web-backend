import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entity/user.entity';

export enum IncidentType {
  MEDICA = 'MEDICA',
  INFRAESTRUCTURA = 'INFRAESTRUCTURA',
  SEGURIDAD = 'SEGURIDAD',
  AMBIENTE = 'AMBIENTE',
  OTRO = 'OTRO',
}

export enum IncidentSeverity {
  BAJA = 'BAJA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
  CRITICA = 'CRITICA',
}

export enum IncidentStatus {
  NUEVO = 'NUEVO',
  REVISION = 'REVISION',
  ATENDIDO = 'ATENDIDO',
  FALSO = 'FALSO',
}

@Entity('incidents')
export class Incident {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  usuario_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

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
    default: IncidentStatus.NUEVO,
  })
  estado: IncidentStatus;

  @CreateDateColumn()
  fecha_creacion: Date;

  @UpdateDateColumn()
  fecha_actualizacion: Date;
}

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Incident } from '../../incidents/entity/incident.entity';

export enum MediaType {
  IMAGEN = 'imagen',
  VIDEO = 'video',
}

@Entity('incident_media')
export class IncidentMedia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  incidente_id: number;

  @ManyToOne(() => Incident)
  @JoinColumn({ name: 'incidente_id' })
  incidente: Incident;

  @Column()
  url: string;

  @Column({
    type: 'enum',
    enum: MediaType,
  })
  tipo: MediaType;

  @CreateDateColumn()
  fecha_subida: Date;
}

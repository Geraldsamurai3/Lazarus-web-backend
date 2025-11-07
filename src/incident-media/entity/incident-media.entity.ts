import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Incident } from '../../incidents/entity/incident.entity';

export enum MediaType {
  FOTO = 'foto',
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

  @Column({ nullable: true })
  public_id: string; // ID público de Cloudinary para poder eliminar

  @Column({
    type: 'enum',
    enum: MediaType,
  })
  tipo: MediaType;

  @Column({ nullable: true })
  formato: string; // jpg, png, mp4, etc.

  @Column({ nullable: true, type: 'bigint' })
  tamanio: number; // tamaño en bytes

  @CreateDateColumn()
  fecha_subida: Date;
}

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entity/user.entity';
import { Incident } from '../../incidents/entity/incident.entity';

export enum NotificationStatus {
  ENVIADA = 'ENVIADA',
  LEIDA = 'LEIDA',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  usuario_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @Column({ nullable: true })
  incidente_id: number;

  @ManyToOne(() => Incident)
  @JoinColumn({ name: 'incidente_id' })
  incidente: Incident;

  @Column('text')
  mensaje: string;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.ENVIADA,
  })
  estado: NotificationStatus;

  @CreateDateColumn()
  fecha: Date;
}

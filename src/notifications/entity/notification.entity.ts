import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { UserType } from '../../common/enums/user-type.enum';

export enum NotificationStatus {
  ENVIADA = 'ENVIADA',
  LEIDA = 'LEIDA',
}

/**
 * Notificaciones con relación polimórfica a usuarios
 * Puede referenciar a Ciudadano, EntidadPublica o Administrador
 */
@Entity('notificaciones')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  // Relación polimórfica: tipo de usuario + ID
  @Column({
    type: 'enum',
    enum: UserType,
  })
  usuario_tipo: UserType;

  @Column()
  usuario_id: number;

  // Referencia opcional a incidente
  @Column({ nullable: true })
  incidente_id: number;

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

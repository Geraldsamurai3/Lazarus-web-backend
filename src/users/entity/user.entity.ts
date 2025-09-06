import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

export enum UserRole {
  ADMIN = 'ADMIN',
  ENTIDAD = 'ENTIDAD',
  CIUDADANO = 'CIUDADANO',
}

export enum UserStatus {
  HABILITADO = 'HABILITADO',
  DESHABILITADO = 'DESHABILITADO',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ unique: true })
  email: string;

  @Column()
  contraseña: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  rol: UserRole;

  @Column({ default: 0 })
  strikes: number;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.HABILITADO,
  })
  estado: UserStatus;

  @CreateDateColumn()
  fecha_creacion: Date;
}

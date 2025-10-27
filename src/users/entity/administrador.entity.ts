import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

export enum NivelAcceso {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MODERADOR = 'MODERADOR',
}

@Entity('administradores')
export class Administrador {
  @PrimaryGeneratedColumn()
  id_admin: number;

  @Column()
  nombre: string;

  @Column()
  apellidos: string;

  @Column({ unique: true })
  email: string;

  @Column()
  contraseña: string;

  @Column({
    type: 'enum',
    enum: NivelAcceso,
    default: NivelAcceso.ADMIN,
  })
  nivel_acceso: NivelAcceso;

  @Column()
  provincia: string;

  @Column()
  canton: string;

  @Column()
  distrito: string;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  fecha_creacion: Date;
}

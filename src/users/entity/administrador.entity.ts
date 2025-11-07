import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

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

  @Exclude() // ← Ocultar email
  @Column({ unique: true })
  email: string;

  @Exclude() // ← Ocultar contraseña
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

  @Exclude() // ← Ocultar estado
  @Column({ default: true })
  activo: boolean;

  @Exclude() // ← Ocultar fecha de creación
  @CreateDateColumn()
  fecha_creacion: Date;
}

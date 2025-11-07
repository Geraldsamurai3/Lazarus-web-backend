import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

export enum TipoEntidad {
  BOMBEROS = 'BOMBEROS',
  POLICIA = 'POLICIA',
  CRUZ_ROJA = 'CRUZ_ROJA',
  TRANSITO = 'TRANSITO',
  AMBULANCIA = 'AMBULANCIA',
  MUNICIPALIDAD = 'MUNICIPALIDAD',
  OTROS = 'OTROS',
}

@Entity('entidades_publicas')
export class EntidadPublica {
  @PrimaryGeneratedColumn()
  id_entidad: number;

  @Column()
  nombre_entidad: string;

  @Column({
    type: 'enum',
    enum: TipoEntidad,
  })
  tipo_entidad: TipoEntidad;

  @Exclude() // ← Ocultar email
  @Column({ unique: true })
  email: string;

  @Exclude() // ← Ocultar contraseña
  @Column()
  contraseña: string;

  @Column({ length: 20 })
  telefono_emergencia: string;

  @Column()
  provincia: string;

  @Column()
  canton: string;

  @Column()
  distrito: string;

  @Column('text')
  ubicacion: string;

  @Exclude() // ← Ocultar estado
  @Column({ default: true })
  activo: boolean;

  @Exclude() // ← Ocultar fecha de registro
  @CreateDateColumn()
  fecha_registro: Date;
}

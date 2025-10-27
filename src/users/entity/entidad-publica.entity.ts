import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

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

  @Column({ unique: true })
  email: string;

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

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  fecha_registro: Date;
}

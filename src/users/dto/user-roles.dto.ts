import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { TipoEntidad } from '../entity/entidad-publica.entity';
import { NivelAcceso } from '../entity/administrador.entity';

export class RegisterCiudadanoDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @IsString()
  apellidos: string;

  @IsNotEmpty()
  @IsString()
  cedula: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  contraseña: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsNotEmpty()
  @IsString()
  provincia: string;

  @IsNotEmpty()
  @IsString()
  canton: string;

  @IsNotEmpty()
  @IsString()
  distrito: string;

  @IsOptional()
  @IsString()
  direccion?: string;
}

export class RegisterEntidadDto {
  @IsNotEmpty()
  @IsString()
  nombre_entidad: string;

  @IsNotEmpty()
  @IsEnum(TipoEntidad)
  tipo_entidad: TipoEntidad;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  contraseña: string;

  @IsNotEmpty()
  @IsString()
  telefono_emergencia: string;

  @IsNotEmpty()
  @IsString()
  provincia: string;

  @IsNotEmpty()
  @IsString()
  canton: string;

  @IsNotEmpty()
  @IsString()
  distrito: string;

  @IsNotEmpty()
  @IsString()
  ubicacion: string;
}

export class RegisterAdminDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @IsString()
  apellidos: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  contraseña: string;

  @IsOptional()
  @IsEnum(NivelAcceso)
  nivel_acceso?: NivelAcceso;

  @IsNotEmpty()
  @IsString()
  provincia: string;

  @IsNotEmpty()
  @IsString()
  canton: string;

  @IsNotEmpty()
  @IsString()
  distrito: string;
}

export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  contraseña: string;
}

export class UpdateCiudadanoDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  apellidos?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  provincia?: string;

  @IsOptional()
  @IsString()
  canton?: string;

  @IsOptional()
  @IsString()
  distrito?: string;

  @IsOptional()
  @IsString()
  direccion?: string;
}

export class UpdateEntidadDto {
  @IsOptional()
  @IsString()
  nombre_entidad?: string;

  @IsOptional()
  @IsString()
  telefono_emergencia?: string;

  @IsOptional()
  @IsString()
  ubicacion?: string;

  @IsOptional()
  activo?: boolean;
}

export class UpdateAdminDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  apellidos?: string;

  @IsOptional()
  @IsEnum(NivelAcceso)
  nivel_acceso?: NivelAcceso;

  @IsOptional()
  activo?: boolean;
}

import { IsString, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { IncidentType, IncidentSeverity, IncidentStatus } from '../entity/incident.entity';

export class CreateIncidentDto {
  @IsEnum(IncidentType)
  tipo: IncidentType;

  @IsString()
  descripcion: string;

  @IsEnum(IncidentSeverity)
  severidad: IncidentSeverity;

  @IsNumber()
  latitud: number;

  @IsNumber()
  longitud: number;

  @IsString()
  direccion: string;
}

export class UpdateIncidentDto {
  @IsOptional()
  @IsEnum(IncidentType)
  tipo?: IncidentType;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsEnum(IncidentSeverity)
  severidad?: IncidentSeverity;

  @IsOptional()
  @IsNumber()
  latitud?: number;

  @IsOptional()
  @IsNumber()
  longitud?: number;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsEnum(IncidentStatus)
  estado?: IncidentStatus;
}

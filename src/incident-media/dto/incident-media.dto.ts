import { IsString, IsEnum } from 'class-validator';
import { MediaType } from '../entity/incident-media.entity';

export class CreateIncidentMediaDto {
  @IsString()
  url: string;

  @IsEnum(MediaType)
  tipo: MediaType;
}

export class UpdateIncidentMediaDto {
  @IsString()
  url?: string;

  @IsEnum(MediaType)
  tipo?: MediaType;
}

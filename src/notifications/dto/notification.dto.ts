import { IsString, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { NotificationStatus } from '../entity/notification.entity';

export class CreateNotificationDto {
  @IsNumber()
  usuario_id: number;

  @IsOptional()
  @IsNumber()
  incidente_id?: number;

  @IsString()
  mensaje: string;

  @IsOptional()
  @IsEnum(NotificationStatus)
  estado?: NotificationStatus;
}

export class UpdateNotificationDto {
  @IsOptional()
  @IsNumber()
  usuario_id?: number;

  @IsOptional()
  @IsNumber()
  incidente_id?: number;

  @IsOptional()
  @IsString()
  mensaje?: string;

  @IsOptional()
  @IsEnum(NotificationStatus)
  estado?: NotificationStatus;
}

import { IsEmail, IsString, IsEnum, IsOptional } from 'class-validator';
import { UserRole, UserStatus } from '../entity/user.entity';

export class CreateUserDto {
  @IsString()
  nombre: string;

  @IsEmail()
  email: string;

  @IsString()
  contraseña: string;

  @IsEnum(UserRole)
  rol: UserRole;

  @IsOptional()
  @IsEnum(UserStatus)
  estado?: UserStatus;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  contraseña?: string;

  @IsOptional()
  @IsEnum(UserRole)
  rol?: UserRole;

  @IsOptional()
  @IsEnum(UserStatus)
  estado?: UserStatus;
}

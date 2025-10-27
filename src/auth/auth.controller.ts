import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { UserType } from '../common/enums/user-type.enum';
import { LoginDto, RegisterCiudadanoDto, RegisterEntidadDto, RegisterAdminDto } from '../users/dto/user-roles.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body(ValidationPipe) loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  async register(@Body(ValidationPipe) registerDto: RegisterCiudadanoDto) {
    return this.authService.register(registerDto);
  }

  @Post('register-entidad')
  async registerEntidad(@Body(ValidationPipe) registerDto: RegisterEntidadDto) {
    return this.authService.registerEntidad(registerDto);
  }

  @Post('register-admin')
  async registerAdmin(@Body(ValidationPipe) registerDto: RegisterAdminDto) {
    return this.authService.registerAdmin(registerDto);
  }
}

import { Injectable } from '@nestjs/common';
import { UnifiedAuthService } from '../users/services/unified-auth.service';
import { LoginDto, RegisterCiudadanoDto, RegisterEntidadDto, RegisterAdminDto } from '../users/dto/user-roles.dto';

/**
 * AuthService ahora delega toda la lógica a UnifiedAuthService
 */
@Injectable()
export class AuthService {
  constructor(
    private unifiedAuthService: UnifiedAuthService,
  ) {}

  async validateUser(email: string, contraseña: string): Promise<any> {
    return this.unifiedAuthService.validateUser(email, contraseña);
  }

  async login(loginDto: LoginDto) {
    return this.unifiedAuthService.login(loginDto);
  }

  async register(registerDto: RegisterCiudadanoDto) {
    return this.unifiedAuthService.registerCiudadano(registerDto);
  }

  async registerEntidad(registerDto: RegisterEntidadDto) {
    return this.unifiedAuthService.registerEntidad(registerDto);
  }

  async registerAdmin(registerDto: RegisterAdminDto) {
    return this.unifiedAuthService.registerAdmin(registerDto);
  }
}
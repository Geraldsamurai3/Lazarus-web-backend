import { Injectable } from '@nestjs/common';
import { UnifiedAuthService } from '../users/services/unified-auth.service';
import { LoginDto, RegisterCiudadanoDto, RegisterEntidadDto, RegisterAdminDto, ForgotPasswordDto, ResetPasswordDto } from '../users/dto/user-roles.dto';
import { UserType } from '../common/enums/user-type.enum';

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

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    return this.unifiedAuthService.forgotPassword(forgotPasswordDto);
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    return this.unifiedAuthService.resetPassword(resetPasswordDto);
  }

  async checkEmail(email: string) {
    return this.unifiedAuthService.checkEmailAvailability(email);
  }

  async getProfile(userId: number, userType: UserType) {
    return this.unifiedAuthService.getProfile(userId, userType);
  }

  async updateProfile(userId: number, userType: UserType, updateData: any) {
    return this.unifiedAuthService.updateProfile(userId, userType, updateData);
  }
}
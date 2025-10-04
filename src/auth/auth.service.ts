import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { UserStatus, UserRole } from '../users/entity/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, contraseña: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      return null;
    }

    if (user.estado === UserStatus.DESHABILITADO) {
      throw new UnauthorizedException('Cuenta deshabilitada');
    }

    const isPasswordValid = await this.usersService.validatePassword(contraseña, user.contraseña);
    
    if (user && isPasswordValid) {
      const { contraseña: _, ...result } = user;
      return result;
    }
    
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.contraseña);
    
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { 
      email: user.email, 
      sub: user.id, 
      rol: user.rol 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        estado: user.estado,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    // Check if this is the first user - if so, make them ADMIN
    const userCount = await this.usersService.getUserCount();
    const userRole = userCount === 0 ? UserRole.ADMIN : UserRole.CIUDADANO;

    const user = await this.usersService.create({
      ...registerDto,
      rol: userRole,
    });

    // Automatically log in after registration
    const payload = { 
      email: user.email, 
      sub: user.id, 
      rol: user.rol 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        estado: user.estado,
      },
      message: userRole === UserRole.ADMIN ? 'Bienvenido! Eres el primer usuario y ahora eres ADMIN.' : 'Registro exitoso como CIUDADANO.',
    };
  }
}
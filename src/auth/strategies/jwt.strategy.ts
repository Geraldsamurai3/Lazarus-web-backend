import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { UserType } from '../../common/enums/user-type.enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET') || 'default-secret',
    });
  }

  async validate(payload: any) {
    // El payload ahora incluye: { email, sub: id, userType: 'CIUDADANO'|'ENTIDAD'|'ADMIN' }
    const userType = payload.userType as UserType;
    const userId = payload.sub;

    if (!userType || !userId) {
      throw new UnauthorizedException('Token inválido');
    }

    // Buscar el usuario en la tabla correcta según su tipo
    const user = await this.usersService.findById(userId, userType);

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // Verificar que esté activo
    if (!user.activo) {
      throw new UnauthorizedException('Cuenta deshabilitada');
    }

    // Retornar info del usuario para el request
    return {
      userId: userId,
      email: user.email,
      userType: userType,
      // Agregar campos específicos según el tipo
      ...(userType === UserType.CIUDADANO && {
        nombre: user.nombre,
        apellidos: user.apellidos,
        strikes: user.strikes,
      }),
      ...(userType === UserType.ENTIDAD && {
        nombre_entidad: user.nombre_entidad,
        tipo_entidad: user.tipo_entidad,
      }),
      ...(userType === UserType.ADMIN && {
        nombre: user.nombre,
        apellidos: user.apellidos,
        nivel_acceso: user.nivel_acceso,
      }),
    };
  }
}
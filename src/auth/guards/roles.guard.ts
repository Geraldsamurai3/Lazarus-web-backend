import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserType } from '../../common/enums/user-type.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserType[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // Ahora verificamos userType en lugar de rol
    const hasRole = requiredRoles.some((role) => user.userType === role);

    if (!hasRole) {
      throw new ForbiddenException(
        `No tienes permisos para esta acción. Roles requeridos: ${requiredRoles.join(', ')}`
      );
    }

    return true;
  }
}

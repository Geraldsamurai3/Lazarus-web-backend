import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UserType } from '../common/enums/user-type.enum';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ADMIN y ENTIDAD: Ver todos los usuarios
  @Get()
  @Roles(UserType.ADMIN, UserType.ENTIDAD)
  async findAll() {
    const users = await this.usersService.findAll();
    // Remover contraseñas de la respuesta
    return users.map(user => {
      const { contraseña, ...userData } = user;
      return userData;
    });
  }

  // TODOS: Ver perfil de usuario específico por ID y tipo
  @Get(':userType/:id')
  @Roles(UserType.CIUDADANO, UserType.ENTIDAD, UserType.ADMIN)
  async findOne(
    @Param('userType') userType: UserType,
    @Param('id', ParseIntPipe) id: number,
    @GetUser('userId') currentUserId: number,
    @GetUser('userType') currentUserType: UserType,
  ) {
    // Ciudadanos solo pueden ver su propio perfil
    if (currentUserType === UserType.CIUDADANO && (id !== currentUserId || userType !== UserType.CIUDADANO)) {
      throw new ForbiddenException('No puedes ver el perfil de otros usuarios');
    }

    const user = await this.usersService.findById(id, userType);
    if (!user) {
      throw new ForbiddenException('Usuario no encontrado');
    }

    const { contraseña, ...result } = user;
    return result;
  }

  // TODOS: Ver mi propio perfil
  @Get('me')
  @Roles(UserType.CIUDADANO, UserType.ENTIDAD, UserType.ADMIN)
  async getMyProfile(
    @GetUser('userId') userId: number,
    @GetUser('userType') userType: UserType,
  ) {
    const user = await this.usersService.findById(userId, userType);
    if (!user) {
      throw new ForbiddenException('Usuario no encontrado');
    }

    const { contraseña, ...result } = user;
    return result;
  }

  // ADMIN: Habilitar/deshabilitar usuarios
  @Patch(':userType/:id/toggle-status')
  @Roles(UserType.ADMIN)
  async toggleUserStatus(
    @Param('userType') userType: UserType,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.usersService.toggleUserStatus(id, userType);
    return { message: 'Estado del usuario actualizado' };
  }

  // ADMIN y ENTIDAD: Incrementar strikes a ciudadanos
  @Patch('ciudadano/:id/strike')
  @Roles(UserType.ADMIN, UserType.ENTIDAD)
  async incrementStrikes(@Param('id', ParseIntPipe) id: number) {
    const ciudadano = await this.usersService.incrementStrikes(id);
    const { contraseña, ...result } = ciudadano;
    return result;
  }
}

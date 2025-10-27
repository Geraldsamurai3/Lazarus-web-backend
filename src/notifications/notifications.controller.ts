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
  Query,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/notification.dto';
import { Notification } from './entity/notification.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UserType } from '../common/enums/user-type.enum';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // ADMIN y ENTIDAD: Crear notificaciones para usuarios
  @Post()
  @Roles(UserType.ADMIN, UserType.ENTIDAD)
  async create(
    @Body(ValidationPipe) createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    return this.notificationsService.create(createNotificationDto);
  }

  // ADMIN: Ver todas las notificaciones
  @Get()
  @Roles(UserType.ADMIN)
  async findAll(): Promise<Notification[]> {
    return this.notificationsService.findAll();
  }

  // TODOS: Ver sus propias notificaciones
  @Get('user/:userId')
  @Roles(UserType.CIUDADANO, UserType.ENTIDAD, UserType.ADMIN)
  async findByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @GetUser('userId') currentUserId: number,
    @GetUser('userType') currentUserType: UserType,
  ): Promise<Notification[]> {
    // Ciudadanos y Entidades solo pueden ver sus propias notificaciones
    if (currentUserType !== UserType.ADMIN && userId !== currentUserId) {
      throw new Error('No puedes ver notificaciones de otros usuarios');
    }
    return this.notificationsService.findByUser(userId);
  }

  // TODOS: Ver sus notificaciones no leídas
  @Get('user/:userId/unread')
  @Roles(UserType.CIUDADANO, UserType.ENTIDAD, UserType.ADMIN)
  async findUnreadByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @GetUser('userId') currentUserId: number,
    @GetUser('userType') currentUserType: UserType,
  ): Promise<Notification[]> {
    if (currentUserType !== UserType.ADMIN && userId !== currentUserId) {
      throw new Error('No puedes ver notificaciones de otros usuarios');
    }
    return this.notificationsService.findUnreadByUser(userId);
  }

  // TODOS: Ver una notificación específica
  @Get(':id')
  @Roles(UserType.CIUDADANO, UserType.ENTIDAD, UserType.ADMIN)
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Notification> {
    return this.notificationsService.findOne(id);
  }

  // TODOS: Marcar notificación como leída
  @Patch(':id/read')
  @Roles(UserType.CIUDADANO, UserType.ENTIDAD, UserType.ADMIN)
  async markAsRead(@Param('id', ParseIntPipe) id: number): Promise<Notification> {
    return this.notificationsService.markAsRead(id);
  }

  // TODOS: Marcar todas sus notificaciones como leídas
  @Patch('user/:userId/read-all')
  @Roles(UserType.CIUDADANO, UserType.ENTIDAD, UserType.ADMIN)
  async markAllAsReadByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @GetUser('userId') currentUserId: number,
    @GetUser('userType') currentUserType: UserType,
  ): Promise<{ message: string }> {
    if (currentUserType !== UserType.ADMIN && userId !== currentUserId) {
      throw new Error('No puedes modificar notificaciones de otros usuarios');
    }
    await this.notificationsService.markAllAsReadByUser(userId);
    return { message: 'Todas las notificaciones han sido marcadas como leídas' };
  }

  // TODOS: Eliminar sus propias notificaciones
  @Delete(':id')
  @Roles(UserType.CIUDADANO, UserType.ENTIDAD, UserType.ADMIN)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.notificationsService.remove(id);
  }

  // ADMIN y ENTIDAD: Notificar cambio de estado de incidente
  @Post('incident-status')
  @Roles(UserType.ADMIN, UserType.ENTIDAD)
  async notifyIncidentStatusChange(
    @Body() body: { userId: number; incidentId: number; newStatus: string },
  ): Promise<Notification> {
    return this.notificationsService.notifyIncidentStatusChange(
      body.userId,
      body.incidentId,
      body.newStatus,
    );
  }

  // Sistema: Notificar incidente cercano (llamado internamente)
  @Post('incident-nearby')
  @Roles(UserType.ADMIN, UserType.ENTIDAD)
  async notifyIncidentNearby(
    @Body() body: { userId: number; incidentId: number; distance: string },
  ): Promise<Notification> {
    return this.notificationsService.notifyIncidentNearby(
      body.userId,
      body.incidentId,
      body.distance,
    );
  }

  // ADMIN: Enviar mensaje del sistema
  @Post('system-message')
  @Roles(UserType.ADMIN)
  async notifySystemMessage(
    @Body() body: { userId: number; message: string },
  ): Promise<Notification> {
    return this.notificationsService.notifySystemMessage(body.userId, body.message);
  }
}


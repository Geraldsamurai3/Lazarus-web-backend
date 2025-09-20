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
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/notification.dto';
import { Notification } from './entity/notification.entity';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  async create(
    @Body(ValidationPipe) createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
  async findAll(): Promise<Notification[]> {
    return this.notificationsService.findAll();
  }

  @Get('user/:userId')
  async findByUser(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<Notification[]> {
    return this.notificationsService.findByUser(userId);
  }

  @Get('user/:userId/unread')
  async findUnreadByUser(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<Notification[]> {
    return this.notificationsService.findUnreadByUser(userId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Notification> {
    return this.notificationsService.findOne(id);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id', ParseIntPipe) id: number): Promise<Notification> {
    return this.notificationsService.markAsRead(id);
  }

  @Patch('user/:userId/read-all')
  async markAllAsReadByUser(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<{ message: string }> {
    await this.notificationsService.markAllAsReadByUser(userId);
    return { message: 'Todas las notificaciones han sido marcadas como leídas' };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.notificationsService.remove(id);
  }

  // Helper endpoints for specific notification types
  @Post('incident-status')
  async notifyIncidentStatusChange(
    @Body() body: { userId: number; incidentId: number; newStatus: string },
  ): Promise<Notification> {
    return this.notificationsService.notifyIncidentStatusChange(
      body.userId,
      body.incidentId,
      body.newStatus,
    );
  }

  @Post('incident-nearby')
  async notifyIncidentNearby(
    @Body() body: { userId: number; incidentId: number; distance: string },
  ): Promise<Notification> {
    return this.notificationsService.notifyIncidentNearby(
      body.userId,
      body.incidentId,
      body.distance,
    );
  }

  @Post('system-message')
  async notifySystemMessage(
    @Body() body: { userId: number; message: string },
  ): Promise<Notification> {
    return this.notificationsService.notifySystemMessage(body.userId, body.message);
  }
}

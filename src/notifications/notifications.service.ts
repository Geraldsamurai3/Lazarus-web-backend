import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationStatus } from './entity/notification.entity';
import { CreateNotificationDto } from './dto/notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationsRepository.create(createNotificationDto);
    return this.notificationsRepository.save(notification);
  }

  async findAll(): Promise<Notification[]> {
    return this.notificationsRepository.find({
      relations: ['usuario', 'incidente'],
      order: { fecha: 'DESC' },
    });
  }

  async findByUser(userId: number): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { usuario_id: userId },
      relations: ['incidente'],
      order: { fecha: 'DESC' },
    });
  }

  async findUnreadByUser(userId: number): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { 
        usuario_id: userId, 
        estado: NotificationStatus.ENVIADA 
      },
      relations: ['incidente'],
      order: { fecha: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({
      where: { id },
      relations: ['usuario', 'incidente'],
    });

    if (!notification) {
      throw new NotFoundException(`Notificación con ID ${id} no encontrada`);
    }

    return notification;
  }

  async markAsRead(id: number): Promise<Notification> {
    await this.notificationsRepository.update(id, {
      estado: NotificationStatus.LEIDA,
    });
    return this.findOne(id);
  }

  async markAllAsReadByUser(userId: number): Promise<void> {
    await this.notificationsRepository.update(
      { usuario_id: userId, estado: NotificationStatus.ENVIADA },
      { estado: NotificationStatus.LEIDA }
    );
  }

  async remove(id: number): Promise<void> {
    const notification = await this.findOne(id);
    await this.notificationsRepository.remove(notification);
  }

  // Utility methods for creating specific notification types
  async notifyIncidentStatusChange(
    userId: number, 
    incidentId: number, 
    newStatus: string
  ): Promise<Notification> {
    return this.create({
      usuario_id: userId,
      incidente_id: incidentId,
      mensaje: `El estado de tu incidente ha cambiado a: ${newStatus}`,
    });
  }

  async notifyIncidentNearby(
    userId: number, 
    incidentId: number, 
    distance: string
  ): Promise<Notification> {
    return this.create({
      usuario_id: userId,
      incidente_id: incidentId,
      mensaje: `Se reportó un nuevo incidente cerca de tu ubicación (${distance})`,
    });
  }

  async notifySystemMessage(userId: number, message: string): Promise<Notification> {
    return this.create({
      usuario_id: userId,
      mensaje: message,
    });
  }
}

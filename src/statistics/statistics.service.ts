import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Incident } from '../incidents/entity/incident.entity';
import { User } from '../users/entity/user.entity';
import { Notification, NotificationStatus } from '../notifications/entity/notification.entity';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Incident)
    private incidentsRepository: Repository<Incident>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  async getDashboardStats() {
    const [
      totalIncidents,
      totalUsers,
      totalNotifications,
      incidentsByStatus,
      incidentsBySeverity,
      incidentsByType,
      usersByRole,
      recentIncidents,
    ] = await Promise.all([
      this.incidentsRepository.count(),
      this.usersRepository.count(),
      this.notificationsRepository.count(),
      this.getIncidentsByStatus(),
      this.getIncidentsBySeverity(),
      this.getIncidentsByType(),
      this.getUsersByRole(),
      this.getRecentIncidents(5),
    ]);

    return {
      totals: {
        incidents: totalIncidents,
        users: totalUsers,
        notifications: totalNotifications,
      },
      incidentsByStatus,
      incidentsBySeverity,
      incidentsByType,
      usersByRole,
      recentIncidents,
    };
  }

  async getIncidentsByStatus() {
    const results = await this.incidentsRepository
      .createQueryBuilder('incident')
      .select('incident.estado', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('incident.estado')
      .getRawMany();

    return results.reduce((acc, item) => {
      acc[item.status] = parseInt(item.count);
      return acc;
    }, {});
  }

  async getIncidentsBySeverity() {
    const results = await this.incidentsRepository
      .createQueryBuilder('incident')
      .select('incident.severidad', 'severity')
      .addSelect('COUNT(*)', 'count')
      .groupBy('incident.severidad')
      .getRawMany();

    return results.reduce((acc, item) => {
      acc[item.severity] = parseInt(item.count);
      return acc;
    }, {});
  }

  async getIncidentsByType() {
    const results = await this.incidentsRepository
      .createQueryBuilder('incident')
      .select('incident.tipo', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('incident.tipo')
      .getRawMany();

    return results.reduce((acc, item) => {
      acc[item.type] = parseInt(item.count);
      return acc;
    }, {});
  }

  async getUsersByRole() {
    const results = await this.usersRepository
      .createQueryBuilder('user')
      .select('user.rol', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.rol')
      .getRawMany();

    return results.reduce((acc, item) => {
      acc[item.role] = parseInt(item.count);
      return acc;
    }, {});
  }

  async getRecentIncidents(limit: number = 10): Promise<Incident[]> {
    return this.incidentsRepository.find({
      relations: ['usuario'],
      order: { fecha_creacion: 'DESC' },
      take: limit,
    });
  }

  async getIncidentTrends(days: number = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const results = await this.incidentsRepository
      .createQueryBuilder('incident')
      .select("DATE(incident.fecha_creacion)", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('incident.fecha_creacion BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy("DATE(incident.fecha_creacion)")
      .orderBy('date', 'ASC')
      .getRawMany();

    return results.map(item => ({
      date: item.date,
      count: parseInt(item.count),
    }));
  }

  async getIncidentsByLocation() {
    const results = await this.incidentsRepository
      .createQueryBuilder('incident')
      .select(['incident.latitud', 'incident.longitud', 'incident.tipo', 'incident.severidad'])
      .getMany();

    return results.map(incident => ({
      lat: incident.latitud,
      lng: incident.longitud,
      tipo: incident.tipo,
      severidad: incident.severidad,
    }));
  }

  async getUserActivityStats(userId: number) {
    const [
      totalIncidents,
      incidentsByStatus,
      notificationsSent,
      notificationsRead,
    ] = await Promise.all([
      this.incidentsRepository.count({ where: { usuario_id: userId } }),
      this.getUserIncidentsByStatus(userId),
      this.notificationsRepository.count({ where: { usuario_id: userId } }),
      this.notificationsRepository.count({ 
        where: { usuario_id: userId, estado: NotificationStatus.LEIDA } 
      }),
    ]);

    return {
      totalIncidents,
      incidentsByStatus,
      notifications: {
        total: notificationsSent,
        read: notificationsRead,
        unread: notificationsSent - notificationsRead,
      },
    };
  }

  private async getUserIncidentsByStatus(userId: number) {
    const results = await this.incidentsRepository
      .createQueryBuilder('incident')
      .select('incident.estado', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('incident.usuario_id = :userId', { userId })
      .groupBy('incident.estado')
      .getRawMany();

    return results.reduce((acc, item) => {
      acc[item.status] = parseInt(item.count);
      return acc;
    }, {});
  }
}
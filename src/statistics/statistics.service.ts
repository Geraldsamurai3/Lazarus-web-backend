import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Incident } from '../incidents/entity/incident.entity';
import { Ciudadano } from '../users/entity/ciudadano.entity';
import { EntidadPublica } from '../users/entity/entidad-publica.entity';
import { Administrador } from '../users/entity/administrador.entity';
import { Notification, NotificationStatus } from '../notifications/entity/notification.entity';
import { UserType } from '../common/enums/user-type.enum';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Incident)
    private incidentsRepository: Repository<Incident>,
    @InjectRepository(Ciudadano)
    private ciudadanosRepository: Repository<Ciudadano>,
    @InjectRepository(EntidadPublica)
    private entidadesRepository: Repository<EntidadPublica>,
    @InjectRepository(Administrador)
    private adminsRepository: Repository<Administrador>,
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  async getDashboardStats() {
    const [
      totalIncidents,
      totalCiudadanos,
      totalEntidades,
      totalAdmins,
      totalNotifications,
      incidentsByStatus,
      incidentsBySeverity,
      incidentsByType,
      usersByType,
      recentIncidents,
    ] = await Promise.all([
      this.incidentsRepository.count(),
      this.ciudadanosRepository.count(),
      this.entidadesRepository.count(),
      this.adminsRepository.count(),
      this.notificationsRepository.count(),
      this.getIncidentsByStatus(),
      this.getIncidentsBySeverity(),
      this.getIncidentsByType(),
      this.getUsersByType(),
      this.getRecentIncidents(5),
    ]);

    const totalUsers = totalCiudadanos + totalEntidades + totalAdmins;

    return {
      totals: {
        incidents: totalIncidents,
        users: totalUsers,
        ciudadanos: totalCiudadanos,
        entidades: totalEntidades,
        admins: totalAdmins,
        notifications: totalNotifications,
      },
      incidentsByStatus,
      incidentsBySeverity,
      incidentsByType,
      usersByType,
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

  async getUsersByType() {
    const ciudadanosCount = await this.ciudadanosRepository.count();
    const entidadesCount = await this.entidadesRepository.count();
    const adminsCount = await this.adminsRepository.count();

    return {
      [UserType.CIUDADANO]: ciudadanosCount,
      [UserType.ENTIDAD]: entidadesCount,
      [UserType.ADMIN]: adminsCount,
    };
  }

  async getRecentIncidents(limit: number = 10): Promise<Incident[]> {
    return this.incidentsRepository.find({
      relations: ['ciudadano'],
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

  async getUserActivityStats(userId: number, userType: UserType) {
    // Solo ciudadanos crean incidentes
    if (userType !== UserType.CIUDADANO) {
      return {
        totalIncidents: 0,
        incidentsByStatus: {},
        notifications: {
          total: 0,
          read: 0,
          unread: 0,
        },
      };
    }

    const [
      totalIncidents,
      incidentsByStatus,
      notificationsSent,
      notificationsRead,
    ] = await Promise.all([
      this.incidentsRepository.count({ where: { ciudadano_id: userId } }),
      this.getUserIncidentsByStatus(userId),
      this.notificationsRepository.count({ 
        where: { usuario_id: userId, usuario_tipo: userType } 
      }),
      this.notificationsRepository.count({ 
        where: { 
          usuario_id: userId, 
          usuario_tipo: userType,
          estado: NotificationStatus.LEIDA 
        } 
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

  private async getUserIncidentsByStatus(ciudadanoId: number) {
    const results = await this.incidentsRepository
      .createQueryBuilder('incident')
      .select('incident.estado', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('incident.ciudadano_id = :ciudadanoId', { ciudadanoId })
      .groupBy('incident.estado')
      .getRawMany();

    return results.reduce((acc, item) => {
      acc[item.status] = parseInt(item.count);
      return acc;
    }, {});
  }
}
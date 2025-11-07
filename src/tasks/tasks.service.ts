import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Not, In } from 'typeorm';
import { Incident, IncidentStatus } from '../incidents/entity/incident.entity';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectRepository(Incident)
    private incidentsRepository: Repository<Incident>,
  ) {}

  /**
   * Tarea CRON que se ejecuta todos los días a las 00:00
   * Archiva incidentes que tienen más de 48 horas desde su creación
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async archiveOldIncidents() {
    this.logger.log('🕐 Ejecutando tarea de archivo de incidentes antiguos...');

    try {
      // Calcular fecha límite (48 horas atrás)
      const fortyEightHoursAgo = new Date();
      fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);

      // Buscar incidentes creados hace más de 48 horas que NO estén archivados
      const oldIncidents = await this.incidentsRepository.find({
        where: {
          fecha_creacion: LessThan(fortyEightHoursAgo),
          estado: Not(IncidentStatus.ARCHIVADO), // Excluir los ya archivados
        },
      });

      if (oldIncidents.length === 0) {
        this.logger.log('✅ No hay incidentes para archivar');
        return;
      }

      // Actualizar estado a ARCHIVADO
      const result = await this.incidentsRepository.update(
        {
          id: In(oldIncidents.map(inc => inc.id)),
        },
        {
          estado: IncidentStatus.ARCHIVADO,
        },
      );

      this.logger.log(
        `✅ ${result.affected} incidente(s) archivado(s) automáticamente`,
      );

      // Log de auditoría
      oldIncidents.forEach((incident) => {
        const hoursOld = Math.floor(
          (Date.now() - new Date(incident.fecha_creacion).getTime()) / (1000 * 60 * 60),
        );
        this.logger.debug(
          `📦 Incidente #${incident.id} archivado (${hoursOld} horas de antigüedad)`,
        );
      });

      return {
        archived: result.affected,
        incidents: oldIncidents.map(inc => ({
          id: inc.id,
          tipo: inc.tipo,
          fecha_creacion: inc.fecha_creacion,
        })),
      };
    } catch (error) {
      this.logger.error('❌ Error al archivar incidentes:', error);
      throw error;
    }
  }

  /**
   * Método manual para archivar incidentes (útil para testing)
   * Puede ser llamado desde un endpoint de admin
   */
  async manualArchive() {
    this.logger.log('🔧 Ejecución manual de archivo de incidentes');
    return this.archiveOldIncidents();
  }

  /**
   * Obtener estadísticas de incidentes archivados
   */
  async getArchivedStats() {
    const total = await this.incidentsRepository.count({
      where: { estado: IncidentStatus.ARCHIVADO },
    });

    const last24h = await this.incidentsRepository.count({
      where: {
        estado: IncidentStatus.ARCHIVADO,
        fecha_actualizacion: LessThan(
          new Date(Date.now() - 24 * 60 * 60 * 1000),
        ),
      },
    });

    return {
      total_archived: total,
      archived_last_24h: last24h,
    };
  }
}

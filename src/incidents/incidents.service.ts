import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Incident, IncidentStatus, IncidentSeverity } from './entity/incident.entity';
import { CreateIncidentDto, UpdateIncidentDto } from './dto/incident.dto';
import { UserRole } from '../users/entity/user.entity';
import { EventsGateway } from '../websockets/events.gateway';

@Injectable()
export class IncidentsService {
  constructor(
    @InjectRepository(Incident)
    private incidentsRepository: Repository<Incident>,
    private eventsGateway: EventsGateway,
  ) {}

  async create(createIncidentDto: CreateIncidentDto, userId: number): Promise<Incident> {
    const incident = this.incidentsRepository.create({
      ...createIncidentDto,
      usuario_id: userId,
    });

    const savedIncident = await this.incidentsRepository.save(incident);
    
    // Load full incident with relations
    const fullIncident = await this.findOne(savedIncident.id);
    
    // Emit WebSocket event for new incident
    this.eventsGateway.emitIncidentCreated({
      incident: {
        id: fullIncident.id,
        tipo: fullIncident.tipo,
        descripcion: fullIncident.descripcion,
        severidad: fullIncident.severidad,
        latitud: fullIncident.latitud,
        longitud: fullIncident.longitud,
        direccion: fullIncident.direccion,
        estado: fullIncident.estado,
        fecha_creacion: fullIncident.fecha_creacion,
        usuario: {
          id: fullIncident.usuario.id,
          nombre: fullIncident.usuario.nombre,
        },
      },
    });

    return fullIncident;
  }

  async findAll(filters?: {
    tipo?: string;
    severidad?: string;
    estado?: string;
    userId?: number;
  }): Promise<Incident[]> {
    const queryBuilder = this.incidentsRepository
      .createQueryBuilder('incident')
      .leftJoinAndSelect('incident.usuario', 'user');

    if (filters?.tipo) {
      queryBuilder.andWhere('incident.tipo = :tipo', { tipo: filters.tipo });
    }

    if (filters?.severidad) {
      queryBuilder.andWhere('incident.severidad = :severidad', { severidad: filters.severidad });
    }

    if (filters?.estado) {
      queryBuilder.andWhere('incident.estado = :estado', { estado: filters.estado });
    }

    if (filters?.userId) {
      queryBuilder.andWhere('incident.usuario_id = :userId', { userId: filters.userId });
    }

    return queryBuilder
      .orderBy('incident.fecha_creacion', 'DESC')
      .getMany();
  }

  async findOne(id: number): Promise<Incident> {
    const incident = await this.incidentsRepository.findOne({
      where: { id },
      relations: ['usuario'],
    });

    if (!incident) {
      throw new NotFoundException(`Incidente con ID ${id} no encontrado`);
    }

    return incident;
  }

  async update(
    id: number,
    updateIncidentDto: UpdateIncidentDto,
    userId: number,
    userRole: UserRole,
  ): Promise<Incident> {
    const incident = await this.findOne(id);
    const oldStatus = incident.estado;

    // Only allow owner to edit basic fields, admins and entities can change status
    if (incident.usuario_id !== userId && userRole === UserRole.CIUDADANO) {
      throw new ForbiddenException('No tienes permisos para editar este incidente');
    }

    // Citizens can't change status, only admins and entities
    if (updateIncidentDto.estado && userRole === UserRole.CIUDADANO) {
      throw new ForbiddenException('No tienes permisos para cambiar el estado del incidente');
    }

    await this.incidentsRepository.update(id, updateIncidentDto);
    const updatedIncident = await this.findOne(id);

    // Emit WebSocket event if status changed
    if (updateIncidentDto.estado && updateIncidentDto.estado !== oldStatus) {
      this.eventsGateway.emitIncidentUpdated({
        incidentId: id,
        oldStatus: oldStatus,
        newStatus: updateIncidentDto.estado,
        updatedBy: userId,
      });
    }

    return updatedIncident;
  }

  async remove(id: number, userId: number, userRole: UserRole): Promise<void> {
    const incident = await this.findOne(id);

    // Only allow owner or admin to delete
    if (incident.usuario_id !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('No tienes permisos para eliminar este incidente');
    }

    await this.incidentsRepository.remove(incident);
  }

  async getIncidentsByLocation(lat: number, lng: number, radius: number = 5): Promise<Incident[]> {
    // Simple distance calculation (you might want to use a more sophisticated geo query)
    return this.incidentsRepository
      .createQueryBuilder('incident')
      .leftJoinAndSelect('incident.usuario', 'user')
      .where(
        `(6371 * acos(cos(radians(:lat)) * cos(radians(incident.latitud)) * 
        cos(radians(incident.longitud) - radians(:lng)) + sin(radians(:lat)) * 
        sin(radians(incident.latitud)))) <= :radius`,
        { lat, lng, radius }
      )
      .orderBy('incident.fecha_creacion', 'DESC')
      .getMany();
  }

  async getStatistics(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    bySeverity: Record<string, number>;
    byType: Record<string, number>;
  }> {
    const total = await this.incidentsRepository.count();

    const byStatus = await this.incidentsRepository
      .createQueryBuilder('incident')
      .select('incident.estado', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('incident.estado')
      .getRawMany();

    const bySeverity = await this.incidentsRepository
      .createQueryBuilder('incident')
      .select('incident.severidad', 'severity')
      .addSelect('COUNT(*)', 'count')
      .groupBy('incident.severidad')
      .getRawMany();

    const byType = await this.incidentsRepository
      .createQueryBuilder('incident')
      .select('incident.tipo', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('incident.tipo')
      .getRawMany();

    return {
      total,
      byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item.status]: +item.count }), {}),
      bySeverity: bySeverity.reduce((acc, item) => ({ ...acc, [item.severity]: +item.count }), {}),
      byType: byType.reduce((acc, item) => ({ ...acc, [item.type]: +item.count }), {}),
    };
  }
}

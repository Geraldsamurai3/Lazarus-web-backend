import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Incident, IncidentStatus, IncidentSeverity } from './entity/incident.entity';
import { CreateIncidentDto, UpdateIncidentDto } from './dto/incident.dto';
import { EventsGateway } from '../websockets/events.gateway';
import { UserType } from '../common/enums/user-type.enum';

@Injectable()
export class IncidentsService {
  constructor(
    @InjectRepository(Incident)
    private incidentsRepository: Repository<Incident>,
    private eventsGateway: EventsGateway,
  ) {}

  async create(createIncidentDto: CreateIncidentDto, ciudadanoId: number): Promise<Incident> {
    const incident = this.incidentsRepository.create({
      ...createIncidentDto,
      ciudadano_id: ciudadanoId,
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
          id: fullIncident.ciudadano.id_ciudadano,
          nombre: `${fullIncident.ciudadano.nombre} ${fullIncident.ciudadano.apellidos}`,
        },
      },
    });

    return fullIncident;
  }

  async findAll(filters?: {
    tipo?: string;
    severidad?: string;
    estado?: string;
    ciudadanoId?: number;
  }): Promise<Incident[]> {
    const queryBuilder = this.incidentsRepository
      .createQueryBuilder('incident')
      .leftJoinAndSelect('incident.ciudadano', 'ciudadano');

    if (filters?.tipo) {
      queryBuilder.andWhere('incident.tipo = :tipo', { tipo: filters.tipo });
    }

    if (filters?.severidad) {
      queryBuilder.andWhere('incident.severidad = :severidad', { severidad: filters.severidad });
    }

    if (filters?.estado) {
      queryBuilder.andWhere('incident.estado = :estado', { estado: filters.estado });
    }

    if (filters?.ciudadanoId) {
      queryBuilder.andWhere('incident.ciudadano_id = :ciudadanoId', { ciudadanoId: filters.ciudadanoId });
    }

    return queryBuilder
      .orderBy('incident.fecha_creacion', 'DESC')
      .getMany();
  }

  async findOne(id: number): Promise<Incident> {
    const incident = await this.incidentsRepository.findOne({
      where: { id },
      relations: ['ciudadano'],
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
    userType: UserType,
  ): Promise<Incident> {
    const incident = await this.findOne(id);
    const oldStatus = incident.estado;

    // CIUDADANO: Solo puede editar sus propios incidentes y solo descripción/severidad
    if (userType === UserType.CIUDADANO) {
      if (incident.ciudadano_id !== userId) {
        throw new ForbiddenException('No puedes editar incidentes de otros usuarios');
      }
      if (updateIncidentDto.estado) {
        throw new ForbiddenException('Los ciudadanos no pueden cambiar el estado del incidente');
      }
    }

    // ENTIDAD: Puede cambiar el estado de cualquier incidente para gestionarlo
    // No puede cambiar otros campos que no sean el estado
    if (userType === UserType.ENTIDAD) {
      // Las entidades pueden cambiar el estado de cualquier incidente
      if (Object.keys(updateIncidentDto).length > 1 || 
          (Object.keys(updateIncidentDto).length === 1 && !updateIncidentDto.estado)) {
        throw new ForbiddenException('Las entidades solo pueden cambiar el estado del incidente');
      }
    }

    // ADMIN: Puede editar cualquier campo de cualquier incidente

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

  async remove(id: number, userId: number, userType: UserType): Promise<void> {
    const incident = await this.findOne(id);

    // Only allow owner or admin to delete
    if (incident.ciudadano_id !== userId && userType !== UserType.ADMIN) {
      throw new ForbiddenException('No tienes permisos para eliminar este incidente');
    }

    await this.incidentsRepository.remove(incident);
  }

  async getIncidentsByLocation(lat: number, lng: number, radius: number = 5): Promise<Incident[]> {
    // Simple distance calculation (you might want to use a more sophisticated geo query)
    return this.incidentsRepository
      .createQueryBuilder('incident')
      .leftJoinAndSelect('incident.ciudadano', 'ciudadano')
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



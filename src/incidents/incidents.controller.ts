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
  HttpCode,
  HttpStatus,
  ParseFloatPipe,
} from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDto, UpdateIncidentDto } from './dto/incident.dto';
import { Incident } from './entity/incident.entity';
import { UserRole } from '../users/entity/user.entity';

// TODO: Implement authentication decorators when auth is ready
// For now, we'll simulate user context with query parameters

@Controller('incidents')
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(ValidationPipe) createIncidentDto: CreateIncidentDto,
    @Query('userId', ParseIntPipe) userId: number, // TODO: Get from JWT token
  ): Promise<Incident> {
    return this.incidentsService.create(createIncidentDto, userId);
  }

  @Get()
  async findAll(
    @Query('tipo') tipo?: string,
    @Query('severidad') severidad?: string,
    @Query('estado') estado?: string,
    @Query('userId') userId?: number,
  ): Promise<Incident[]> {
    return this.incidentsService.findAll({
      tipo,
      severidad,
      estado,
      userId,
    });
  }

  @Get('statistics')
  async getStatistics() {
    return this.incidentsService.getStatistics();
  }

  @Get('nearby')
  async getNearbyIncidents(
    @Query('lat', ParseFloatPipe) lat: number,
    @Query('lng', ParseFloatPipe) lng: number,
    @Query('radius', ParseFloatPipe) radius: number = 5,
  ): Promise<Incident[]> {
    return this.incidentsService.getIncidentsByLocation(lat, lng, radius);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Incident> {
    return this.incidentsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateIncidentDto: UpdateIncidentDto,
    @Query('userId', ParseIntPipe) userId: number, // TODO: Get from JWT token
    @Query('userRole') userRole: UserRole = UserRole.CIUDADANO, // TODO: Get from JWT token
  ): Promise<Incident> {
    return this.incidentsService.update(id, updateIncidentDto, userId, userRole);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId', ParseIntPipe) userId: number, // TODO: Get from JWT token
    @Query('userRole') userRole: UserRole = UserRole.CIUDADANO, // TODO: Get from JWT token
  ): Promise<void> {
    return this.incidentsService.remove(id, userId, userRole);
  }
}

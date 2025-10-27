import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UserType } from '../common/enums/user-type.enum';

@Controller('statistics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  // ENTIDAD y ADMIN: Ver dashboard completo
  @Get('dashboard')
  @Roles(UserType.ENTIDAD, UserType.ADMIN)
  async getDashboardStats() {
    return this.statisticsService.getDashboardStats();
  }

  // ENTIDAD y ADMIN: Ver estadísticas de incidentes por estado
  @Get('incidents/status')
  @Roles(UserType.ENTIDAD, UserType.ADMIN)
  async getIncidentsByStatus() {
    return this.statisticsService.getIncidentsByStatus();
  }

  // ENTIDAD y ADMIN: Ver estadísticas de incidentes por severidad
  @Get('incidents/severity')
  @Roles(UserType.ENTIDAD, UserType.ADMIN)
  async getIncidentsBySeverity() {
    return this.statisticsService.getIncidentsBySeverity();
  }

  // ENTIDAD y ADMIN: Ver estadísticas de incidentes por tipo
  @Get('incidents/type')
  @Roles(UserType.ENTIDAD, UserType.ADMIN)
  async getIncidentsByType() {
    return this.statisticsService.getIncidentsByType();
  }

  // ADMIN: Ver estadísticas de usuarios por tipo
  @Get('users/type')
  @Roles(UserType.ADMIN)
  async getUsersByType() {
    return this.statisticsService.getUsersByType();
  }

  // ENTIDAD y ADMIN: Ver incidentes recientes
  @Get('incidents/recent')
  @Roles(UserType.ENTIDAD, UserType.ADMIN)
  async getRecentIncidents(@Query('limit') limit?: number) {
    return this.statisticsService.getRecentIncidents(limit);
  }

  // ENTIDAD y ADMIN: Ver tendencias de incidentes
  @Get('incidents/trends')
  @Roles(UserType.ENTIDAD, UserType.ADMIN)
  async getIncidentTrends(@Query('days') days?: number) {
    return this.statisticsService.getIncidentTrends(days);
  }

  // ENTIDAD y ADMIN: Ver incidentes por ubicación
  @Get('incidents/location')
  @Roles(UserType.ENTIDAD, UserType.ADMIN)
  async getIncidentsByLocation() {
    return this.statisticsService.getIncidentsByLocation();
  }

  // TODOS: Ver estadísticas de actividad de usuario (propio o admin puede ver de otros)
  @Get('users/:userId/activity')
  @Roles(UserType.CIUDADANO, UserType.ENTIDAD, UserType.ADMIN)
  async getUserActivityStats(
    @Param('userId', ParseIntPipe) userId: number,
    @GetUser('userId') currentUserId: number,
    @GetUser('userType') currentUserType: UserType,
  ) {
    // Ciudadanos solo pueden ver sus propias estadísticas
    if (currentUserType === UserType.CIUDADANO && userId !== currentUserId) {
      throw new Error('No puedes ver estadísticas de otros usuarios');
    }
    return this.statisticsService.getUserActivityStats(userId, currentUserType);
  }
}

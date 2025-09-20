import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { StatisticsService } from './statistics.service';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('dashboard')
  async getDashboardStats() {
    return this.statisticsService.getDashboardStats();
  }

  @Get('incidents/status')
  async getIncidentsByStatus() {
    return this.statisticsService.getIncidentsByStatus();
  }

  @Get('incidents/severity')
  async getIncidentsBySeverity() {
    return this.statisticsService.getIncidentsBySeverity();
  }

  @Get('incidents/type')
  async getIncidentsByType() {
    return this.statisticsService.getIncidentsByType();
  }

  @Get('users/role')
  async getUsersByRole() {
    return this.statisticsService.getUsersByRole();
  }

  @Get('incidents/recent')
  async getRecentIncidents(@Query('limit') limit?: number) {
    return this.statisticsService.getRecentIncidents(limit);
  }

  @Get('incidents/trends')
  async getIncidentTrends(@Query('days') days?: number) {
    return this.statisticsService.getIncidentTrends(days);
  }

  @Get('incidents/location')
  async getIncidentsByLocation() {
    return this.statisticsService.getIncidentsByLocation();
  }

  @Get('users/:userId/activity')
  async getUserActivityStats(@Param('userId', ParseIntPipe) userId: number) {
    return this.statisticsService.getUserActivityStats(userId);
  }
}
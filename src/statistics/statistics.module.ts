import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { Incident } from '../incidents/entity/incident.entity';
import { Ciudadano } from '../users/entity/ciudadano.entity';
import { EntidadPublica } from '../users/entity/entidad-publica.entity';
import { Administrador } from '../users/entity/administrador.entity';
import { Notification } from '../notifications/entity/notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Incident, Ciudadano, EntidadPublica, Administrador, Notification])],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}

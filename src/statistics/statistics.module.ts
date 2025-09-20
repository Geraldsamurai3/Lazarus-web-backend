import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { Incident } from '../incidents/entity/incident.entity';
import { User } from '../users/entity/user.entity';
import { Notification } from '../notifications/entity/notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Incident, User, Notification])],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}

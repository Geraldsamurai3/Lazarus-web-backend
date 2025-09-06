import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { IncidentsModule } from './incidents/incidents.module';
import { IncidentMediaModule } from './incident-media/incident-media.module';
import { NotificationsModule } from './notifications/notifications.module';
import { StatisticsModule } from './statistics/statistics.module';

@Module({
  imports: [AuthModule, UsersModule, IncidentsModule, IncidentMediaModule, NotificationsModule, StatisticsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

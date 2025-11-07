import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncidentsController } from './incidents.controller';
import { IncidentsService } from './incidents.service';
import { Incident } from './entity/incident.entity';
import { WebsocketsModule } from '../websockets/websockets.module';
import { UsersModule } from '../users/users.module';
import { EmailModule } from '../email/email.module';
import { IncidentMediaModule } from '../incident-media/incident-media.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Incident]),
    WebsocketsModule,
    UsersModule,
    EmailModule,
    IncidentMediaModule,
  ],
  controllers: [IncidentsController],
  providers: [IncidentsService],
  exports: [IncidentsService],
})
export class IncidentsModule {}

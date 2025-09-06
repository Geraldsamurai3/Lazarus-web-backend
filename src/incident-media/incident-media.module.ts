import { Module } from '@nestjs/common';
import { IncidentMediaService } from './incident-media.service';
import { IncidentMediaController } from './incident-media.controller';

@Module({
  providers: [IncidentMediaService],
  controllers: [IncidentMediaController]
})
export class IncidentMediaModule {}

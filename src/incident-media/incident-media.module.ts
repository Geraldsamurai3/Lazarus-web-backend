import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncidentMediaService } from './incident-media.service';
import { IncidentMediaController } from './incident-media.controller';
import { IncidentMedia } from './entity/incident-media.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([IncidentMedia]),
    CloudinaryModule,
  ],
  providers: [IncidentMediaService],
  controllers: [IncidentMediaController],
  exports: [IncidentMediaService],
})
export class IncidentMediaModule {}

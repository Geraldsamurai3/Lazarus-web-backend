import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { Incident } from '../incidents/entity/incident.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Incident])],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}

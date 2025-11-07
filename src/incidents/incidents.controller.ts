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
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDto, UpdateIncidentDto } from './dto/incident.dto';
import { Incident } from './entity/incident.entity';
import { UserType } from '../common/enums/user-type.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('incidents')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor) // ← Aplicar serialización
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  // CIUDADANO: Crear incidentes (con archivos multimedia opcionales)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserType.CIUDADANO, UserType.ADMIN)
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB por archivo
      },
      fileFilter: (req, file, cb) => {
        const allowedMimes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/gif',
          'image/webp',
          'video/mp4',
          'video/mpeg',
          'video/quicktime',
          'video/webm',
        ];

        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Formato no válido. Solo se aceptan imágenes (JPEG, PNG, GIF, WebP) y videos (MP4, MPEG, MOV, WebM)',
            ),
            false,
          );
        }
      },
    }),
  )
  async create(
    @Body(ValidationPipe) createIncidentDto: CreateIncidentDto,
    @GetUser('userId') userId: number,
    @UploadedFiles() files?: Express.Multer.File[],
  ): Promise<Incident> {
    return this.incidentsService.create(createIncidentDto, userId, files);
  }

  // TODOS: Ver todos los incidentes (con filtros)
  @Get()
  @Roles(UserType.CIUDADANO, UserType.ENTIDAD, UserType.ADMIN)
  async findAll(
    @Query('tipo') tipo?: string,
    @Query('severidad') severidad?: string,
    @Query('estado') estado?: string,
    @Query('ciudadanoId') ciudadanoId?: number,
  ): Promise<Incident[]> {
    return this.incidentsService.findAll({
      tipo,
      severidad,
      estado,
      ciudadanoId,
    });
  }

  // ENTIDAD y ADMIN: Ver estadísticas
  @Get('statistics')
  @Roles(UserType.ENTIDAD, UserType.ADMIN)
  async getStatistics() {
    return this.incidentsService.getStatistics();
  }

  // TODOS: Ver incidentes cercanos (importante para ciudadanos)
  @Get('nearby')
  @Roles(UserType.CIUDADANO, UserType.ENTIDAD, UserType.ADMIN)
  async getNearbyIncidents(
    @Query('lat', ParseFloatPipe) lat: number,
    @Query('lng', ParseFloatPipe) lng: number,
    @Query('radius', ParseFloatPipe) radius: number = 5,
  ): Promise<Incident[]> {
    return this.incidentsService.getIncidentsByLocation(lat, lng, radius);
  }

  // TODOS: Ver detalle de un incidente
  @Get(':id')
  @Roles(UserType.CIUDADANO, UserType.ENTIDAD, UserType.ADMIN)
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Incident> {
    return this.incidentsService.findOne(id);
  }

  // CIUDADANO: Editar sus propios incidentes
  // ENTIDAD: Cambiar estado de cualquier incidente
  // ADMIN: Editar cualquier incidente
  @Patch(':id')
  @Roles(UserType.CIUDADANO, UserType.ENTIDAD, UserType.ADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateIncidentDto: UpdateIncidentDto,
    @GetUser('userId') userId: number,
    @GetUser('userType') userType: UserType,
  ): Promise<Incident> {
    return this.incidentsService.update(id, updateIncidentDto, userId, userType);
  }

  // CIUDADANO: Eliminar sus propios incidentes
  // ADMIN: Eliminar cualquier incidente
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserType.CIUDADANO, UserType.ADMIN)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('userId') userId: number,
    @GetUser('userType') userType: UserType,
  ): Promise<void> {
    return this.incidentsService.remove(id, userId, userType);
  }
}


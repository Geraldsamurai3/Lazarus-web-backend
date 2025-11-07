import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFiles,
  ParseIntPipe,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { IncidentMediaService } from './incident-media.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('incident-media')
@UseGuards(JwtAuthGuard)
export class IncidentMediaController {
  constructor(private readonly incidentMediaService: IncidentMediaService) {}

  /**
   * Sube archivos multimedia para un incidente
   * POST /incident-media/upload/:incidentId
   * @param incidentId - ID del incidente
   * @param files - Archivos a subir (máximo 10)
   */
  @Post('upload/:incidentId')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB por archivo
      },
      fileFilter: (req, file, cb) => {
        // Aceptar solo imágenes y videos
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
  async uploadFiles(
    @Param('incidentId', ParseIntPipe) incidentId: number,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No se han subido archivos');
    }

    const uploadedMedia =
      await this.incidentMediaService.uploadMedia(incidentId, files);

    return {
      message: `${uploadedMedia.length} archivo(s) subido(s) exitosamente`,
      data: uploadedMedia,
    };
  }

  /**
   * Obtiene todos los archivos multimedia de un incidente
   * GET /incident-media/incident/:incidentId
   * @param incidentId - ID del incidente
   */
  @Get('incident/:incidentId')
  async getMediaByIncident(@Param('incidentId', ParseIntPipe) incidentId: number) {
    const media =
      await this.incidentMediaService.getMediaByIncident(incidentId);

    return {
      message: 'Archivos multimedia obtenidos exitosamente',
      data: media,
    };
  }

  /**
   * Elimina un archivo multimedia específico
   * DELETE /incident-media/:id
   * @param id - ID del archivo multimedia
   */
  @Delete(':id')
  async deleteMedia(@Param('id', ParseIntPipe) id: number) {
    const deletedMedia = await this.incidentMediaService.deleteMedia(id);

    return {
      message: 'Archivo multimedia eliminado exitosamente',
      data: deletedMedia,
    };
  }

  /**
   * Elimina todos los archivos multimedia de un incidente
   * DELETE /incident-media/incident/:incidentId/all
   * @param incidentId - ID del incidente
   */
  @Delete('incident/:incidentId/all')
  async deleteAllMediaByIncident(
    @Param('incidentId', ParseIntPipe) incidentId: number,
  ) {
    const count =
      await this.incidentMediaService.deleteAllMediaByIncident(incidentId);

    return {
      message: `${count} archivo(s) eliminado(s) exitosamente`,
      count,
    };
  }
}


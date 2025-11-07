import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IncidentMedia, MediaType } from './entity/incident-media.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UploadApiResponse } from 'cloudinary';

@Injectable()
export class IncidentMediaService {
  constructor(
    @InjectRepository(IncidentMedia)
    private readonly incidentMediaRepository: Repository<IncidentMedia>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  /**
   * Sube archivos multimedia para un incidente
   * @param incidentId - ID del incidente
   * @param files - Archivos a subir
   * @returns Array de registros de media creados
   */
  async uploadMedia(
    incidentId: number,
    files: Express.Multer.File[],
  ): Promise<IncidentMedia[]> {
    // Subir archivos a Cloudinary
    const uploadResults: UploadApiResponse[] =
      await this.cloudinaryService.uploadMultipleFiles(
        files,
        `lazarus/incidents/${incidentId}`,
      );

    // Crear registros en la base de datos
    const mediaRecords = uploadResults.map((result, index) => {
      const file = files[index];
      return this.incidentMediaRepository.create({
        incidente_id: incidentId,
        url: result.secure_url,
        public_id: result.public_id,
        tipo: result.resource_type === 'video' ? MediaType.VIDEO : MediaType.FOTO,
        formato: result.format,
        tamanio: result.bytes,
      });
    });

    return this.incidentMediaRepository.save(mediaRecords);
  }

  /**
   * Obtiene todos los archivos multimedia de un incidente
   * @param incidentId - ID del incidente
   * @returns Array de archivos multimedia
   */
  async getMediaByIncident(incidentId: number): Promise<IncidentMedia[]> {
    return this.incidentMediaRepository.find({
      where: { incidente_id: incidentId },
      order: { fecha_subida: 'ASC' },
    });
  }

  /**
   * Elimina un archivo multimedia
   * @param id - ID del registro de media
   * @returns Registro eliminado
   */
  async deleteMedia(id: number): Promise<IncidentMedia> {
    const media = await this.incidentMediaRepository.findOne({
      where: { id },
    });

    if (!media) {
      throw new NotFoundException(`Media con ID ${id} no encontrado`);
    }

    // Eliminar de Cloudinary
    await this.cloudinaryService.deleteFile(media.public_id);

    // Eliminar de la base de datos
    await this.incidentMediaRepository.remove(media);

    return media;
  }

  /**
   * Elimina todos los archivos multimedia de un incidente
   * @param incidentId - ID del incidente
   * @returns Número de archivos eliminados
   */
  async deleteAllMediaByIncident(incidentId: number): Promise<number> {
    const mediaFiles = await this.getMediaByIncident(incidentId);

    if (mediaFiles.length === 0) {
      return 0;
    }

    // Eliminar de Cloudinary
    const publicIds = mediaFiles.map((media) => media.public_id);
    await this.cloudinaryService.deleteMultipleFiles(publicIds);

    // Eliminar de la base de datos
    await this.incidentMediaRepository.remove(mediaFiles);

    return mediaFiles.length;
  }
}


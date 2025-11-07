import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  /**
   * Sube un archivo a Cloudinary desde un buffer
   * @param file - Archivo de Multer
   * @param folder - Carpeta en Cloudinary (default: 'lazarus/incidents')
   * @returns Promise con la respuesta de Cloudinary
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'lazarus/incidents',
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'auto', // Detecta automáticamente si es imagen o video
          transformation: [
            { quality: 'auto:good' }, // Optimización automática de calidad
            { fetch_format: 'auto' }, // Formato automático (WebP, etc.)
          ],
        },
        (error: UploadApiErrorResponse, result: UploadApiResponse) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  /**
   * Elimina un archivo de Cloudinary
   * @param publicId - ID público del archivo en Cloudinary
   * @returns Promise con la respuesta de Cloudinary
   */
  async deleteFile(publicId: string): Promise<any> {
    return cloudinary.uploader.destroy(publicId);
  }

  /**
   * Sube múltiples archivos
   * @param files - Array de archivos de Multer
   * @param folder - Carpeta en Cloudinary
   * @returns Promise con array de respuestas
   */
  async uploadMultipleFiles(
    files: Express.Multer.File[],
    folder: string = 'lazarus/incidents',
  ): Promise<UploadApiResponse[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }

  /**
   * Elimina múltiples archivos
   * @param publicIds - Array de IDs públicos
   * @returns Promise con array de respuestas
   */
  async deleteMultipleFiles(publicIds: string[]): Promise<any[]> {
    const deletePromises = publicIds.map((publicId) =>
      this.deleteFile(publicId),
    );
    return Promise.all(deletePromises);
  }
}

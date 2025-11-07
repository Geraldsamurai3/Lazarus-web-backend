-- ================================================
-- MIGRACIONES COMPLETAS PARA CLOUDINARY
-- Ejecutar en orden
-- ================================================

-- 1. Actualizar tabla incident_media para Cloudinary
ALTER TABLE incident_media 
ADD COLUMN public_id VARCHAR(255) NULL COMMENT 'ID de Cloudinary para poder eliminar archivos',
ADD COLUMN formato VARCHAR(50) NULL COMMENT 'Formato del archivo (jpg, png, mp4, webp, etc.)',
ADD COLUMN tamanio BIGINT NULL COMMENT 'Tamaño del archivo en bytes';

-- 2. Actualizar ENUM de tipos
ALTER TABLE incident_media 
MODIFY COLUMN tipo ENUM('foto', 'video') NOT NULL;

-- 3. Agregar índice para búsquedas rápidas
CREATE INDEX idx_incident_media_public_id ON incident_media(public_id);

-- 4. Eliminar columna obsoleta 'imagenes' de incidentes
-- (ya no se usa, ahora todo está en incident_media)
ALTER TABLE incidentes DROP COLUMN imagenes;

-- ================================================
-- VERIFICAR RESULTADOS
-- ================================================

-- Ver estructura de incident_media
DESCRIBE incident_media;
-- Debe tener: id, incidente_id, url, public_id, tipo, formato, tamanio, fecha_subida

-- Ver estructura de incidentes
DESCRIBE incidentes;
-- NO debe tener columna 'imagenes'

-- ================================================
-- LISTO! Ahora reinicia el servidor
-- npm run start:dev
-- ================================================

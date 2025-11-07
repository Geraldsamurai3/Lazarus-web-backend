-- Migración: Actualización de tabla incident_media para soporte de Cloudinary
-- Fecha: 2025-11-07
-- Descripción: Agrega campos necesarios para integración con Cloudinary

-- 1. Agregar nuevos campos
ALTER TABLE incident_media 
ADD COLUMN public_id VARCHAR(255) NULL COMMENT 'ID público de Cloudinary para gestión de archivos',
ADD COLUMN formato VARCHAR(50) NULL COMMENT 'Formato del archivo (jpg, png, mp4, webp, etc.)',
ADD COLUMN tamanio BIGINT NULL COMMENT 'Tamaño del archivo en bytes';

-- 2. Actualizar el ENUM de tipo para usar 'foto' y 'video'
ALTER TABLE incident_media 
MODIFY COLUMN tipo ENUM('foto', 'video') NOT NULL;

-- 3. Agregar índice para mejorar búsquedas por public_id
CREATE INDEX idx_incident_media_public_id ON incident_media(public_id);

-- 4. Verificar la estructura actualizada
DESCRIBE incident_media;

-- Resultado esperado:
-- +---------------+---------------------+------+-----+-------------------+
-- | Field         | Type                | Null | Key | Default           |
-- +---------------+---------------------+------+-----+-------------------+
-- | id            | int(11)             | NO   | PRI | NULL              |
-- | incidente_id  | int(11)             | NO   | MUL | NULL              |
-- | url           | varchar(255)        | NO   |     | NULL              |
-- | public_id     | varchar(255)        | YES  | MUL | NULL              |
-- | tipo          | enum('foto','video')| NO   |     | NULL              |
-- | formato       | varchar(50)         | YES  |     | NULL              |
-- | tamanio       | bigint(20)          | YES  |     | NULL              |
-- | fecha_subida  | timestamp           | NO   |     | CURRENT_TIMESTAMP |
-- +---------------+---------------------+------+-----+-------------------+

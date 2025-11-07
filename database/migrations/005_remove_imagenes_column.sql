-- Migración: Eliminar columna 'imagenes' obsoleta de la tabla incidentes
-- Fecha: 2025-11-07
-- Descripción: La columna 'imagenes' ya no se usa. Ahora usamos la tabla incident_media con Cloudinary

-- Eliminar la columna imagenes (ya no se usa)
ALTER TABLE incidentes DROP COLUMN imagenes;

-- Verificar la estructura actualizada
DESCRIBE incidentes;

-- Resultado esperado (sin la columna imagenes):
-- +---------------------+------------------------------------------+------+-----+-------------------+
-- | Field               | Type                                     | Null | Key | Default           |
-- +---------------------+------------------------------------------+------+-----+-------------------+
-- | id                  | int(11)                                  | NO   | PRI | NULL              |
-- | ciudadano_id        | int(11)                                  | NO   | MUL | NULL              |
-- | tipo                | enum('INCENDIO','ACCIDENTE',...)        | NO   |     | NULL              |
-- | descripcion         | text                                     | NO   |     | NULL              |
-- | severidad           | enum('BAJA','MEDIA','ALTA','CRITICA')   | NO   |     | NULL              |
-- | latitud             | decimal(10,8)                            | NO   |     | NULL              |
-- | longitud            | decimal(11,8)                            | NO   |     | NULL              |
-- | direccion           | varchar(255)                             | NO   |     | NULL              |
-- | estado              | enum('PENDIENTE','EN_PROCESO',...)      | NO   |     | PENDIENTE         |
-- | fecha_creacion      | timestamp                                | NO   |     | CURRENT_TIMESTAMP |
-- | fecha_actualizacion | timestamp                                | NO   |     | CURRENT_TIMESTAMP |
-- +---------------------+------------------------------------------+------+-----+-------------------+

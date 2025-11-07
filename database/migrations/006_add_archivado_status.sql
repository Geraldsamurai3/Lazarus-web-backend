-- Migración: Agregar estado ARCHIVADO a incidentes
-- Fecha: 2025-11-07
-- Descripción: Los incidentes se archivan automáticamente después de 48 horas

-- 1. Modificar ENUM para agregar el estado ARCHIVADO
ALTER TABLE incidentes 
MODIFY COLUMN estado 
ENUM('PENDIENTE', 'EN_PROCESO', 'RESUELTO', 'CANCELADO', 'ARCHIVADO') 
NOT NULL 
DEFAULT 'PENDIENTE';

-- 2. Verificar la estructura
DESCRIBE incidentes;

-- 3. (Opcional) Archivar incidentes antiguos existentes
-- Descomentar si quieres archivar incidentes viejos de inmediato
/*
UPDATE incidentes 
SET estado = 'ARCHIVADO' 
WHERE fecha_creacion < DATE_SUB(NOW(), INTERVAL 48 HOUR)
  AND estado != 'ARCHIVADO';
*/

-- 4. Ver cuántos incidentes serían archivados
SELECT COUNT(*) as incidentes_a_archivar
FROM incidentes 
WHERE fecha_creacion < DATE_SUB(NOW(), INTERVAL 48 HOUR)
  AND estado != 'ARCHIVADO';

-- 5. Verificar que todo funciona
SELECT estado, COUNT(*) as cantidad
FROM incidentes
GROUP BY estado;

-- ================================================
-- LISTO! 
-- El servidor ejecutará la tarea CRON automáticamente
-- todos los días a las 00:00 para archivar incidentes
-- ================================================

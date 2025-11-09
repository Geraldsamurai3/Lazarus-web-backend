# 🚀 Configuración Rápida de Cloudinary - Lazarus

## ✅ Lo que ya está hecho:

1. ✅ Instalación de dependencias (cloudinary, multer, streamifier)
2. ✅ Módulo de Cloudinary creado (`src/cloudinary/`)
3. ✅ Servicio de manejo de archivos implementado
4. ✅ Entidad actualizada con campos nuevos
5. ✅ Endpoints REST completos
6. ✅ Validaciones de archivos (tipo, tamaño, cantidad)
7. ✅ Documentación completa
8. ✅ Ejemplos de frontend

## ⚠️ Lo que DEBES hacer ahora:

### 1. Obtener credenciales de Cloudinary (5 minutos)

1. Ve a https://cloudinary.com/users/register_free
2. Crea una cuenta gratuita
3. Ve al Dashboard
4. Copia tus credenciales:
   - Cloud name
   - API Key
   - API Secret

### 2. Configurar el .env

Abre `.env` y reemplaza:

```env
CLOUDINARY_CLOUD_NAME=tu_cloud_name_aqui
CLOUDINARY_API_KEY=tu_api_key_aqui
CLOUDINARY_API_SECRET=tu_api_secret_aqui
```

### 3. Ejecutar migración de base de datos

```sql
-- Ejecuta en tu MariaDB:
source database/migrations/004_update_incident_media_cloudinary.sql
```

O manualmente:

```sql
ALTER TABLE incident_media 
ADD COLUMN public_id VARCHAR(255) NULL,
ADD COLUMN formato VARCHAR(50) NULL,
ADD COLUMN tamanio BIGINT NULL;

ALTER TABLE incident_media 
MODIFY COLUMN tipo ENUM('foto', 'video') NOT NULL;

CREATE INDEX idx_incident_media_public_id ON incident_media(public_id);
```

### 4. Reiniciar el servidor

```bash
npm run start:dev
```

### 5. Probar con Postman o cURL

```bash
# Subir archivos
curl -X POST http://localhost:3000/incident-media/upload/1 \
  -H "Authorization: Bearer TU_TOKEN_JWT" \
  -F "files=@foto1.jpg" \
  -F "files=@video1.mp4"

# Ver archivos de un incidente
curl -X GET http://localhost:3000/incident-media/incident/1 \
  -H "Authorization: Bearer TU_TOKEN_JWT"

# Eliminar un archivo
curl -X DELETE http://localhost:3000/incident-media/5 \
  -H "Authorization: Bearer TU_TOKEN_JWT"
```

## 📌 Endpoints disponibles:

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/incident-media/upload/:incidentId` | Subir archivos (máx 10) |
| GET | `/incident-media/incident/:incidentId` | Ver archivos de un incidente |
| DELETE | `/incident-media/:id` | Eliminar un archivo |
| DELETE | `/incident-media/incident/:incidentId/all` | Eliminar todos los archivos |

## 🔒 Validaciones automáticas:

- ✅ Solo imágenes: JPEG, PNG, GIF, WebP
- ✅ Solo videos: MP4, MPEG, MOV, WebM
- ✅ Tamaño máximo: 10 MB por archivo
- ✅ Máximo 10 archivos por petición
- ✅ Requiere autenticación JWT

## 📚 Documentación completa:

- **CLOUDINARY_SETUP.md** - Guía completa de implementación
- **examples/frontend-media-integration.tsx** - Código React listo para usar

## 🎉 ¡Listo para usar!

Una vez configuradas las credenciales y ejecutada la migración, el sistema está completamente funcional.

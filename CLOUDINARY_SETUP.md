# 📸 Configuración de Cloudinary para Lazarus

## 🎯 Descripción

Sistema de manejo de archivos multimedia (imágenes y videos) para incidentes usando **Cloudinary** como servicio de almacenamiento en la nube.

---

## 🚀 Configuración Inicial

### 1. Crear Cuenta en Cloudinary

1. Ir a [cloudinary.com](https://cloudinary.com/)
2. Crear una cuenta gratuita (incluye 25 GB de almacenamiento y 25 GB de ancho de banda mensual)
3. Una vez registrado, ir al **Dashboard**

### 2. Obtener Credenciales

En el Dashboard de Cloudinary, encontrarás:

```
Cloud name: your_cloud_name
API Key: your_api_key
API Secret: your_api_secret
```

### 3. Configurar Variables de Entorno

Edita el archivo `.env` y agrega tus credenciales:

```properties
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=tu_cloud_name_aqui
CLOUDINARY_API_KEY=tu_api_key_aqui
CLOUDINARY_API_SECRET=tu_api_secret_aqui
```

**⚠️ IMPORTANTE:** No compartas estas credenciales en repositorios públicos.

---

## 📁 Estructura de Archivos

```
src/
├── cloudinary/
│   ├── cloudinary.provider.ts    # Configuración de Cloudinary
│   ├── cloudinary.service.ts     # Lógica de subida/eliminación
│   └── cloudinary.module.ts      # Módulo exportable
├── incident-media/
│   ├── entity/
│   │   └── incident-media.entity.ts   # Entidad actualizada
│   ├── incident-media.controller.ts   # Endpoints REST
│   ├── incident-media.service.ts      # Lógica de negocio
│   └── incident-media.module.ts       # Módulo con Cloudinary
```

---

## 🔧 Cambios en la Base de Datos

Se agregaron nuevos campos a la tabla `incident_media`:

```sql
ALTER TABLE incident_media 
ADD COLUMN public_id VARCHAR(255) NULL COMMENT 'ID público de Cloudinary',
ADD COLUMN formato VARCHAR(50) NULL COMMENT 'Formato del archivo (jpg, png, mp4, etc.)',
ADD COLUMN tamanio BIGINT NULL COMMENT 'Tamaño en bytes';

-- Actualizar enum de tipo
ALTER TABLE incident_media 
MODIFY COLUMN tipo ENUM('foto', 'video') NOT NULL;
```

**⚠️ IMPORTANTE:** El campo `imagenes` de la tabla `incidentes` YA NO SE USA. Ahora las imágenes/videos se guardan en la tabla `incident_media` con URLs de Cloudinary.

```sql
-- Eliminar campo obsoleto
ALTER TABLE incidentes DROP COLUMN imagenes;
```

---

## 📡 Endpoints API

### 1. Subir Archivos Multimedia

```http
POST /incident-media/upload/:incidentId
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data

Body (form-data):
- files: [archivo1.jpg, archivo2.mp4, ...] (máximo 10 archivos)
```

**Ejemplo con cURL:**

```bash
curl -X POST http://localhost:3000/incident-media/upload/1 \
  -H "Authorization: Bearer tu_token_jwt" \
  -F "files=@foto1.jpg" \
  -F "files=@foto2.png" \
  -F "files=@video1.mp4"
```

**Ejemplo con JavaScript (FormData):**

```javascript
const formData = new FormData();
formData.append('files', file1); // File object
formData.append('files', file2);
formData.append('files', video1);

const response = await fetch(`/incident-media/upload/${incidentId}`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
console.log(result);
// {
//   "message": "3 archivo(s) subido(s) exitosamente",
//   "data": [...]
// }
```

**Respuesta exitosa:**

```json
{
  "message": "3 archivo(s) subido(s) exitosamente",
  "data": [
    {
      "id": 1,
      "incidente_id": 1,
      "url": "https://res.cloudinary.com/demo/image/upload/v1234567890/lazarus/incidents/1/abc123.jpg",
      "public_id": "lazarus/incidents/1/abc123",
      "tipo": "foto",
      "formato": "jpg",
      "tamanio": 245678,
      "fecha_subida": "2025-11-07T10:30:00.000Z"
    },
    {
      "id": 2,
      "incidente_id": 1,
      "url": "https://res.cloudinary.com/demo/video/upload/v1234567890/lazarus/incidents/1/xyz789.mp4",
      "public_id": "lazarus/incidents/1/xyz789",
      "tipo": "video",
      "formato": "mp4",
      "tamanio": 5428900,
      "fecha_subida": "2025-11-07T10:30:05.000Z"
    }
  ]
}
```

**Validaciones:**
- ✅ Formatos permitidos: JPEG, JPG, PNG, GIF, WebP (imágenes) | MP4, MPEG, MOV, WebM (videos)
- ✅ Tamaño máximo por archivo: 10 MB
- ✅ Máximo de archivos por petición: 10
- ✅ Requiere autenticación JWT

---

### 2. Obtener Archivos de un Incidente

```http
GET /incident-media/incident/:incidentId
Authorization: Bearer <JWT_TOKEN>
```

**Ejemplo:**

```bash
curl -X GET http://localhost:3000/incident-media/incident/1 \
  -H "Authorization: Bearer tu_token_jwt"
```

**Respuesta:**

```json
{
  "message": "Archivos multimedia obtenidos exitosamente",
  "data": [
    {
      "id": 1,
      "incidente_id": 1,
      "url": "https://res.cloudinary.com/.../foto.jpg",
      "public_id": "lazarus/incidents/1/abc123",
      "tipo": "foto",
      "formato": "jpg",
      "tamanio": 245678,
      "fecha_subida": "2025-11-07T10:30:00.000Z"
    }
  ]
}
```

---

### 3. Eliminar un Archivo Específico

```http
DELETE /incident-media/:id
Authorization: Bearer <JWT_TOKEN>
```

**Ejemplo:**

```bash
curl -X DELETE http://localhost:3000/incident-media/5 \
  -H "Authorization: Bearer tu_token_jwt"
```

**Respuesta:**

```json
{
  "message": "Archivo multimedia eliminado exitosamente",
  "data": {
    "id": 5,
    "url": "https://res.cloudinary.com/.../foto.jpg",
    "tipo": "foto"
  }
}
```

**⚠️ Nota:** Este endpoint elimina el archivo tanto de **Cloudinary** como de la **base de datos**.

---

### 4. Eliminar Todos los Archivos de un Incidente

```http
DELETE /incident-media/incident/:incidentId/all
Authorization: Bearer <JWT_TOKEN>
```

**Ejemplo:**

```bash
curl -X DELETE http://localhost:3000/incident-media/incident/1/all \
  -H "Authorization: Bearer tu_token_jwt"
```

**Respuesta:**

```json
{
  "message": "5 archivo(s) eliminado(s) exitosamente",
  "count": 5
}
```

---

## 🎨 Características de Cloudinary

### Optimización Automática

Los archivos se suben con optimización automática:

```javascript
transformation: [
  { quality: 'auto:good' },  // Calidad adaptativa
  { fetch_format: 'auto' },  // Formato automático (WebP si el navegador lo soporta)
]
```

### Organización por Carpetas

Los archivos se organizan automáticamente:

```
lazarus/
└── incidents/
    ├── 1/          # Incidente ID 1
    │   ├── abc123.jpg
    │   └── xyz789.mp4
    ├── 2/          # Incidente ID 2
    │   └── def456.png
    └── ...
```

### URLs Seguras

Todas las URLs usan HTTPS automáticamente:

```
https://res.cloudinary.com/your_cloud_name/image/upload/v1234567890/lazarus/incidents/1/abc123.jpg
```

---

## 🧪 Pruebas con Postman

### Configuración

1. Crear una nueva colección "Lazarus - Media"
2. Agregar variable de entorno `{{baseUrl}}` = `http://localhost:3000`
3. Agregar variable de entorno `{{token}}` = tu JWT token

### Request: Subir Archivos

```
POST {{baseUrl}}/incident-media/upload/1
Headers:
  Authorization: Bearer {{token}}
Body: form-data
  files: [seleccionar archivos desde tu computadora]
```

---

## 🔒 Seguridad

### Protección de Endpoints

Todos los endpoints están protegidos con `JwtAuthGuard`:

```typescript
@Controller('incident-media')
@UseGuards(JwtAuthGuard)  // ← Requiere autenticación
export class IncidentMediaController { ... }
```

### Validación de Archivos

- **Tipo MIME:** Solo imágenes y videos permitidos
- **Tamaño:** Máximo 10 MB por archivo
- **Cantidad:** Máximo 10 archivos por petición

---

## 📊 Modelo de Datos

### Entidad IncidentMedia

```typescript
{
  id: number;              // ID autoincremental
  incidente_id: number;    // FK a incident table
  url: string;             // URL de Cloudinary
  public_id: string;       // ID de Cloudinary (para eliminar)
  tipo: 'foto' | 'video';  // Tipo de media
  formato: string;         // jpg, png, mp4, etc.
  tamanio: number;         // Bytes
  fecha_subida: Date;      // Timestamp automático
}
```

---

## 🐛 Troubleshooting

### Error: "Invalid API credentials"

**Problema:** Credenciales incorrectas en `.env`

**Solución:**
1. Verifica que copiaste correctamente `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET`
2. Reinicia el servidor: `npm run start:dev`

---

### Error: "File too large"

**Problema:** Archivo excede 10 MB

**Solución:**
1. Comprime la imagen/video antes de subir
2. O aumenta el límite en `incident-media.controller.ts`:

```typescript
FilesInterceptor('files', 10, {
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  },
  // ...
})
```

---

### Error: "Formato no válido"

**Problema:** Tipo de archivo no permitido

**Solución:** Solo se aceptan:
- **Imágenes:** JPEG, PNG, GIF, WebP
- **Videos:** MP4, MPEG, MOV, WebM

---

## 📈 Límites del Plan Gratuito

| Recurso | Límite Mensual |
|---------|----------------|
| Almacenamiento | 25 GB |
| Ancho de banda | 25 GB |
| Transformaciones | 25,000 |
| Archivos | Sin límite |

**Tip:** Si necesitas más, considera el plan Cloudinary Plus ($99/mes).

---

## 🎯 Ejemplo Completo de Uso

### Frontend (React)

```javascript
// Componente para subir archivos
function UploadIncidentMedia({ incidentId, token }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    setUploading(true);
    
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch(
        `http://localhost:3000/incident-media/upload/${incidentId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      );

      const result = await response.json();
      console.log('Archivos subidos:', result.data);
      alert(result.message);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al subir archivos');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        multiple 
        accept="image/*,video/*"
        onChange={(e) => setFiles(Array.from(e.target.files))}
      />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Subiendo...' : 'Subir Archivos'}
      </button>
    </div>
  );
}
```

---

## ✅ Checklist de Implementación

- [x] Instalar dependencias (`cloudinary`, `multer`, `streamifier`)
- [x] Crear módulo Cloudinary
- [x] Actualizar entidad IncidentMedia
- [x] Implementar CloudinaryService
- [x] Implementar IncidentMediaService
- [x] Crear endpoints en IncidentMediaController
- [ ] Configurar credenciales en `.env`
- [ ] Ejecutar migración de base de datos
- [ ] Probar endpoints con Postman
- [ ] Integrar con frontend

---

## 📚 Recursos Adicionales

- [Documentación oficial de Cloudinary](https://cloudinary.com/documentation)
- [Cloudinary Node.js SDK](https://cloudinary.com/documentation/node_integration)
- [Multer Documentation](https://github.com/expressjs/multer)

---

**¡Listo!** Ahora tienes un sistema completo de manejo de archivos multimedia con Cloudinary. 🎉

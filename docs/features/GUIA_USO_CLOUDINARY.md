# 📸 Guía de Uso: Subida de Archivos con Cloudinary

## ✅ Configuración Completada

Ya está todo listo en el backend. Solo necesitas:

### 1. Ejecutar migración SQL

Ejecuta este SQL en tu base de datos MariaDB:

```sql
ALTER TABLE incident_media 
ADD COLUMN public_id VARCHAR(255) NULL COMMENT 'ID de Cloudinary',
ADD COLUMN formato VARCHAR(50) NULL COMMENT 'Formato del archivo',
ADD COLUMN tamanio BIGINT NULL COMMENT 'Tamaño en bytes';

ALTER TABLE incident_media 
MODIFY COLUMN tipo ENUM('foto', 'video') NOT NULL;

CREATE INDEX idx_incident_media_public_id ON incident_media(public_id);
```

### 2. Reiniciar el servidor

```bash
npm run start:dev
```

---

## 🎯 Cómo Funciona

### Flujo completo:

```
1. Usuario llena formulario de incidente en el frontend
2. Usuario selecciona fotos/videos (desde galería o cámara)
3. Frontend envía TODO junto en una petición: datos + archivos
4. Backend:
   - Crea el incidente en la BD
   - Sube archivos a Cloudinary automáticamente
   - Guarda las URLs de Cloudinary en la tabla incident_media
5. Frontend muestra el incidente con sus imágenes/videos
```

---

## 📡 Endpoint para Crear Incidente CON Archivos

### POST /incidents (Con archivos)

**Content-Type:** `multipart/form-data`

**Campos del formulario:**

```javascript
{
  // Datos del incidente (como JSON string o form-data)
  tipo: "INCENDIO",
  descripcion: "Incendio en el parque central",
  severidad: "ALTA",
  latitud: 4.60971,
  longitud: -74.08175,
  direccion: "Calle 123 # 45-67, Bogotá",
  
  // Archivos (field name: "files")
  files: [archivo1.jpg, archivo2.mp4, ...]  // Hasta 10 archivos
}
```

---

## 🌐 Ejemplo de Uso en el Frontend

### Opción 1: Formulario HTML simple

```html
<form id="incident-form" enctype="multipart/form-data">
  <!-- Tipo de incidente -->
  <select name="tipo" required>
    <option value="INCENDIO">Incendio</option>
    <option value="ACCIDENTE">Accidente</option>
    <option value="INUNDACION">Inundación</option>
    <!-- ... más opciones -->
  </select>

  <!-- Descripción -->
  <textarea name="descripcion" required></textarea>

  <!-- Severidad -->
  <select name="severidad" required>
    <option value="BAJA">Baja</option>
    <option value="MEDIA">Media</option>
    <option value="ALTA">Alta</option>
    <option value="CRITICA">Crítica</option>
  </select>

  <!-- Ubicación (obtener con GPS o mapa) -->
  <input type="number" step="any" name="latitud" required>
  <input type="number" step="any" name="longitud" required>
  <input type="text" name="direccion" required>

  <!-- ARCHIVOS: Fotos/Videos -->
  <input type="file" name="files" multiple accept="image/*,video/*">
  
  <!-- También puedes usar capture="camera" para abrir la cámara directamente -->
  <input type="file" name="files" capture="camera" accept="image/*">

  <button type="submit">Reportar Incidente</button>
</form>

<script>
document.getElementById('incident-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const token = localStorage.getItem('token'); // Tu JWT token
  
  try {
    const response = await fetch('http://localhost:3000/incidents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData  // ¡NO pongas Content-Type, FormData lo hace automático!
    });
    
    const data = await response.json();
    console.log('Incidente creado:', data);
    
    // Opcional: Mostrar las imágenes guardadas
    const mediaResponse = await fetch(`http://localhost:3000/incident-media/incident/${data.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const media = await mediaResponse.json();
    console.log('Archivos guardados:', media.data);
    
    alert('¡Incidente reportado exitosamente!');
  } catch (error) {
    console.error('Error:', error);
    alert('Error al reportar incidente');
  }
});
</script>
```

### Opción 2: React (con cámara/galería)

```jsx
import React, { useState } from 'react';

function ReportarIncidente() {
  const [formData, setFormData] = useState({
    tipo: 'INCENDIO',
    descripcion: '',
    severidad: 'MEDIA',
    latitud: 0,
    longitud: 0,
    direccion: ''
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Obtener ubicación del usuario
  const obtenerUbicacion = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      setFormData({
        ...formData,
        latitud: position.coords.latitude,
        longitud: position.coords.longitude
      });
    });
  };

  // Manejar archivos seleccionados
  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    
    // Agregar datos del incidente
    data.append('tipo', formData.tipo);
    data.append('descripcion', formData.descripcion);
    data.append('severidad', formData.severidad);
    data.append('latitud', formData.latitud.toString());
    data.append('longitud', formData.longitud.toString());
    data.append('direccion', formData.direccion);
    
    // Agregar archivos
    files.forEach(file => {
      data.append('files', file);
    });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/incidents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data
      });

      if (!response.ok) throw new Error('Error al crear incidente');
      
      const result = await response.json();
      alert('¡Incidente reportado!');
      console.log('Incidente creado:', result);
      
      // Resetear formulario
      setFormData({
        tipo: 'INCENDIO',
        descripcion: '',
        severidad: 'MEDIA',
        latitud: 0,
        longitud: 0,
        direccion: ''
      });
      setFiles([]);
      
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <select 
        value={formData.tipo}
        onChange={(e) => setFormData({...formData, tipo: e.target.value})}
      >
        <option value="INCENDIO">🔥 Incendio</option>
        <option value="ACCIDENTE">🚗 Accidente</option>
        <option value="INUNDACION">🌊 Inundación</option>
        <option value="DESLIZAMIENTO">⛰️ Deslizamiento</option>
        <option value="TERREMOTO">🌍 Terremoto</option>
        <option value="OTRO">❓ Otro</option>
      </select>

      <textarea
        placeholder="Describe lo que está pasando..."
        value={formData.descripcion}
        onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
        required
      />

      <select
        value={formData.severidad}
        onChange={(e) => setFormData({...formData, severidad: e.target.value})}
      >
        <option value="BAJA">⚪ Baja</option>
        <option value="MEDIA">🟡 Media</option>
        <option value="ALTA">🟠 Alta</option>
        <option value="CRITICA">🔴 Crítica</option>
      </select>

      <button type="button" onClick={obtenerUbicacion}>
        📍 Obtener mi ubicación
      </button>

      <input
        type="text"
        placeholder="Dirección"
        value={formData.direccion}
        onChange={(e) => setFormData({...formData, direccion: e.target.value})}
        required
      />

      {/* Opción 1: Seleccionar de galería */}
      <label>
        📷 Seleccionar fotos/videos
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileChange}
        />
      </label>

      {/* Opción 2: Abrir cámara directamente (móvil) */}
      <label>
        📸 Tomar foto
        <input
          type="file"
          accept="image/*"
          capture="camera"
          onChange={(e) => setFiles([...files, ...Array.from(e.target.files)])}
        />
      </label>

      {files.length > 0 && (
        <div>
          <p>{files.length} archivo(s) seleccionado(s)</p>
          {files.map((file, i) => (
            <div key={i}>{file.name}</div>
          ))}
        </div>
      )}

      <button type="submit" disabled={loading}>
        {loading ? '⏳ Enviando...' : '📤 Reportar Incidente'}
      </button>
    </form>
  );
}
```

---

## 📊 Ver Archivos de un Incidente

```javascript
// GET /incident-media/incident/:incidentId
const verArchivos = async (incidentId) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:3000/incident-media/incident/${incidentId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  const result = await response.json();
  
  // Mostrar archivos
  result.data.forEach(archivo => {
    console.log('URL:', archivo.url);
    console.log('Tipo:', archivo.tipo); // 'foto' o 'video'
    console.log('Formato:', archivo.formato); // 'jpg', 'mp4', etc.
    
    // Crear elemento IMG o VIDEO
    if (archivo.tipo === 'foto') {
      const img = document.createElement('img');
      img.src = archivo.url;
      document.body.appendChild(img);
    } else {
      const video = document.createElement('video');
      video.src = archivo.url;
      video.controls = true;
      document.body.appendChild(video);
    }
  });
};
```

---

## 📋 Validaciones Automáticas

El backend valida:

- ✅ **Formatos permitidos:**
  - Imágenes: JPEG, JPG, PNG, GIF, WebP
  - Videos: MP4, MPEG, MOV (QuickTime), WebM

- ✅ **Tamaño máximo:** 10 MB por archivo

- ✅ **Cantidad máxima:** 10 archivos por incidente

- ✅ **Autenticación:** Solo usuarios autenticados con rol CIUDADANO o ADMIN

---

## 🎥 Usar Cámara en Móvil

Para Android/iOS, usa el atributo `capture`:

```html
<!-- Cámara trasera (foto) -->
<input type="file" accept="image/*" capture="environment">

<!-- Cámara frontal (selfie) -->
<input type="file" accept="image/*" capture="user">

<!-- Video -->
<input type="file" accept="video/*" capture="camera">
```

---

## 🔍 Respuesta Completa al Crear Incidente

```json
{
  "id": 123,
  "tipo": "INCENDIO",
  "descripcion": "Incendio en parque central",
  "severidad": "ALTA",
  "latitud": 4.60971,
  "longitud": -74.08175,
  "direccion": "Calle 123 #45-67",
  "estado": "PENDIENTE",
  "ciudadano_id": 5,
  "fecha_creacion": "2025-11-07T15:30:00.000Z",
  "fecha_actualizacion": "2025-11-07T15:30:00.000Z",
  "ciudadano": {
    "id_ciudadano": 5,
    "nombre": "Juan",
    "apellidos": "Pérez",
    "email": "juan@example.com"
  },
  "media": [
    {
      "id": 1,
      "url": "https://res.cloudinary.com/da84etlav/image/upload/v1234567890/lazarus/incidents/123/abc123.jpg",
      "public_id": "lazarus/incidents/123/abc123",
      "tipo": "foto",
      "formato": "jpg",
      "tamanio": 245678,
      "fecha_subida": "2025-11-07T15:30:02.000Z"
    },
    {
      "id": 2,
      "url": "https://res.cloudinary.com/da84etlav/video/upload/v1234567890/lazarus/incidents/123/xyz789.mp4",
      "public_id": "lazarus/incidents/123/xyz789",
      "tipo": "video",
      "formato": "mp4",
      "tamanio": 5428900,
      "fecha_subida": "2025-11-07T15:30:05.000Z"
    }
  ]
}
```

---

## ✅ Checklist Final

- [x] Credenciales de Cloudinary configuradas en `.env`
- [ ] Migración SQL ejecutada
- [ ] Servidor reiniciado (`npm run start:dev`)
- [ ] Probado endpoint POST /incidents con archivos
- [ ] Verificado que las URLs se guardan correctamente
- [ ] Integrado en el frontend

---

## 🎉 ¡Listo!

Ahora tu app puede:

1. ✅ Crear incidentes con fotos/videos desde la cámara o galería
2. ✅ Almacenar archivos en Cloudinary (optimizados automáticamente)
3. ✅ Guardar URLs en la base de datos
4. ✅ Mostrar multimedia en el frontend
5. ✅ Eliminar archivos cuando sea necesario

**Cloudinary se encarga de:**
- Optimización automática de imágenes (WebP, compresión)
- CDN global (carga rápida desde cualquier parte del mundo)
- Transformaciones on-the-fly (redimensionar, recortar, etc.)
- Almacenamiento seguro y escalable

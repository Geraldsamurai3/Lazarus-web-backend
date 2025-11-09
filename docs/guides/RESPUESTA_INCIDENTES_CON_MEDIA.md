# 🎯 Estructura de Respuesta de Incidentes con Media

## ✅ Ahora TODOS los endpoints de incidentes incluyen el array `media[]`

### 📡 Endpoints actualizados:

1. **GET /incidents** - Lista todos los incidentes (con filtros opcionales)
2. **GET /incidents/:id** - Obtener un incidente específico
3. **GET /incidents/nearby** - Incidentes cercanos por geolocalización
4. **POST /incidents** - Crear incidente (con archivos opcionales)

---

## 📋 Respuesta Completa de un Incidente

```json
{
  "id": 9,
  "ciudadano_id": 2,
  "ciudadano": {
    "id_ciudadano": 2,
    "nombre": "Alejandro",
    "apellidos": "Obando",
    "email": "alejomc56@gmail.com",
    "telefono": "88888888"
  },
  "tipo": "INUNDACION",
  "descripcion": "Inundación en mi barrio",
  "severidad": "ALTA",
  "latitud": "10.26103010",
  "longitud": "-85.57845620",
  "direccion": "Sagamad, Santa Cruz, Guanacaste",
  "estado": "PENDIENTE",
  "fecha_creacion": "2025-11-07T07:20:21.082Z",
  "fecha_actualizacion": "2025-11-07T07:20:21.082Z",
  
  "media": [  // ← ARRAY DE IMÁGENES/VIDEOS
    {
      "id": 1,
      "incidente_id": 9,
      "url": "https://res.cloudinary.com/da84etlav/image/upload/v1731000000/lazarus/incidents/9/abc123.jpg",
      "public_id": "lazarus/incidents/9/abc123",
      "tipo": "foto",
      "formato": "jpg",
      "tamanio": 245678,
      "fecha_subida": "2025-11-07T07:20:22.000Z"
    },
    {
      "id": 2,
      "incidente_id": 9,
      "url": "https://res.cloudinary.com/da84etlav/video/upload/v1731000005/lazarus/incidents/9/xyz789.mp4",
      "public_id": "lazarus/incidents/9/xyz789",
      "tipo": "video",
      "formato": "mp4",
      "tamanio": 5428900,
      "fecha_subida": "2025-11-07T07:20:25.000Z"
    }
  ]
}
```

---

## 🖼️ Cómo mostrar las imágenes en el Frontend

### JavaScript Vanilla

```javascript
// Obtener incidentes
fetch('http://localhost:3000/incidents')
  .then(res => res.json())
  .then(incidents => {
    incidents.forEach(incident => {
      console.log(`Incidente #${incident.id}: ${incident.descripcion}`);
      
      // Mostrar todas las imágenes/videos
      if (incident.media && incident.media.length > 0) {
        incident.media.forEach(archivo => {
          if (archivo.tipo === 'foto') {
            const img = document.createElement('img');
            img.src = archivo.url;
            img.alt = incident.descripcion;
            document.body.appendChild(img);
          } else if (archivo.tipo === 'video') {
            const video = document.createElement('video');
            video.src = archivo.url;
            video.controls = true;
            document.body.appendChild(video);
          }
        });
      } else {
        console.log('Sin archivos multimedia');
      }
    });
  });
```

### React

```jsx
function IncidentCard({ incident }) {
  return (
    <div className="incident-card">
      <h3>{incident.tipo} - {incident.descripcion}</h3>
      <p>Severidad: {incident.severidad}</p>
      <p>Estado: {incident.estado}</p>
      
      {/* Galería de imágenes/videos */}
      {incident.media && incident.media.length > 0 && (
        <div className="media-gallery">
          {incident.media.map((archivo) => (
            <div key={archivo.id} className="media-item">
              {archivo.tipo === 'foto' ? (
                <img 
                  src={archivo.url} 
                  alt={incident.descripcion}
                  loading="lazy"
                />
              ) : (
                <video 
                  src={archivo.url} 
                  controls
                  preload="metadata"
                />
              )}
              <span>{archivo.formato.toUpperCase()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Uso
function IncidentsList() {
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/incidents', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => setIncidents(data));
  }, []);

  return (
    <div>
      {incidents.map(incident => (
        <IncidentCard key={incident.id} incident={incident} />
      ))}
    </div>
  );
}
```

### HTML + CSS básico

```html
<div class="incident" id="incident-9">
  <h3>🌊 Inundación - Severidad ALTA</h3>
  <p>Inundación en mi barrio</p>
  
  <!-- Galería de archivos multimedia -->
  <div class="media-gallery">
    <img src="https://res.cloudinary.com/da84etlav/image/upload/.../foto.jpg" alt="Evidencia">
    <video src="https://res.cloudinary.com/da84etlav/video/upload/.../video.mp4" controls></video>
  </div>
</div>

<style>
.media-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
  margin-top: 15px;
}

.media-gallery img,
.media-gallery video {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style>
```

---

## 🔍 Filtrar incidentes CON imágenes solamente

```javascript
// Obtener solo incidentes que tienen archivos multimedia
const incidentsWithMedia = incidents.filter(
  incident => incident.media && incident.media.length > 0
);

console.log(`${incidentsWithMedia.length} incidentes con multimedia`);
```

---

## 📊 Contar archivos por tipo

```javascript
// Contar cuántas fotos y videos tiene un incidente
const contarMedia = (incident) => {
  const fotos = incident.media.filter(m => m.tipo === 'foto').length;
  const videos = incident.media.filter(m => m.tipo === 'video').length;
  
  return { fotos, videos };
};

const stats = contarMedia(incident);
console.log(`${stats.fotos} fotos, ${stats.videos} videos`);
```

---

## 🎨 Ejemplo de Tarjeta de Incidente

```jsx
function IncidentDetailCard({ incident }) {
  return (
    <div className="card">
      {/* Header */}
      <div className="card-header">
        <span className="badge">{incident.tipo}</span>
        <span className={`severity ${incident.severidad.toLowerCase()}`}>
          {incident.severidad}
        </span>
      </div>

      {/* Galería de imágenes (Carousel/Slider) */}
      {incident.media && incident.media.length > 0 && (
        <div className="carousel">
          {incident.media.map((archivo, index) => (
            <div key={archivo.id} className="carousel-item">
              {archivo.tipo === 'foto' ? (
                <img src={archivo.url} alt={`Evidencia ${index + 1}`} />
              ) : (
                <video src={archivo.url} controls />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Información */}
      <div className="card-body">
        <h3>{incident.descripcion}</h3>
        <p>📍 {incident.direccion}</p>
        <p>👤 {incident.ciudadano.nombre} {incident.ciudadano.apellidos}</p>
        <p>📅 {new Date(incident.fecha_creacion).toLocaleString()}</p>
        
        {/* Contador de archivos */}
        {incident.media && incident.media.length > 0 && (
          <p>
            📎 {incident.media.length} archivo(s) adjunto(s)
          </p>
        )}
      </div>

      {/* Estado */}
      <div className="card-footer">
        <span className={`status ${incident.estado.toLowerCase()}`}>
          {incident.estado}
        </span>
      </div>
    </div>
  );
}
```

---

## ✅ Verificación

### Antes (campo obsoleto):
```json
{
  "id": 8,
  "descripcion": "Incendio",
  "imagenes": null  // ← NULL (obsoleto)
}
```

### Ahora (con Cloudinary):
```json
{
  "id": 9,
  "descripcion": "Inundación",
  "media": [  // ← ARRAY CON URLs
    {
      "url": "https://res.cloudinary.com/.../foto.jpg",
      "tipo": "foto"
    }
  ]
}
```

---

## 🚀 Reinicia el servidor

```bash
npm run start:dev
```

Ahora **TODOS** los endpoints de incidentes incluirán automáticamente el array `media[]` con las URLs de Cloudinary. 🎉

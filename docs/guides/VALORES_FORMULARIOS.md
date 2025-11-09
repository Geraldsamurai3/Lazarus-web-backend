# 📋 Valores Válidos para Formularios - Lazarus API

## 🚨 Tipos de Incidente (tipo)

```typescript
enum IncidentType {
  INCENDIO = 'INCENDIO',
  ACCIDENTE = 'ACCIDENTE',
  INUNDACION = 'INUNDACION',
  DESLIZAMIENTO = 'DESLIZAMIENTO',
  TERREMOTO = 'TERREMOTO',
  OTRO = 'OTRO'
}
```

**Para usar en el frontend:**
```javascript
const tiposIncidente = [
  { value: 'INCENDIO', label: 'Incendio' },
  { value: 'ACCIDENTE', label: 'Accidente de Tránsito' },
  { value: 'INUNDACION', label: 'Inundación' },
  { value: 'DESLIZAMIENTO', label: 'Deslizamiento de Tierra' },
  { value: 'TERREMOTO', label: 'Terremoto' },
  { value: 'OTRO', label: 'Otro' }
];
```

---

## ⚠️ Severidad (severidad)

```typescript
enum IncidentSeverity {
  BAJA = 'BAJA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
  CRITICA = 'CRITICA'
}
```

**Para usar en el frontend:**
```javascript
const severidades = [
  { value: 'BAJA', label: 'Baja', color: '#4CAF50' },
  { value: 'MEDIA', label: 'Media', color: '#FFC107' },
  { value: 'ALTA', label: 'Alta', color: '#FF9800' },
  { value: 'CRITICA', label: 'Crítica', color: '#F44336' }
];
```

---

## 📊 Estados de Incidente (estado)

```typescript
enum IncidentStatus {
  PENDIENTE = 'PENDIENTE',
  EN_PROCESO = 'EN_PROCESO',
  RESUELTO = 'RESUELTO',
  CANCELADO = 'CANCELADO'
}
```

**Para usar en el frontend:**
```javascript
const estadosIncidente = [
  { value: 'PENDIENTE', label: 'Pendiente', color: '#FF9800' },
  { value: 'EN_PROCESO', label: 'En Proceso', color: '#2196F3' },
  { value: 'RESUELTO', label: 'Resuelto', color: '#4CAF50' },
  { value: 'CANCELADO', label: 'Cancelado', color: '#9E9E9E' }
];
```

---

## 🏢 Tipos de Entidad (tipo_entidad)

```typescript
enum TipoEntidad {
  BOMBEROS = 'BOMBEROS',
  POLICIA = 'POLICIA',
  CRUZ_ROJA = 'CRUZ_ROJA',
  TRANSITO = 'TRANSITO',
  AMBULANCIA = 'AMBULANCIA',
  MUNICIPALIDAD = 'MUNICIPALIDAD',
  OTROS = 'OTROS'
}
```

**Para usar en el frontend:**
```javascript
const tiposEntidad = [
  { value: 'BOMBEROS', label: 'Bomberos' },
  { value: 'POLICIA', label: 'Policía' },
  { value: 'CRUZ_ROJA', label: 'Cruz Roja' },
  { value: 'TRANSITO', label: 'Tránsito' },
  { value: 'AMBULANCIA', label: 'Ambulancia' },
  { value: 'MUNICIPALIDAD', label: 'Municipalidad' },
  { value: 'OTROS', label: 'Otros' }
];
```

---

## 🔐 Nivel de Acceso Admin (nivel_acceso)

```typescript
enum NivelAcceso {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MODERADOR = 'MODERADOR'
}
```

**Para usar en el frontend:**
```javascript
const nivelesAcceso = [
  { value: 'SUPER_ADMIN', label: 'Super Administrador' },
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'MODERADOR', label: 'Moderador' }
];
```

---

## 👥 Tipos de Usuario (userType)

```typescript
enum UserType {
  CIUDADANO = 'CIUDADANO',
  ENTIDAD = 'ENTIDAD',
  ADMIN = 'ADMIN'
}
```

---

## 📝 Ejemplo Completo de Formulario de Incidente

```jsx
import React, { useState } from 'react';

function FormularioIncidente() {
  const [formData, setFormData] = useState({
    tipo: 'INCENDIO',
    descripcion: '',
    severidad: 'MEDIA',
    latitud: null,
    longitud: null,
    direccion: '',
    imagenes: []
  });

  const tiposIncidente = [
    { value: 'INCENDIO', label: 'Incendio' },
    { value: 'ACCIDENTE', label: 'Accidente de Tránsito' },
    { value: 'INUNDACION', label: 'Inundación' },
    { value: 'DESLIZAMIENTO', label: 'Deslizamiento de Tierra' },
    { value: 'TERREMOTO', label: 'Terremoto' },
    { value: 'OTRO', label: 'Otro' }
  ];

  const severidades = [
    { value: 'BAJA', label: 'Baja' },
    { value: 'MEDIA', label: 'Media' },
    { value: 'ALTA', label: 'Alta' },
    { value: 'CRITICA', label: 'Crítica' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch('http://localhost:3000/incidents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Incidente creado:', data);
        alert('Incidente reportado exitosamente');
      } else {
        const error = await response.json();
        console.error('Error:', error);
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al reportar incidente');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Tipo de Incidente:</label>
        <select
          value={formData.tipo}
          onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
          required
        >
          {tiposIncidente.map(tipo => (
            <option key={tipo.value} value={tipo.value}>
              {tipo.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Severidad:</label>
        <select
          value={formData.severidad}
          onChange={(e) => setFormData({ ...formData, severidad: e.target.value })}
          required
        >
          {severidades.map(sev => (
            <option key={sev.value} value={sev.value}>
              {sev.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Descripción:</label>
        <textarea
          value={formData.descripcion}
          onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
          required
        />
      </div>

      <div>
        <label>Dirección:</label>
        <input
          type="text"
          value={formData.direccion}
          onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
          required
        />
      </div>

      <div>
        <label>Latitud:</label>
        <input
          type="number"
          step="any"
          value={formData.latitud || ''}
          onChange={(e) => setFormData({ ...formData, latitud: parseFloat(e.target.value) })}
          required
        />
      </div>

      <div>
        <label>Longitud:</label>
        <input
          type="number"
          step="any"
          value={formData.longitud || ''}
          onChange={(e) => setFormData({ ...formData, longitud: parseFloat(e.target.value) })}
          required
        />
      </div>

      <div>
        <label>Imágenes (URLs separadas por coma - opcional):</label>
        <input
          type="text"
          placeholder="https://ejemplo.com/imagen1.jpg, https://ejemplo.com/imagen2.jpg"
          onChange={(e) => {
            const urls = e.target.value.split(',').map(url => url.trim()).filter(url => url);
            setFormData({ ...formData, imagenes: urls });
          }}
        />
      </div>

      <button type="submit">Reportar Incidente</button>
    </form>
  );
}

export default FormularioIncidente;
```

---

## ✅ Validaciones del Backend

### CreateIncidentDto
```typescript
{
  tipo: IncidentType;          // REQUERIDO - Enum
  descripcion: string;         // REQUERIDO - String
  severidad: IncidentSeverity; // REQUERIDO - Enum
  latitud: number;             // REQUERIDO - Number (decimal)
  longitud: number;            // REQUERIDO - Number (decimal)
  direccion: string;           // REQUERIDO - String
  imagenes?: string[];         // OPCIONAL - Array de strings (URLs)
}
```

### Campos Automáticos
- `ciudadano_id` - Se extrae automáticamente del JWT (no enviar)
- `estado` - Por defecto: `PENDIENTE`
- `fecha_creacion` - Se genera automáticamente
- `fecha_actualizacion` - Se genera automáticamente

---

## 🚫 Errores Comunes

### ❌ Error: "property imagenes should not exist"
**Causa:** El campo `imagenes` no estaba en el DTO  
**Solución:** ✅ Ya está arreglado (campo agregado como opcional)

### ❌ Error: "tipo must be one of the following values: MEDICA, INFRAESTRUCTURA..."
**Causa:** Usar valores antiguos de los enums  
**Solución:** ✅ Usar los nuevos valores: INCENDIO, ACCIDENTE, INUNDACION, DESLIZAMIENTO, TERREMOTO, OTRO

### ❌ Error: "latitud must be a number"
**Causa:** Enviar string en lugar de number  
**Solución:** Convertir con `parseFloat()` o `Number()`

```javascript
// ❌ Incorrecto
latitud: "9.9281"

// ✅ Correcto
latitud: 9.9281
latitud: parseFloat("9.9281")
```

---

## 📱 JSON de Ejemplo Válido

```json
{
  "tipo": "INCENDIO",
  "descripcion": "Incendio en edificio residencial de 3 pisos",
  "severidad": "ALTA",
  "latitud": 9.9281,
  "longitud": -84.0907,
  "direccion": "Av. Central, San José, Costa Rica",
  "imagenes": [
    "https://ejemplo.com/imagen1.jpg",
    "https://ejemplo.com/imagen2.jpg"
  ]
}
```

---

**Actualizado:** 26 de Octubre, 2025  
**Versión Backend:** 1.0.0

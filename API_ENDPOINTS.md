# 📡 Lazarus API - Endpoints Completos

**Base URL:** `http://localhost:3000`  
**Versión:** 1.0.0  
**Última actualización:** 26 de Octubre, 2025

---

## 🔐 Autenticación

Todos los endpoints protegidos requieren header:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## 📋 Índice de Endpoints

1. [Autenticación (Auth)](#autenticación-auth)
2. [Usuarios (Users)](#usuarios-users)
3. [Incidentes (Incidents)](#incidentes-incidents)
4. [Notificaciones (Notifications)](#notificaciones-notifications)
5. [Estadísticas (Statistics)](#estadísticas-statistics)
6. [Medios de Incidentes (Incident Media)](#medios-de-incidentes-incident-media)

---

## 🔑 Autenticación (Auth)

### POST /auth/register
**Descripción:** Registrar un nuevo ciudadano  
**Acceso:** Público  
**Body:**
```json
{
  "nombre": "Juan Carlos",
  "apellidos": "Pérez González",
  "email": "juan.perez@gmail.com",
  "contraseña": "Password123!",
  "cedula": "1-2345-6789",
  "telefono": "8888-8888",
  "provincia": "San José",
  "canton": "Central",
  "distrito": "Carmen",
  "direccion": "Barrio Amón, Calle 5"
}
```
**Respuesta (201):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "userType": "CIUDADANO",
    "nombre": "Juan Carlos",
    "email": "juan.perez@gmail.com",
    "strikes": 0,
    "activo": true
  }
}
```

---

### POST /auth/register-entidad
**Descripción:** Registrar una nueva entidad pública  
**Acceso:** Público  
**Body:**
```json
{
  "nombre_entidad": "Bomberos Central San José",
  "tipo_entidad": "BOMBEROS",
  "email": "bomberos.central@go.cr",
  "contraseña": "Bomberos2025!",
  "telefono_emergencia": "911",
  "provincia": "San José",
  "canton": "Central",
  "distrito": "Carmen",
  "ubicacion": "Estación Central, Av. 8, Calle 9-11"
}
```
**Tipos de entidad válidos:**
- `BOMBEROS`, `POLICIA`, `CRUZ_ROJA`, `TRANSITO`, `AMBULANCIA`, `MUNICIPALIDAD`, `OTROS`

**Respuesta (201):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "userType": "ENTIDAD",
    "nombre_entidad": "Bomberos Central San José",
    "tipo_entidad": "BOMBEROS",
    "activo": true
  }
}
```

---

### POST /auth/register-admin
**Descripción:** Registrar un nuevo administrador  
**Acceso:** Público  
**Body:**
```json
{
  "nombre": "María Elena",
  "apellidos": "Rodríguez Castro",
  "email": "maria.admin@lazarus.com",
  "contraseña": "Admin2025!",
  "provincia": "San José",
  "canton": "Central",
  "distrito": "Carmen"
}
```
**Respuesta (201):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "userType": "ADMIN",
    "nombre": "María Elena",
    "apellidos": "Rodríguez Castro",
    "nivel_acceso": "ADMIN",
    "activo": true
  }
}
```

---

### POST /auth/login
**Descripción:** Iniciar sesión  
**Acceso:** Público  
**Body:**
```json
{
  "email": "usuario@example.com",
  "contraseña": "Password123!"
}
```
**Respuesta (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "userType": "CIUDADANO",
    "email": "usuario@example.com",
    "nombre": "Juan Carlos"
  }
}
```

---

## 👥 Usuarios (Users)

### GET /users
**Descripción:** Obtener todos los usuarios (todas las tablas)  
**Acceso:** ADMIN, ENTIDAD  
**Respuesta (200):**
```json
[
  {
    "id_ciudadano": 1,
    "userType": "CIUDADANO",
    "nombre": "Juan",
    "email": "juan@example.com",
    "strikes": 0,
    "activo": true
  },
  {
    "id_entidad": 1,
    "userType": "ENTIDAD",
    "nombre_entidad": "Bomberos Central",
    "tipo_entidad": "BOMBEROS",
    "activo": true
  }
]
```

---

### GET /users/me
**Descripción:** Obtener mi perfil  
**Acceso:** Todos (autenticados)  
**Respuesta (200):**
```json
{
  "id": 1,
  "userType": "CIUDADANO",
  "nombre": "Juan Carlos",
  "apellidos": "Pérez González",
  "email": "juan@example.com",
  "strikes": 0,
  "activo": true
}
```

---

### GET /users/:userType/:id
**Descripción:** Obtener usuario específico por tipo e ID  
**Acceso:** Todos* (CIUDADANO solo puede ver su propio perfil)  
**Parámetros:**
- `userType`: CIUDADANO | ENTIDAD | ADMIN
- `id`: ID del usuario

**Ejemplo:** `GET /users/CIUDADANO/1`  
**Respuesta (200):**
```json
{
  "id_ciudadano": 1,
  "userType": "CIUDADANO",
  "nombre": "Juan",
  "apellidos": "Pérez",
  "email": "juan@example.com",
  "cedula": "1-2345-6789",
  "strikes": 0,
  "activo": true,
  "provincia": "San José"
}
```

---

### GET /users/ciudadanos
**Descripción:** Obtener todos los ciudadanos  
**Acceso:** ADMIN, ENTIDAD  
**Respuesta (200):**
```json
[
  {
    "id_ciudadano": 1,
    "nombre": "Juan",
    "apellidos": "Pérez",
    "email": "juan@example.com",
    "cedula": "1-2345-6789",
    "strikes": 0,
    "activo": true
  }
]
```

---

### GET /users/entidades
**Descripción:** Obtener todas las entidades públicas  
**Acceso:** ADMIN  
**Respuesta (200):**
```json
[
  {
    "id_entidad": 1,
    "nombre_entidad": "Bomberos Central",
    "tipo_entidad": "BOMBEROS",
    "email": "bomberos@go.cr",
    "telefono_emergencia": "911",
    "activo": true
  }
]
```

---

### GET /users/administradores
**Descripción:** Obtener todos los administradores  
**Acceso:** ADMIN  
**Respuesta (200):**
```json
[
  {
    "id_admin": 1,
    "nombre": "María",
    "apellidos": "Rodríguez",
    "email": "maria@lazarus.com",
    "nivel_acceso": "ADMIN",
    "activo": true
  }
]
```

---

### PATCH /users/:userType/:id/toggle-status
**Descripción:** Activar/desactivar un usuario  
**Acceso:** ADMIN  
**Ejemplo:** `PATCH /users/CIUDADANO/1/toggle-status`  
**Respuesta (200):**
```json
{
  "message": "Usuario actualizado correctamente",
  "activo": false
}
```

---

### PATCH /users/ciudadano/:id/strike
**Descripción:** Incrementar strikes de un ciudadano  
**Acceso:** ADMIN, ENTIDAD  
**Ejemplo:** `PATCH /users/ciudadano/1/strike`  
**Respuesta (200):**
```json
{
  "message": "Strike agregado",
  "strikes": 1,
  "activo": true
}
```

---

## 🚨 Incidentes (Incidents)

### POST /incidents
**Descripción:** Crear un nuevo incidente  
**Acceso:** CIUDADANO  
**Body:**
```json
{
  "tipo": "INCENDIO",
  "descripcion": "Incendio en edificio residencial",
  "severidad": "ALTA",
  "latitud": 9.9281,
  "longitud": -84.0907,
  "direccion": "Avenida Central, San José",
  "imagenes": ["https://example.com/image1.jpg"]
}
```
**Tipos de incidente:**
- `INCENDIO`, `ACCIDENTE`, `INUNDACION`, `DESLIZAMIENTO`, `TERREMOTO`, `OTRO`

**Severidades:**
- `BAJA`, `MEDIA`, `ALTA`, `CRITICA`

**Respuesta (201):**
```json
{
  "id": 1,
  "tipo": "INCENDIO",
  "descripcion": "Incendio en edificio residencial",
  "severidad": "ALTA",
  "estado": "PENDIENTE",
  "latitud": 9.9281,
  "longitud": -84.0907,
  "ciudadano_id": 1,
  "fecha_creacion": "2025-10-26T16:00:00.000Z"
}
```

---

### GET /incidents
**Descripción:** Obtener todos los incidentes  
**Acceso:** Todos (autenticados)  
**Query params opcionales:**
- `estado`: PENDIENTE | EN_PROCESO | RESUELTO | CANCELADO
- `severidad`: BAJA | MEDIA | ALTA | CRITICA
- `tipo`: INCENDIO | ACCIDENTE | etc.

**Ejemplo:** `GET /incidents?estado=PENDIENTE&severidad=ALTA`  
**Respuesta (200):**
```json
[
  {
    "id": 1,
    "tipo": "INCENDIO",
    "descripcion": "Incendio en edificio",
    "severidad": "ALTA",
    "estado": "PENDIENTE",
    "latitud": 9.9281,
    "longitud": -84.0907,
    "fecha_creacion": "2025-10-26T16:00:00.000Z",
    "ciudadano": {
      "id_ciudadano": 1,
      "nombre": "Juan",
      "apellidos": "Pérez"
    }
  }
]
```

---

### GET /incidents/statistics
**Descripción:** Obtener estadísticas de incidentes  
**Acceso:** Todos (autenticados)  
**Respuesta (200):**
```json
{
  "total": 15,
  "porEstado": {
    "PENDIENTE": 5,
    "EN_PROCESO": 7,
    "RESUELTO": 3
  },
  "porSeveridad": {
    "BAJA": 4,
    "MEDIA": 6,
    "ALTA": 5
  }
}
```

---

### GET /incidents/nearby
**Descripción:** Obtener incidentes cercanos  
**Acceso:** Todos (autenticados)  
**Query params:**
- `lat`: Latitud (requerido)
- `lng`: Longitud (requerido)
- `radius`: Radio en km (opcional, default: 5)

**Ejemplo:** `GET /incidents/nearby?lat=9.9281&lng=-84.0907&radius=10`  
**Respuesta (200):**
```json
[
  {
    "id": 1,
    "tipo": "INCENDIO",
    "severidad": "ALTA",
    "latitud": 9.9281,
    "longitud": -84.0907,
    "distancia": 0.5
  }
]
```

---

### GET /incidents/:id
**Descripción:** Obtener un incidente específico  
**Acceso:** Todos (autenticados)  
**Ejemplo:** `GET /incidents/1`  
**Respuesta (200):**
```json
{
  "id": 1,
  "tipo": "INCENDIO",
  "descripcion": "Incendio en edificio residencial",
  "severidad": "ALTA",
  "estado": "PENDIENTE",
  "latitud": 9.9281,
  "longitud": -84.0907,
  "direccion": "Av. Central",
  "imagenes": ["url1.jpg", "url2.jpg"],
  "fecha_creacion": "2025-10-26T16:00:00.000Z",
  "ciudadano": {
    "id_ciudadano": 1,
    "nombre": "Juan",
    "apellidos": "Pérez"
  }
}
```

---

### PATCH /incidents/:id
**Descripción:** Actualizar un incidente  
**Acceso:** Todos* (permisos diferentes por rol)  
- CIUDADANO: solo descripción y severidad de sus incidentes
- ENTIDAD: solo estado
- ADMIN: todos los campos

**Body (ejemplo ENTIDAD):**
```json
{
  "estado": "EN_PROCESO"
}
```
**Body (ejemplo CIUDADANO):**
```json
{
  "descripcion": "Actualización: el incendio se expandió",
  "severidad": "CRITICA"
}
```
**Respuesta (200):**
```json
{
  "message": "Incidente actualizado",
  "incidente": { /* datos actualizados */ }
}
```

---

### DELETE /incidents/:id
**Descripción:** Eliminar un incidente  
**Acceso:** CIUDADANO (solo propios), ADMIN  
**Ejemplo:** `DELETE /incidents/1`  
**Respuesta (200):**
```json
{
  "message": "Incidente eliminado correctamente"
}
```

---

## 🔔 Notificaciones (Notifications)

### POST /notifications
**Descripción:** Crear una notificación manual  
**Acceso:** ADMIN, ENTIDAD  
**Body:**
```json
{
  "user_id": 1,
  "user_type": "CIUDADANO",
  "tipo": "SISTEMA",
  "titulo": "Mantenimiento programado",
  "mensaje": "El sistema estará en mantenimiento mañana",
  "priority": "MEDIA"
}
```
**Respuesta (201):**
```json
{
  "id": 1,
  "titulo": "Mantenimiento programado",
  "mensaje": "El sistema estará en mantenimiento mañana",
  "leida": false,
  "fecha_creacion": "2025-10-26T16:00:00.000Z"
}
```

---

### GET /notifications
**Descripción:** Obtener todas las notificaciones (global)  
**Acceso:** ADMIN  
**Respuesta (200):**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "user_type": "CIUDADANO",
    "tipo": "INCIDENTE_ACTUALIZADO",
    "titulo": "Estado actualizado",
    "mensaje": "Tu incidente cambió a EN_PROCESO",
    "leida": false
  }
]
```

---

### GET /notifications/user/:userId
**Descripción:** Obtener mis notificaciones  
**Acceso:** Todos* (solo sus propias notificaciones)  
**Ejemplo:** `GET /notifications/user/1`  
**Respuesta (200):**
```json
[
  {
    "id": 1,
    "tipo": "INCIDENTE_ACTUALIZADO",
    "titulo": "Estado actualizado",
    "mensaje": "Tu incidente #5 cambió a EN_PROCESO",
    "leida": false,
    "fecha_creacion": "2025-10-26T16:00:00.000Z"
  }
]
```

---

### GET /notifications/user/:userId/unread
**Descripción:** Obtener notificaciones no leídas  
**Acceso:** Todos* (solo propias)  
**Ejemplo:** `GET /notifications/user/1/unread`  
**Respuesta (200):**
```json
{
  "count": 3,
  "notifications": [
    {
      "id": 1,
      "titulo": "Nuevo incidente cercano",
      "mensaje": "Hay un incidente a 2km de tu ubicación",
      "leida": false
    }
  ]
}
```

---

### GET /notifications/:id
**Descripción:** Obtener una notificación específica  
**Acceso:** Todos* (solo propias)  
**Ejemplo:** `GET /notifications/1`  
**Respuesta (200):**
```json
{
  "id": 1,
  "tipo": "INCIDENTE_ACTUALIZADO",
  "titulo": "Estado actualizado",
  "mensaje": "Tu incidente cambió a RESUELTO",
  "leida": false,
  "fecha_creacion": "2025-10-26T16:00:00.000Z"
}
```

---

### PATCH /notifications/:id/read
**Descripción:** Marcar notificación como leída  
**Acceso:** Todos* (solo propias)  
**Ejemplo:** `PATCH /notifications/1/read`  
**Respuesta (200):**
```json
{
  "message": "Notificación marcada como leída",
  "leida": true
}
```

---

### PATCH /notifications/user/:userId/read-all
**Descripción:** Marcar todas las notificaciones como leídas  
**Acceso:** Todos* (solo propias)  
**Ejemplo:** `PATCH /notifications/user/1/read-all`  
**Respuesta (200):**
```json
{
  "message": "Todas las notificaciones marcadas como leídas",
  "updated": 5
}
```

---

### DELETE /notifications/:id
**Descripción:** Eliminar una notificación  
**Acceso:** Todos* (solo propias)  
**Ejemplo:** `DELETE /notifications/1`  
**Respuesta (200):**
```json
{
  "message": "Notificación eliminada"
}
```

---

### POST /notifications/incident-status
**Descripción:** Notificar cambio de estado de incidente  
**Acceso:** ENTIDAD, ADMIN  
**Body:**
```json
{
  "incidentId": 5,
  "newStatus": "EN_PROCESO"
}
```
**Respuesta (201):**
```json
{
  "message": "Notificación enviada al ciudadano",
  "notification": { /* datos */ }
}
```

---

### POST /notifications/incident-nearby
**Descripción:** Notificar incidente cercano a entidades  
**Acceso:** ENTIDAD, ADMIN  
**Body:**
```json
{
  "incidentId": 5,
  "entityIds": [1, 2, 3]
}
```
**Respuesta (201):**
```json
{
  "message": "Notificaciones enviadas a 3 entidades",
  "sent": 3
}
```

---

### POST /notifications/system-message
**Descripción:** Enviar mensaje del sistema  
**Acceso:** ADMIN  
**Body:**
```json
{
  "titulo": "Mantenimiento programado",
  "mensaje": "El sistema estará en mantenimiento el lunes",
  "targetUserType": "TODOS"
}
```
**targetUserType opciones:**
- `TODOS`, `CIUDADANO`, `ENTIDAD`, `ADMIN`

**Respuesta (201):**
```json
{
  "message": "Mensaje enviado a todos los usuarios",
  "sent": 150
}
```

---

## 📊 Estadísticas (Statistics)

### GET /statistics/dashboard
**Descripción:** Dashboard completo con todas las estadísticas  
**Acceso:** ENTIDAD, ADMIN  
**Respuesta (200):**
```json
{
  "totals": {
    "incidents": 15,
    "users": 25,
    "ciudadanos": 20,
    "entidades": 3,
    "admins": 2,
    "notifications": 45
  },
  "incidentsByStatus": {
    "PENDIENTE": 5,
    "EN_PROCESO": 7,
    "RESUELTO": 3
  },
  "incidentsBySeverity": {
    "BAJA": 4,
    "MEDIA": 6,
    "ALTA": 5
  },
  "incidentsByType": {
    "INCENDIO": 8,
    "ACCIDENTE": 7
  },
  "usersByType": {
    "CIUDADANO": 20,
    "ENTIDAD": 3,
    "ADMIN": 2
  },
  "recentIncidents": [
    {
      "id": 15,
      "tipo": "INCENDIO",
      "severidad": "ALTA",
      "fecha_creacion": "2025-10-26T16:00:00.000Z"
    }
  ]
}
```

---

### GET /statistics/incidents/status
**Descripción:** Estadísticas por estado de incidente  
**Acceso:** ENTIDAD, ADMIN  
**Respuesta (200):**
```json
{
  "PENDIENTE": 5,
  "EN_PROCESO": 7,
  "RESUELTO": 3,
  "CANCELADO": 0
}
```

---

### GET /statistics/incidents/severity
**Descripción:** Estadísticas por severidad  
**Acceso:** ENTIDAD, ADMIN  
**Respuesta (200):**
```json
{
  "BAJA": 4,
  "MEDIA": 6,
  "ALTA": 5,
  "CRITICA": 0
}
```

---

### GET /statistics/incidents/type
**Descripción:** Estadísticas por tipo de incidente  
**Acceso:** ENTIDAD, ADMIN  
**Respuesta (200):**
```json
{
  "INCENDIO": 8,
  "ACCIDENTE": 7,
  "INUNDACION": 0
}
```

---

### GET /statistics/users/type
**Descripción:** Estadísticas por tipo de usuario  
**Acceso:** ADMIN  
**Respuesta (200):**
```json
{
  "CIUDADANO": 20,
  "ENTIDAD": 3,
  "ADMIN": 2
}
```

---

### GET /statistics/incidents/recent
**Descripción:** Incidentes recientes  
**Acceso:** ENTIDAD, ADMIN  
**Query params:**
- `limit`: Cantidad de incidentes (default: 10)

**Ejemplo:** `GET /statistics/incidents/recent?limit=5`  
**Respuesta (200):**
```json
[
  {
    "id": 15,
    "tipo": "INCENDIO",
    "severidad": "ALTA",
    "estado": "PENDIENTE",
    "fecha_creacion": "2025-10-26T16:00:00.000Z"
  }
]
```

---

### GET /statistics/incidents/trends
**Descripción:** Tendencias de incidentes por período  
**Acceso:** ENTIDAD, ADMIN  
**Query params:**
- `days`: Número de días (default: 30)

**Ejemplo:** `GET /statistics/incidents/trends?days=7`  
**Respuesta (200):**
```json
{
  "period": "últimos 7 días",
  "total": 12,
  "promedioDiario": 1.7,
  "porDia": [
    { "fecha": "2025-10-26", "cantidad": 3 },
    { "fecha": "2025-10-25", "cantidad": 2 }
  ]
}
```

---

### GET /statistics/incidents/location
**Descripción:** Estadísticas por ubicación  
**Acceso:** ENTIDAD, ADMIN  
**Respuesta (200):**
```json
{
  "porProvincia": {
    "San José": 25,
    "Heredia": 10,
    "Alajuela": 8
  },
  "porCanton": {
    "Central": 15,
    "Escazú": 5
  }
}
```

---

### GET /statistics/users/:userId/activity
**Descripción:** Actividad de un usuario  
**Acceso:** Todos* (CIUDADANO solo propio)  
**Query params:**
- `userType`: CIUDADANO | ENTIDAD | ADMIN (requerido)

**Ejemplo:** `GET /statistics/users/1/activity?userType=CIUDADANO`  
**Respuesta (200):**
```json
{
  "userId": 1,
  "userType": "CIUDADANO",
  "totalIncidentes": 5,
  "incidentesActivos": 2,
  "incidentesResueltos": 3,
  "strikes": 0,
  "fechaRegistro": "2025-09-01T00:00:00.000Z"
}
```

---

## 📎 Medios de Incidentes (Incident Media)

### (Endpoints pendientes de implementación)

---

## 📋 Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| 200 | Éxito |
| 201 | Creado exitosamente |
| 400 | Solicitud inválida (validación) |
| 401 | No autenticado |
| 403 | Sin permisos |
| 404 | No encontrado |
| 409 | Conflicto (ej: email duplicado) |
| 500 | Error del servidor |

---

## 🔐 Permisos por Rol

### CIUDADANO
- ✅ Crear incidentes
- ✅ Ver todos los incidentes
- ✅ Editar propios incidentes (descripción/severidad)
- ✅ Eliminar propios incidentes
- ✅ Ver propio perfil
- ✅ Ver propias notificaciones
- ✅ Ver propias estadísticas

### ENTIDAD
- ✅ Todo lo de CIUDADANO
- ✅ Cambiar estado de incidentes
- ✅ Ver todos los usuarios
- ✅ Ver ciudadanos
- ✅ Incrementar strikes a ciudadanos
- ✅ Enviar notificaciones
- ✅ Ver estadísticas globales

### ADMIN
- ✅ Todo lo de ENTIDAD
- ✅ Activar/desactivar usuarios
- ✅ Ver entidades
- ✅ Ver administradores
- ✅ Eliminar cualquier incidente
- ✅ Enviar mensajes del sistema
- ✅ Ver estadísticas de usuarios

---

## 🌐 WebSocket Events

### Cliente → Servidor
- `location:update` - Actualizar ubicación
- `entity:track` - Rastrear entidad
- `entities:getLocations` - Obtener ubicaciones de entidades
- `incident:subscribe` - Suscribirse a incidente
- `incident:unsubscribe` - Desuscribirse de incidente
- `area:subscribe` - Suscribirse a área geográfica
- `ping` - Verificar conexión

### Servidor → Cliente
- `location:updated` - Ubicación actualizada
- `incident:new` - Nuevo incidente
- `incident:updated` - Incidente actualizado
- `notification:new` - Nueva notificación

---

## 📝 Notas

- Todos los timestamps están en formato ISO 8601 (UTC)
- Las coordenadas deben estar en formato decimal (ej: 9.9281, -84.0907)
- Los emails deben ser únicos en todo el sistema (3 tablas)
- Las contraseñas se hashean con bcrypt (salt rounds: 10)
- Los JWT expiran en 7 días por defecto
- El radio de búsqueda de incidentes cercanos es en kilómetros

---

**Generado el:** 26 de Octubre, 2025  
**Versión del Backend:** 1.0.0

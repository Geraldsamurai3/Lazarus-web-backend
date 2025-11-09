# 📱 Guía de Integración Frontend - Lazarus Emergency Management System

## 🎯 Resumen Ejecutivo

**Proyecto:** Sistema de gestión de emergencias en tiempo real  
**Backend:** NestJS + TypeORM + MariaDB + Socket.IO  
**Base URL:** `http://localhost:3000`  
**WebSocket URL:** `ws://localhost:3000`  
**Versión:** 1.0.0  
**Última Actualización:** 26 de Octubre, 2025  
**Arquitectura:** 3 Entidades Separadas (Ciudadano, Entidad Pública, Administrador)

---

## 📋 Tabla de Contenidos

1. [Arquitectura General](#arquitectura-general)
2. [Autenticación y Seguridad](#autenticación-y-seguridad)
3. [API REST - Endpoints](#api-rest---endpoints)
4. [WebSocket - Eventos en Tiempo Real](#websocket---eventos-en-tiempo-real)
5. [Modelos de Datos](#modelos-de-datos)
6. [APIs de Mapas Recomendadas](#apis-de-mapas-recomendadas)
7. [Integración con Mapas - Ejemplos](#integración-con-mapas---ejemplos)
8. [Búsqueda de Lugares en Costa Rica](#búsqueda-de-lugares-en-costa-rica)
9. [Flujos de Usuario](#flujos-de-usuario)
10. [Manejo de Errores](#manejo-de-errores)
11. [Ejemplos de Código](#ejemplos-de-código)

---

## 🏗️ Arquitectura General

### Stack Tecnológico Backend

```
NestJS 11.0.1          → Framework principal
TypeORM 0.3.26         → ORM para MariaDB
MariaDB 10.11+         → Base de datos relacional
Socket.IO 4.8.1        → WebSockets bidireccionales
JWT (passport-jwt)     → Autenticación con tokens
bcrypt 6.0.0           → Hashing de contraseñas
class-validator 0.14.2 → Validación de DTOs
```

### Estructura de Módulos

```
📦 Backend Modules
├── 🔐 Auth          → Login, Register, JWT
├── 👤 Users         → Gestión de usuarios
├── 🚨 Incidents     → CRUD de incidentes + Geolocalización
├── 🔔 Notifications → Sistema de notificaciones
├── 📊 Statistics    → Métricas y analíticas
└── 🌐 WebSockets    → Comunicación en tiempo real
```

### Configuración CORS

El backend acepta conexiones de:
- `http://localhost:3000`
- `http://localhost:3001`

**Para producción:** Actualiza CORS en `src/main.ts` con tu dominio.

---

## 🔐 Autenticación y Seguridad

### Sistema de Tipos de Usuario

```typescript
enum UserType {
  ADMIN = 'ADMIN',           // Administrador del sistema
  ENTIDAD = 'ENTIDAD',       // Entidad de respuesta (bomberos, policía, cruz roja)
  CIUDADANO = 'CIUDADANO'    // Usuario regular (reporta incidentes)
}

enum UserStatus {
  HABILITADO = 'HABILITADO',
  DESHABILITADO = 'DESHABILITADO'  // Bloqueado tras 3 strikes (solo ciudadanos)
}

enum TipoEntidad {
  BOMBEROS = 'BOMBEROS',
  POLICIA = 'POLICIA',
  CRUZ_ROJA = 'CRUZ_ROJA',
  TRANSITO = 'TRANSITO',
  AMBULANCIA = 'AMBULANCIA',
  MUNICIPALIDAD = 'MUNICIPALIDAD',
  OTROS = 'OTROS'
}

enum NivelAcceso {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MODERADOR = 'MODERADOR'
}
```

### Flujo de Autenticación

#### 1. Registro de Ciudadano

**Endpoint:** `POST /auth/register`

```json
// Request
{
  "nombre": "Juan Carlos",
  "apellidos": "Pérez González",
  "email": "juan@ejemplo.com",
  "contraseña": "Password123!",
  "cedula": "1-2345-6789",
  "telefono": "8888-8888",
  "provincia": "San José",
  "canton": "Central",
  "distrito": "Carmen",
  "direccion": "Barrio Amón, Calle 5"
}

// Response (201 Created)
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "userType": "CIUDADANO",
    "nombre": "Juan Carlos",
    "apellidos": "Pérez González",
    "email": "juan@ejemplo.com",
    "cedula": "1-2345-6789",
    "strikes": 0,
    "activo": true,
    "fecha_creacion": "2025-10-26T00:00:00.000Z"
  }
}
```

#### 1b. Registro de Entidad Pública

**Endpoint:** `POST /auth/register-entidad`

```json
// Request
{
  "nombre_entidad": "Bomberos Central San José",
  "tipo_entidad": "BOMBEROS",
  "email": "bomberos.central@go.cr",
  "contraseña": "Bomberos2025!",
  "telefono_emergencia": "911",
  "provincia": "San José",
  "canton": "Central",
  "distrito": "Carmen",
  "ubicacion": "Estación Central, Av. 8"
}

// Response (201 Created)
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "userType": "ENTIDAD",
    "nombre_entidad": "Bomberos Central San José",
    "tipo_entidad": "BOMBEROS",
    "email": "bomberos.central@go.cr",
    "activo": true,
    "fecha_registro": "2025-10-26T00:00:00.000Z"
  }
}
```

#### 1c. Registro de Administrador

**Endpoint:** `POST /auth/register-admin`

```json
// Request
{
  "nombre": "María Elena",
  "apellidos": "Rodríguez Castro",
  "email": "maria.admin@lazarus.com",
  "contraseña": "Admin2025!",
  "provincia": "San José",
  "canton": "Central",
  "distrito": "Carmen"
}

// Response (201 Created)
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "userType": "ADMIN",
    "nombre": "María Elena",
    "apellidos": "Rodríguez Castro",
    "email": "maria.admin@lazarus.com",
    "nivel_acceso": "ADMIN",
    "activo": true,
    "fecha_creacion": "2025-10-26T00:00:00.000Z"
  }
}
```

#### 2. Login (Unificado)

**Endpoint:** `POST /auth/login`

**Nota:** El mismo endpoint funciona para los 3 tipos de usuario. El backend busca en las 3 tablas automáticamente.

```json
// Request
{
  "email": "juan@ejemplo.com",
  "contraseña": "Password123!"
}

// Response (200 OK) - Ciudadano
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "userType": "CIUDADANO",
    "nombre": "Juan Carlos",
    "apellidos": "Pérez González",
    "email": "juan@ejemplo.com",
    "strikes": 0,
    "activo": true
  }
}

// Response (200 OK) - Entidad
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "userType": "ENTIDAD",
    "nombre_entidad": "Bomberos Central",
    "tipo_entidad": "BOMBEROS",
    "email": "bomberos@go.cr",
    "activo": true
  }
}

// Response (200 OK) - Admin
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "userType": "ADMIN",
    "nombre": "María Elena",
    "apellidos": "Rodríguez Castro",
    "email": "maria@lazarus.com",
    "nivel_acceso": "ADMIN",
    "activo": true
  }
}
```

#### 3. Uso del Token

**Todos los endpoints protegidos requieren:**

```http
Authorization: Bearer <access_token>
```

**Ejemplo con fetch:**

```javascript
const token = localStorage.getItem('access_token');

fetch('http://localhost:3000/incidents', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

### Sistema de Strikes (Solo Ciudadanos)

- **Solo los CIUDADANOS** tienen sistema de strikes
- Cada reporte marcado como **FALSO** incrementa el contador de strikes
- **3 strikes** → Usuario automáticamente **DESHABILITADO** (activo = false)
- Los usuarios deshabilitados no pueden iniciar sesión
- **ENTIDADES y ADMIN** no tienen strikes

---

## 🛣️ API REST - Endpoints

### 👤 Usuarios (`/users`)

#### Obtener todos los usuarios (3 tablas combinadas)
```http
GET /users
Authorization: Bearer <token>
Roles: ADMIN, ENTIDAD
```

**Response:**
```json
[
  {
    "id_ciudadano": 1,
    "userType": "CIUDADANO",
    "nombre": "Juan",
    "apellidos": "Pérez",
    "email": "juan@ejemplo.com",
    "cedula": "1-2345-6789",
    "strikes": 0,
    "activo": true
  },
  {
    "id_entidad": 1,
    "userType": "ENTIDAD",
    "nombre_entidad": "Bomberos Central",
    "tipo_entidad": "BOMBEROS",
    "email": "bomberos@go.cr",
    "activo": true
  },
  {
    "id_admin": 1,
    "userType": "ADMIN",
    "nombre": "María",
    "apellidos": "Rodríguez",
    "email": "maria@lazarus.com",
    "nivel_acceso": "ADMIN",
    "activo": true
  }
]
```

#### Obtener mi perfil
```http
GET /users/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "userType": "CIUDADANO",
  "nombre": "Juan Carlos",
  "apellidos": "Pérez González",
  "email": "juan@ejemplo.com",
  "strikes": 0,
  "activo": true
}
```

#### Obtener usuario específico por tipo e ID
```http
GET /users/:userType/:id
Authorization: Bearer <token>

Ejemplos:
GET /users/CIUDADANO/1
GET /users/ENTIDAD/1
GET /users/ADMIN/1
```

#### Obtener todos los ciudadanos
```http
GET /users/ciudadanos
Authorization: Bearer <token>
Roles: ADMIN, ENTIDAD
```

#### Obtener todas las entidades
```http
GET /users/entidades
Authorization: Bearer <token>
Roles: ADMIN
```

#### Obtener todos los administradores
```http
GET /users/administradores
Authorization: Bearer <token>
Roles: ADMIN
```

#### Alternar estado activo/inactivo
```http
PATCH /users/:userType/:id/toggle-status
Authorization: Bearer <token>
Roles: ADMIN

Ejemplo: PATCH /users/CIUDADANO/1/toggle-status
```

#### Incrementar strikes (solo ciudadanos)
```http
PATCH /users/ciudadano/:id/strike
Authorization: Bearer <token>
Roles: ADMIN, ENTIDAD
```

---

### 🚨 Incidentes (`/incidents`)

#### Obtener todos los incidentes (con filtros)
```http
GET /incidents?tipo=INCENDIO&severidad=ALTA&estado=PENDIENTE
Authorization: Bearer <token>
```

**Query Parameters (todos opcionales):**
- `tipo`: INCENDIO | ACCIDENTE | INUNDACION | DESLIZAMIENTO | TERREMOTO | OTRO
- `severidad`: BAJA | MEDIA | ALTA | CRITICA
- `estado`: PENDIENTE | EN_PROCESO | RESUELTO | CANCELADO

**Response:**
```json
[
  {
    "id": 1,
    "ciudadano_id": 1,
    "tipo": "INCENDIO",
    "descripcion": "Incendio en edificio residencial",
    "severidad": "ALTA",
    "latitud": 9.9281,
    "longitud": -84.0907,
    "direccion": "Av. Central, San José, Costa Rica",
    "estado": "PENDIENTE",
    "fecha_creacion": "2025-10-26T12:30:00.000Z",
    "fecha_actualizacion": "2025-10-26T12:30:00.000Z",
    "ciudadano": {
      "id_ciudadano": 1,
      "nombre": "Juan Carlos",
      "apellidos": "Pérez González",
      "email": "juan@ejemplo.com"
    }
  }
]
```

#### Crear incidente
```http
POST /incidents
Authorization: Bearer <token> (CIUDADANO)
Content-Type: application/json

{
  "tipo": "INCENDIO",
  "descripcion": "Incendio en edificio residencial",
  "severidad": "ALTA",
  "latitud": 9.9281,
  "longitud": -84.0907,
  "direccion": "Av. Central, San José",
  "imagenes": ["https://example.com/image1.jpg"]
}
```

**Nota:** El `ciudadano_id` se extrae automáticamente del JWT. Solo CIUDADANOS pueden crear incidentes.

**⚡ Importante:** Al crear un incidente, se emite automáticamente un evento WebSocket `incident:created` a todos los clientes conectados.

#### Obtener incidente por ID
```http
GET /incidents/:id
Authorization: Bearer <token>
```

#### Actualizar incidente
```http
PATCH /incidents/:id
Authorization: Bearer <token>
Content-Type: application/json

// CIUDADANO (solo sus incidentes)
{
  "descripcion": "Actualización del incidente",
  "severidad": "CRITICA"
}

// ENTIDAD
{
  "estado": "EN_PROCESO"
}

// ADMIN (puede actualizar todo)
{
  "estado": "RESUELTO",
  "descripcion": "Incidente resuelto por bomberos",
  "severidad": "MEDIA"
}
```

**🔒 Permisos:**
- **CIUDADANO**: Solo descripción/severidad de sus propios incidentes
- **ENTIDAD**: Solo estado
- **ADMIN**: Todos los campos de cualquier incidente

**⚡ WebSocket:** Si cambia el estado, se emite `incident:updated`.

#### Eliminar incidente
```http
DELETE /incidents/:id
Authorization: Bearer <token>
Roles: CIUDADANO (solo propios), ADMIN
```

#### Buscar incidentes cercanos
```http
GET /incidents/nearby?lat=9.9281&lng=-84.0907&radius=5
Authorization: Bearer <token>
```

**Query Parameters:**
- `lat`: Latitud (requerido)
- `lng`: Longitud (requerido)
- `radius`: Radio en kilómetros (default: 10km)

**Response:**
```json
[
  {
    "id": 1,
    "tipo": "INCENDIO",
    "descripcion": "Incendio en edificio",
    "latitud": 9.9300,
    "longitud": -84.0950,
    "direccion": "Av. Central",
    "distancia": 0.45,  // km desde el punto de consulta
    "ciudadano": {
      "id_ciudadano": 1,
      "nombre": "Juan Carlos",
      "apellidos": "Pérez"
    }
  }
]
```

**🗺️ Algoritmo:** Utiliza la fórmula de Haversine para cálculo preciso de distancias.

#### Estadísticas de incidentes
```http
GET /incidents/statistics
Authorization: Bearer <token>
```

**Response:**
```json
{
  "total": 68,
  "porEstado": {
    "PENDIENTE": 15,
    "EN_PROCESO": 8,
    "RESUELTO": 42,
    "CANCELADO": 3
  },
  "porSeveridad": {
    "BAJA": 20,
    "MEDIA": 25,
    "ALTA": 18,
    "CRITICA": 5
  },
  "porTipo": {
    "INCENDIO": 22,
    "ACCIDENTE": 18,
    "INUNDACION": 15,
    "DESLIZAMIENTO": 8,
    "TERREMOTO": 3,
    "OTRO": 2
  }
}
```

---

### 🔔 Notificaciones (`/notifications`)

#### Obtener mis notificaciones
```http
GET /notifications/user/:userId
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 1,
    "tipo": "INCIDENTE_ACTUALIZADO",
    "titulo": "Incidente actualizado",
    "mensaje": "Tu incidente #5 cambió a EN_PROCESO",
    "leida": false,
    "fecha_creacion": "2025-10-26T16:00:00.000Z"
  }
]
```

#### Obtener notificaciones no leídas
```http
GET /notifications/user/:userId/unread
Authorization: Bearer <token>
```

**Response:**
```json
{
  "count": 3,
  "notifications": [...]
}
```

#### Crear notificación
```http
POST /notifications
Authorization: Bearer <token>
Roles: ADMIN, ENTIDAD
Content-Type: application/json

{
  "user_id": 1,
  "user_type": "CIUDADANO",
  "tipo": "SISTEMA",
  "titulo": "Mantenimiento programado",
  "mensaje": "El sistema estará en mantenimiento mañana",
  "priority": "MEDIA"
}
```

#### Marcar como leída
```http
PATCH /notifications/:id/read
Authorization: Bearer <token>
```

#### Marcar todas como leídas
```http
PATCH /notifications/user/:userId/read-all
Authorization: Bearer <token>
```

#### Eliminar notificación
```http
DELETE /notifications/:id
Authorization: Bearer <token>
```

#### Notificar cambio de estado de incidente
```http
POST /notifications/incident-status
Authorization: Bearer <token>
Roles: ENTIDAD, ADMIN
Content-Type: application/json

{
  "incidentId": 5,
  "newStatus": "EN_PROCESO"
}
```

#### Enviar mensaje del sistema
```http
POST /notifications/system-message
Authorization: Bearer <token>
Roles: ADMIN
Content-Type: application/json

{
  "titulo": "Mantenimiento programado",
  "mensaje": "El sistema estará en mantenimiento el lunes",
  "targetUserType": "TODOS"
}
```

---

### 📊 Estadísticas (`/statistics`)

#### Dashboard general
```http
GET /statistics/dashboard
Authorization: Bearer <token>
Roles: ENTIDAD, ADMIN
```

**Response:**
```json
{
  "totals": {
    "incidents": 68,
    "users": 150,
    "ciudadanos": 140,
    "entidades": 8,
    "admins": 2,
    "notifications": 450
  },
  "incidentsByStatus": {
    "PENDIENTE": 15,
    "EN_PROCESO": 8,
    "RESUELTO": 42,
    "CANCELADO": 3
  },
  "incidentsBySeverity": {
    "BAJA": 20,
    "MEDIA": 25,
    "ALTA": 18,
    "CRITICA": 5
  },
  "incidentsByType": {
    "INCENDIO": 22,
    "ACCIDENTE": 18,
    "INUNDACION": 15,
    "DESLIZAMIENTO": 8,
    "TERREMOTO": 3,
    "OTRO": 2
  },
  "usersByType": {
    "CIUDADANO": 140,
    "ENTIDAD": 8,
    "ADMIN": 2
  },
  "recentIncidents": [...]
}
```

#### Estadísticas por estado
```http
GET /statistics/incidents/status
Authorization: Bearer <token>
Roles: ENTIDAD, ADMIN
```

#### Estadísticas por severidad
```http
GET /statistics/incidents/severity
Authorization: Bearer <token>
Roles: ENTIDAD, ADMIN
```

#### Estadísticas por tipo
```http
GET /statistics/incidents/type
Authorization: Bearer <token>
Roles: ENTIDAD, ADMIN
```

#### Estadísticas de usuarios por tipo
```http
GET /statistics/users/type
Authorization: Bearer <token>
Roles: ADMIN
```

#### Incidentes recientes
```http
GET /statistics/incidents/recent?limit=10
Authorization: Bearer <token>
Roles: ENTIDAD, ADMIN
```

#### Tendencias de incidentes
```http
GET /statistics/incidents/trends?days=30
Authorization: Bearer <token>
Roles: ENTIDAD, ADMIN
```

**Response:**
```json
{
  "period": "últimos 30 días",
  "total": 45,
  "promedioDiario": 1.5,
  "porDia": [
    { "fecha": "2025-10-26", "cantidad": 3 },
    { "fecha": "2025-10-25", "cantidad": 2 }
  ]
}
```

#### Incidentes por ubicación
```http
GET /statistics/incidents/location
Authorization: Bearer <token>
Roles: ENTIDAD, ADMIN
```

**Response:**
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

#### Actividad de usuario
```http
GET /statistics/users/:userId/activity?userType=CIUDADANO
Authorization: Bearer <token>
```

**Response:**
```json
{
  "userId": 1,
  "userType": "CIUDADANO",
  "totalIncidentes": 15,
  "incidentesActivos": 3,
  "incidentesResueltos": 12,
  "strikes": 0,
  "fechaRegistro": "2025-01-15T00:00:00.000Z"
}
```

---

## 🌐 WebSocket - Eventos en Tiempo Real

### Conexión

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000', {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});

socket.on('connect', () => {
  console.log('Connected:', socket.id);
});

socket.on('disconnect', () => {
  console.log('Disconnected');
});
```

### Eventos Disponibles

#### 📍 Tracking de Ubicación

**Cliente → Servidor: Actualizar ubicación**
```javascript
socket.emit('location:update', {
  userId: 1,
  latitude: 9.9281,
  longitude: -84.0907,
  timestamp: new Date().toISOString()
});
```

**Servidor → Cliente: Ubicación de entidad actualizada**
```javascript
socket.on('entity:location', (data) => {
  console.log('Entity location:', data);
  // {
  //   userId: 5,
  //   latitude: 9.9300,
  //   longitude: -84.0950,
  //   timestamp: '2025-10-26T15:30:00.000Z'
  // }
});
```

**Cliente → Servidor: Solicitar ubicación de entidad**
```javascript
socket.emit('entity:request-location', {
  userId: 5  // ID de la entidad
});

socket.on('entity:location', (data) => {
  // Recibir ubicación solicitada
});
```

#### 🚨 Eventos de Incidentes

**Servidor → Cliente: Nuevo incidente creado**
```javascript
socket.on('incident:created', (incident) => {
  console.log('New incident:', incident);
  // Actualizar mapa con nuevo marcador
  addMarkerToMap(incident.latitud, incident.longitud, incident);
});
```

**Servidor → Cliente: Incidente actualizado**
```javascript
socket.on('incident:updated', (incident) => {
  console.log('Incident updated:', incident);
  // Actualizar marcador existente
  updateMarker(incident.id, incident);
});
```

**Cliente → Servidor: Suscribirse a incidentes cercanos**
```javascript
socket.emit('incident:nearby', {
  latitude: 9.9281,
  longitude: -84.0907,
  radius: 5  // km
});

// Recibir incidentes en el área
socket.on('incident:created', (incident) => {
  // Solo si está dentro del radio
});
```

#### 🔔 Notificaciones en Tiempo Real

**Servidor → Cliente: Notificación personal**
```javascript
socket.on('notification', (notification) => {
  console.log('New notification:', notification);
  // {
  //   id: 15,
  //   mensaje: "Tu incidente #42 ha sido atendido",
  //   incidente_id: 42,
  //   fecha: "2025-10-26T15:30:00.000Z"
  // }
  
  // Mostrar toast o push notification
  showNotification(notification.mensaje);
});
```

**Servidor → Todos: Broadcast de emergencia**
```javascript
socket.on('broadcast', (data) => {
  console.log('Broadcast message:', data);
  // {
  //   message: "Alerta de tsunami en zona costera",
  //   severity: "CRITICA",
  //   timestamp: "2025-10-26T15:30:00.000Z"
  // }
  
  // Mostrar alerta crítica en pantalla completa
  showCriticalAlert(data);
});
```

#### 🗺️ Geofencing (Áreas de Interés)

**Cliente → Servidor: Suscribirse a un área**
```javascript
socket.emit('geofence:subscribe', {
  areaId: 'san-jose-centro',
  bounds: {
    north: 9.9400,
    south: 9.9200,
    east: -84.0800,
    west: -84.1000
  }
});
```

**Servidor → Cliente: Incidente en área suscrita**
```javascript
socket.on('geofence:incident', (data) => {
  console.log('Incident in subscribed area:', data);
  // Mostrar alerta con sonido
});
```

#### 🏓 Ping/Pong (Health Check)

```javascript
socket.emit('ping');

socket.on('pong', (data) => {
  console.log('Server response:', data);
  // {
  //   timestamp: '2025-10-26T15:30:00.000Z',
  //   clientId: 'abc123',
  //   message: 'Server is alive!'
  // }
});
```

---

## 📊 Modelos de Datos

### Ciudadano

```typescript
{
  id_ciudadano: number;
  nombre: string;
  apellidos: string;
  email: string;              // Único en las 3 tablas
  contraseña: string;         // Hasheado con bcrypt (no se devuelve)
  cedula: string;             // Único
  telefono?: string;
  provincia: string;
  canton: string;
  distrito: string;
  direccion?: string;
  strikes: number;            // 0-3
  activo: boolean;            // false si strikes >= 3
  fecha_creacion: Date;
}
```

### Entidad Pública

```typescript
{
  id_entidad: number;
  nombre_entidad: string;
  tipo_entidad: TipoEntidad;  // BOMBEROS, POLICIA, CRUZ_ROJA, etc.
  email: string;              // Único en las 3 tablas
  contraseña: string;         // Hasheado con bcrypt (no se devuelve)
  telefono_emergencia: string;
  provincia: string;
  canton: string;
  distrito: string;
  ubicacion: string;
  activo: boolean;
  fecha_registro: Date;
}
```

### Administrador

```typescript
{
  id_admin: number;
  nombre: string;
  apellidos: string;
  email: string;              // Único en las 3 tablas
  contraseña: string;         // Hasheado con bcrypt (no se devuelve)
  nivel_acceso: NivelAcceso;  // SUPER_ADMIN, ADMIN, MODERADOR
  provincia: string;
  canton: string;
  distrito: string;
  activo: boolean;
  fecha_creacion: Date;
}
```

### Incidente (Incident)

```typescript
{
  id: number;
  ciudadano_id: number;
  ciudadano: Ciudadano;       // Relación con Ciudadano
  tipo: 'INCENDIO' | 'ACCIDENTE' | 'INUNDACION' | 'DESLIZAMIENTO' | 'TERREMOTO' | 'OTRO';
  descripcion: string;
  severidad: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
  latitud: number;            // Decimal (10, 8)
  longitud: number;           // Decimal (11, 8)
  direccion: string;
  imagenes?: string[];        // URLs de imágenes
  estado: 'PENDIENTE' | 'EN_PROCESO' | 'RESUELTO' | 'CANCELADO';
  fecha_creacion: Date;
  fecha_actualizacion: Date;
}
```

### Notificación (Notification)

```typescript
{
  id: number;
  user_id: number;
  user_type: 'CIUDADANO' | 'ENTIDAD' | 'ADMIN';
  incidente_id?: number;
  tipo: string;               // INCIDENTE_ACTUALIZADO, SISTEMA, etc.
  titulo: string;
  mensaje: string;
  leida: boolean;
  priority?: 'BAJA' | 'MEDIA' | 'ALTA';
  fecha_creacion: Date;
}
```

---

## 🗺️ APIs de Mapas Recomendadas

### 1. **Google Maps API** (Recomendado) ⭐

**Por qué:**
- Cobertura completa de Costa Rica
- Datos actualizados constantemente
- Excelente documentación
- Geocoding y Reverse Geocoding
- Places API para búsqueda de lugares

**Características:**
- ✅ Mapas interactivos
- ✅ Marcadores personalizados
- ✅ Geocoding (dirección → coordenadas)
- ✅ Reverse Geocoding (coordenadas → dirección)
- ✅ Búsqueda de lugares
- ✅ Autocompletado de direcciones
- ✅ Cálculo de rutas
- ✅ Street View

**Pricing:**
- $200 USD de crédito gratis mensual
- $7 por 1000 peticiones de Maps (después del crédito)
- $5 por 1000 peticiones de Geocoding
- $17 por 1000 peticiones de Places API

**Instalación:**

```bash
npm install @react-google-maps/api
# o
npm install @googlemaps/js-api-loader
```

**Obtener API Key:**
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un proyecto
3. Activa las APIs:
   - Maps JavaScript API
   - Geocoding API
   - Places API
   - Geolocation API
4. Crea credenciales (API Key)
5. Restringe la key por dominio (producción)

---

### 2. **Mapbox** (Alternativa moderna)

**Por qué:**
- Diseño moderno y personalizable
- Excelente performance
- Más económico que Google Maps
- Buen soporte para Costa Rica

**Características:**
- ✅ Mapas vectoriales (más ligeros)
- ✅ Estilos personalizables
- ✅ Geocoding incluido
- ✅ Búsqueda de lugares
- ✅ Navegación turn-by-turn
- ✅ SDK para React Native

**Pricing:**
- 50,000 cargas de mapa gratis/mes
- 100,000 peticiones de geocoding gratis/mes
- Después: $5 por 1000 peticiones

**Instalación:**

```bash
npm install mapbox-gl
npm install react-map-gl  # Para React
```

---

### 3. **OpenStreetMap + Leaflet** (Gratis)

**Por qué:**
- 100% gratuito
- Open source
- Sin límites de peticiones
- Buena cobertura de Costa Rica

**Limitaciones:**
- ⚠️ Menos features que Google Maps
- ⚠️ Datos pueden estar desactualizados
- ⚠️ No incluye Places API nativo

**Instalación:**

```bash
npm install leaflet react-leaflet
```

---

### ✅ Recomendación Final

**Para Lazarus:**

1. **Google Maps API** - Para producción
   - Mejor para búsqueda de lugares en Costa Rica
   - Geocoding más preciso
   - Autocompletado de direcciones robusto

2. **Leaflet + OpenStreetMap** - Para desarrollo/testing
   - Sin costos durante desarrollo
   - Fácil migración a Google Maps después

---

## 🇨🇷 Búsqueda de Lugares en Costa Rica

### Google Places API (Recomendado)

#### Autocompletado de Direcciones

```javascript
const autocompleteService = new google.maps.places.AutocompleteService();

autocompleteService.getPlacePredictions(
  {
    input: 'Hospital San Juan',
    componentRestrictions: { country: 'cr' },  // Solo Costa Rica
    types: ['establishment', 'geocode'],
    location: new google.maps.LatLng(9.9281, -84.0907),  // San José
    radius: 50000  // 50km de radio
  },
  (predictions, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      console.log(predictions);
      // [
      //   {
      //     description: "Hospital San Juan de Dios, San José, Costa Rica",
      //     place_id: "ChIJ...",
      //     structured_formatting: {
      //       main_text: "Hospital San Juan de Dios",
      //       secondary_text: "San José, Costa Rica"
      //     }
      //   }
      // ]
    }
  }
);
```

#### Geocoding (Dirección → Coordenadas)

```javascript
const geocoder = new google.maps.Geocoder();

geocoder.geocode(
  {
    address: 'Avenida Central, San José, Costa Rica',
    componentRestrictions: { country: 'CR' }
  },
  (results, status) => {
    if (status === 'OK') {
      const location = results[0].geometry.location;
      console.log('Lat:', location.lat());  // 9.9281
      console.log('Lng:', location.lng());  // -84.0907
    }
  }
);
```

#### Reverse Geocoding (Coordenadas → Dirección)

```javascript
geocoder.geocode(
  {
    location: { lat: 9.9281, lng: -84.0907 }
  },
  (results, status) => {
    if (status === 'OK' && results[0]) {
      console.log(results[0].formatted_address);
      // "Av. Central, San José, Costa Rica"
    }
  }
);
```

#### Búsqueda de Lugares Cercanos

```javascript
const service = new google.maps.places.PlacesService(map);

service.nearbySearch(
  {
    location: { lat: 9.9281, lng: -84.0907 },
    radius: 5000,  // 5km
    type: ['hospital', 'police', 'fire_station'],
    keyword: 'emergencia'
  },
  (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      results.forEach(place => {
        console.log(place.name, place.vicinity);
        // "Hospital México", "La Uruca, San José"
      });
    }
  }
);
```

---

### API Alternativa: Nominatim (OpenStreetMap)

**Gratis, sin límites estrictos**

#### Geocoding

```javascript
async function geocodeAddress(address) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?` +
    `q=${encodeURIComponent(address + ', Costa Rica')}` +
    `&format=json&limit=1&countrycodes=cr`
  );
  
  const data = await response.json();
  
  if (data.length > 0) {
    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
      display_name: data[0].display_name
    };
  }
}

// Uso
const location = await geocodeAddress('San José Centro');
console.log(location);
// { lat: 9.9281, lon: -84.0907, display_name: "..." }
```

#### Reverse Geocoding

```javascript
async function reverseGeocode(lat, lng) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?` +
    `lat=${lat}&lon=${lng}&format=json`
  );
  
  const data = await response.json();
  return data.display_name;
}

const address = await reverseGeocode(9.9281, -84.0907);
console.log(address);
// "Avenida Central, San José, Provincia de San José, 10101, Costa Rica"
```

**⚠️ Importante:** Nominatim requiere incluir un User-Agent header:

```javascript
fetch(url, {
  headers: {
    'User-Agent': 'LazarusApp/1.0 (contact@lazarus.com)'
  }
})
```

---

## 🗺️ Integración con Mapas - Ejemplos

### Ejemplo 1: Google Maps con React

```jsx
import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import io from 'socket.io-client';

const GOOGLE_MAPS_API_KEY = 'TU_API_KEY_AQUI';

const mapContainerStyle = {
  width: '100%',
  height: '600px'
};

const center = {
  lat: 9.9281,  // San José, Costa Rica
  lng: -84.0907
};

function EmergencyMap() {
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [map, setMap] = useState(null);

  useEffect(() => {
    // Conectar a WebSocket
    const socket = io('http://localhost:3000');

    // Cargar incidentes iniciales
    fetch('http://localhost:3000/incidents', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    })
      .then(res => res.json())
      .then(data => setIncidents(data));

    // Escuchar nuevos incidentes en tiempo real
    socket.on('incident:created', (newIncident) => {
      setIncidents(prev => [...prev, newIncident]);
      
      // Animar hacia el nuevo incidente
      if (map) {
        map.panTo({
          lat: newIncident.latitud,
          lng: newIncident.longitud
        });
      }
    });

    // Escuchar actualizaciones
    socket.on('incident:updated', (updatedIncident) => {
      setIncidents(prev => 
        prev.map(inc => 
          inc.id === updatedIncident.id ? updatedIncident : inc
        )
      );
    });

    return () => socket.disconnect();
  }, [map]);

  const getMarkerIcon = (severity) => {
    const colors = {
      'BAJA': '#4CAF50',
      'MEDIA': '#FFC107',
      'ALTA': '#FF9800',
      'CRITICA': '#F44336'
    };
    
    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: colors[severity],
      fillOpacity: 0.8,
      strokeColor: '#fff',
      strokeWeight: 2,
      scale: 10
    };
  };

  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={13}
        onLoad={map => setMap(map)}
      >
        {incidents.map(incident => (
          <Marker
            key={incident.id}
            position={{
              lat: incident.latitud,
              lng: incident.longitud
            }}
            icon={getMarkerIcon(incident.severidad)}
            onClick={() => setSelectedIncident(incident)}
          />
        ))}

        {selectedIncident && (
          <InfoWindow
            position={{
              lat: selectedIncident.latitud,
              lng: selectedIncident.longitud
            }}
            onCloseClick={() => setSelectedIncident(null)}
          >
            <div style={{ padding: '10px' }}>
              <h3>{selectedIncident.tipo}</h3>
              <p><strong>Severidad:</strong> {selectedIncident.severidad}</p>
              <p><strong>Estado:</strong> {selectedIncident.estado}</p>
              <p>{selectedIncident.descripcion}</p>
              <p><small>{selectedIncident.direccion}</small></p>
              <p><small>Reportado por: {selectedIncident.usuario.nombre}</small></p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
}

export default EmergencyMap;
```

---

### Ejemplo 2: Leaflet con React

```jsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import io from 'socket.io-client';

// Fix para los iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Iconos personalizados por severidad
const getIcon = (severity) => {
  const colors = {
    'BAJA': 'green',
    'MEDIA': 'yellow',
    'ALTA': 'orange',
    'CRITICA': 'red'
  };

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${colors[severity]};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};

function EmergencyMapLeaflet() {
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    const socket = io('http://localhost:3000');

    // Cargar incidentes
    fetch('http://localhost:3000/incidents', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    })
      .then(res => res.json())
      .then(data => setIncidents(data));

    // WebSocket listeners
    socket.on('incident:created', (newIncident) => {
      setIncidents(prev => [...prev, newIncident]);
    });

    socket.on('incident:updated', (updatedIncident) => {
      setIncidents(prev =>
        prev.map(inc =>
          inc.id === updatedIncident.id ? updatedIncident : inc
        )
      );
    });

    return () => socket.disconnect();
  }, []);

  return (
    <MapContainer
      center={[9.9281, -84.0907]}
      zoom={13}
      style={{ height: '600px', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {incidents.map(incident => (
        <Marker
          key={incident.id}
          position={[incident.latitud, incident.longitud]}
          icon={getIcon(incident.severidad)}
        >
          <Popup>
            <div>
              <h3>{incident.tipo}</h3>
              <p><strong>Severidad:</strong> {incident.severidad}</p>
              <p><strong>Estado:</strong> {incident.estado}</p>
              <p>{incident.descripcion}</p>
              <p><small>{incident.direccion}</small></p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default EmergencyMapLeaflet;
```

---

### Ejemplo 3: Formulario de Reporte con Autocompletado

```jsx
import React, { useState, useRef, useEffect } from 'react';
import { Autocomplete } from '@react-google-maps/api';

function IncidentReportForm() {
  const [formData, setFormData] = useState({
    tipo: 'MEDICA',
    severidad: 'MEDIA',
    descripcion: '',
    direccion: '',
    latitud: null,
    longitud: null
  });

  const autocompleteRef = useRef(null);

  const handlePlaceSelect = () => {
    const place = autocompleteRef.current.getPlace();

    if (place.geometry) {
      const location = place.geometry.location;

      setFormData(prev => ({
        ...prev,
        direccion: place.formatted_address,
        latitud: location.lat(),
        longitud: location.lng()
      }));
    }
  };

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
        body: JSON.stringify(formData)  // ciudadano_id se extrae del JWT
      });

      if (response.ok) {
        alert('Incidente reportado exitosamente');
        // Limpiar formulario
        setFormData({
          tipo: 'MEDICA',
          severidad: 'MEDIA',
          descripcion: '',
          direccion: '',
          latitud: null,
          longitud: null
        });
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al reportar incidente');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '20px', maxWidth: '500px' }}>
      <h2>Reportar Incidente</h2>

      <div style={{ marginBottom: '15px' }}>
        <label>Tipo de Incidente:</label>
        <select
          value={formData.tipo}
          onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
          style={{ width: '100%', padding: '8px' }}
        >
          <option value="INCENDIO">Incendio</option>
          <option value="ACCIDENTE">Accidente</option>
          <option value="INUNDACION">Inundación</option>
          <option value="DESLIZAMIENTO">Deslizamiento</option>
          <option value="TERREMOTO">Terremoto</option>
          <option value="OTRO">Otro</option>
        </select>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Severidad:</label>
        <select
          value={formData.severidad}
          onChange={(e) => setFormData({ ...formData, severidad: e.target.value })}
          style={{ width: '100%', padding: '8px' }}
        >
          <option value="BAJA">Baja</option>
          <option value="MEDIA">Media</option>
          <option value="ALTA">Alta</option>
          <option value="CRITICA">Crítica</option>
        </select>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Dirección:</label>
        <Autocomplete
          onLoad={ref => (autocompleteRef.current = ref)}
          onPlaceChanged={handlePlaceSelect}
          options={{
            componentRestrictions: { country: 'cr' },
            fields: ['formatted_address', 'geometry']
          }}
        >
          <input
            type="text"
            value={formData.direccion}
            onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
            placeholder="Buscar dirección en Costa Rica..."
            style={{ width: '100%', padding: '8px' }}
            required
          />
        </Autocomplete>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Descripción:</label>
        <textarea
          value={formData.descripcion}
          onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
          placeholder="Describe el incidente..."
          rows={4}
          style={{ width: '100%', padding: '8px' }}
          required
        />
      </div>

      <button
        type="submit"
        style={{
          backgroundColor: '#F44336',
          color: 'white',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
        disabled={!formData.latitud || !formData.longitud}
      >
        Reportar Emergencia
      </button>

      {formData.latitud && (
        <p style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
          Ubicación: {formData.latitud.toFixed(4)}, {formData.longitud.toFixed(4)}
        </p>
      )}
    </form>
  );
}

export default IncidentReportForm;
```

---

## 🔄 Flujos de Usuario

### Flujo 1: Ciudadano Reporta Incidente

```
1. Usuario abre la app
2. Login/Register → Obtiene access_token
3. Ve mapa con incidentes existentes (WebSocket conectado)
4. Click en "Reportar Incidente"
5. Selecciona ubicación (GPS o búsqueda de dirección)
6. Llena formulario (tipo, severidad, descripción)
7. POST /api/incidents
8. ✅ Backend emite WebSocket 'incident:created'
9. ✅ Todos los usuarios ven el nuevo marcador en tiempo real
10. ✅ Entidades cercanas reciben notificación
```

### Flujo 2: Entidad Atiende Incidente

```
1. Entidad recibe notificación de nuevo incidente
2. Ve detalles en el mapa
3. Click en marcador → Abre detalles
4. Click en "Atender" → Cambia estado a REVISION
5. PATCH /api/incidents/:id { estado: 'REVISION' }
6. ✅ Backend emite 'incident:updated'
7. ✅ Reportante recibe notificación: "Tu incidente está siendo atendido"
8. Entidad emite location:update mientras se dirige al lugar
9. ✅ Reportante ve en tiempo real la ubicación de la entidad
10. Al terminar: PATCH /api/incidents/:id { estado: 'ATENDIDO' }
11. ✅ Reportante recibe notificación: "Incidente resuelto"
```

### Flujo 3: Admin/Entidad Incrementa Strikes

```
1. Admin/Entidad revisa incidente sospechoso
2. Click en "Marcar como Falso"
3. PATCH /incidents/:id { estado: 'CANCELADO' }
4. Manualmente: PATCH /users/ciudadano/:id/strike
5. Backend automáticamente:
   - Incrementa strikes del ciudadano
   - Si strikes >= 3 → activo = false (cuenta deshabilitada)
6. ✅ Ciudadano recibe notificación: "Tu reporte fue marcado como falso"
7. ✅ Si 3 strikes → "Tu cuenta ha sido deshabilitada"
8. ✅ Ciudadano no puede hacer login hasta que admin reactive la cuenta
```

---

## ⚠️ Manejo de Errores

### Códigos de Error Comunes

```typescript
// 400 Bad Request
{
  "statusCode": 400,
  "message": ["email must be an email", "contraseña should not be empty"],
  "error": "Bad Request"
}

// 401 Unauthorized (token inválido o expirado)
{
  "statusCode": 401,
  "message": "Unauthorized"
}

// 403 Forbidden (sin permisos)
{
  "statusCode": 403,
  "message": "No tienes permisos para realizar esta acción"
}

// 404 Not Found
{
  "statusCode": 404,
  "message": "Incidente no encontrado"
}

// 409 Conflict
{
  "statusCode": 409,
  "message": "El email ya está registrado"
}

// 500 Internal Server Error
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

### Manejo en el Frontend

```javascript
async function makeAuthRequest(url, options = {}) {
  const token = localStorage.getItem('access_token');

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (response.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Sesión expirada');
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error en la petición');
    }

    return await response.json();
  } catch (error) {
    console.error('Request error:', error);
    throw error;
  }
}

// Uso
try {
  const incidents = await makeAuthRequest('http://localhost:3000/api/incidents');
  setIncidents(incidents);
} catch (error) {
  alert(error.message);
}
```

---

## 📝 Ejemplos de Código Completos

### Servicio de Autenticación (React)

```javascript
// services/authService.js
const API_URL = 'http://localhost:3000';

export const authService = {
  async login(email, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, contraseña: password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error en login');
    }

    const data = await response.json();
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  async register(userData) {
    // userData puede ser RegisterCiudadanoDto, RegisterEntidadDto o RegisterAdminDto
    const endpoint = userData.cedula ? '/auth/register' 
      : userData.tipo_entidad ? '/auth/register-entidad'
      : '/auth/register-admin';
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error en registro');
    }

    const data = await response.json();
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },

  getToken() {
    return localStorage.getItem('access_token');
  },

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated() {
    return !!this.getToken();
  }
};
```

---

### Hook de WebSocket (React)

```javascript
// hooks/useWebSocket.js
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

export function useWebSocket(url = 'http://localhost:3000') {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [incidents, setIncidents] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const newSocket = io(url, {
      transports: ['websocket', 'polling'],
      reconnection: true
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connected:', newSocket.id);
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    });

    // Eventos de incidentes
    newSocket.on('incident:created', (incident) => {
      setIncidents(prev => [...prev, incident]);
      showToast(`Nuevo incidente: ${incident.tipo} - ${incident.severidad}`);
    });

    newSocket.on('incident:updated', (incident) => {
      setIncidents(prev =>
        prev.map(inc => inc.id === incident.id ? incident : inc)
      );
    });

    // Eventos de notificaciones
    newSocket.on('notification', (notification) => {
      setNotifications(prev => [...prev, notification]);
      showToast(notification.mensaje);
    });

    newSocket.on('broadcast', (data) => {
      alert(`🚨 ALERTA: ${data.message}`);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [url]);

  const updateLocation = (userId, latitude, longitude) => {
    if (socket && connected) {
      socket.emit('location:update', {
        userId,
        latitude,
        longitude,
        timestamp: new Date().toISOString()
      });
    }
  };

  const subscribeToNearby = (latitude, longitude, radius = 10) => {
    if (socket && connected) {
      socket.emit('incident:nearby', { latitude, longitude, radius });
    }
  };

  return {
    socket,
    connected,
    incidents,
    notifications,
    updateLocation,
    subscribeToNearby
  };
}

function showToast(message) {
  // Implementar según tu librería de toasts
  console.log('Toast:', message);
}
```

---

## 🚀 Checklist de Implementación

### Fase 1: Setup Básico
- [ ] Instalar dependencias (socket.io-client, google-maps-api, etc.)
- [ ] Configurar variables de entorno (API_URL, GOOGLE_MAPS_KEY)
- [ ] Implementar servicio de autenticación
- [ ] Crear páginas de Login/Register
- [ ] Implementar guards de rutas protegidas

### Fase 2: Mapa Base
- [ ] Integrar Google Maps o Leaflet
- [ ] Mostrar ubicación del usuario (GPS)
- [ ] Implementar búsqueda de direcciones
- [ ] Agregar controles de zoom y ubicación actual

### Fase 3: Visualización de Incidentes
- [ ] Cargar incidentes desde API REST
- [ ] Mostrar marcadores en el mapa
- [ ] Implementar iconos por severidad
- [ ] Agregar InfoWindows/Popups con detalles
- [ ] Filtros por tipo/severidad/estado

### Fase 4: WebSocket en Tiempo Real
- [ ] Conectar a WebSocket server
- [ ] Escuchar evento `incident:created`
- [ ] Escuchar evento `incident:updated`
- [ ] Actualizar mapa en tiempo real
- [ ] Mostrar notificaciones push

### Fase 5: Reporte de Incidentes
- [ ] Formulario de reporte
- [ ] Autocompletado de direcciones
- [ ] Selector de ubicación en mapa (drag marker)
- [ ] Validación de formulario
- [ ] Subida de fotos (próxima fase)

### Fase 6: Tracking de Entidades
- [ ] Implementar `location:update` desde app móvil
- [ ] Mostrar ubicación de entidades en mapa
- [ ] Actualizar en tiempo real
- [ ] Calcular ETA (tiempo de llegada estimado)

### Fase 7: Panel de Administración
- [ ] Dashboard con estadísticas
- [ ] Tabla de incidentes con filtros
- [ ] Gestión de usuarios
- [ ] Cambiar estados de incidentes
- [ ] Marcar reportes falsos

### Fase 8: Optimizaciones
- [ ] Clustering de marcadores (muchos incidentes)
- [ ] Lazy loading de datos
- [ ] Cache de API requests
- [ ] Service Worker para offline
- [ ] Push notifications (FCM)

---

## 📞 Contacto y Soporte

**Backend Developer:** Tu nombre/equipo  
**Documentación Adicional:**
- `WEBSOCKET_API_DOCS.md` - Detalles completos de WebSocket
- `WEBSOCKET_IMPLEMENTATION.md` - Guía de implementación técnica
- `LAZARUS_API_DOCS.md` - Documentación REST API

**Notas Importantes:**
1. El backend está en modo desarrollo (auto-sync de DB activado)
2. Para producción, configurar variables de entorno correctamente
3. SSL/TLS requerido para WebSockets en producción (wss://)
4. Considerar Redis para escalar WebSockets horizontalmente

---

## 🔧 Variables de Entorno Requeridas

```env
# Backend (.env)
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=tu_password
DB_DATABASE=lazarus_db
JWT_SECRET=tu_jwt_secret_super_seguro
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=production

# Frontend (.env)
REACT_APP_API_URL=http://localhost:3000
REACT_APP_WS_URL=ws://localhost:3000
REACT_APP_GOOGLE_MAPS_KEY=tu_google_maps_api_key
```

---

## 🎯 Prioridades de Desarrollo

### Alta Prioridad ⚡
1. Autenticación JWT
2. Mapa con marcadores de incidentes
3. WebSocket para tiempo real
4. Formulario de reporte

### Media Prioridad 🔸
5. Dashboard de estadísticas
6. Filtros y búsqueda
7. Notificaciones push
8. Tracking de entidades

### Baja Prioridad 🔹
9. Chat entre usuarios y entidades
10. Historial de reportes
11. Exportación de datos
12. Modo offline

---

**¡Éxito con el desarrollo del frontend! 🚀**
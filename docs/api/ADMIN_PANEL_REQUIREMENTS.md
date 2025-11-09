# 🔐 Panel de Administrador - Requisitos Frontend

Documentación completa de todos los endpoints y funcionalidades que el panel de administrador debe implementar en Lazarus.

---

## 📋 Tabla de Contenidos

1. [Autenticación](#autenticación)
2. [Gestión de Usuarios](#gestión-de-usuarios)
3. [Gestión de Incidentes](#gestión-de-incidentes)
4. [Gestión de Notificaciones](#gestión-de-notificaciones)
5. [Estadísticas y Reportes](#estadísticas-y-reportes)
6. [Perfil del Administrador](#perfil-del-administrador)

---

## 🔑 Autenticación

### Login de Administrador

**Endpoint:** `POST /auth/login`

```json
{
  "email": "admin@lazarus.com",
  "contraseña": "Admin123456"
}
```

**Respuesta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": 1,
    "userType": "ADMIN",
    "email": "admin@lazarus.com",
    "nombre": "Carlos",
    "apellidos": "Rodríguez"
  }
}
```

**Guardar el token:**
```javascript
localStorage.setItem('authToken', response.access_token);
localStorage.setItem('userType', response.user.userType);
```

---

## 👥 Gestión de Usuarios

El administrador tiene **control total** sobre todos los usuarios del sistema.

### 1. Ver Todos los Usuarios

**GET** `/users`

Lista combinada de ciudadanos, entidades públicas y administradores.

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta:**
```json
[
  {
    "id_ciudadano": 1,
    "userType": "CIUDADANO",
    "nombre": "Juan",
    "apellidos": "Pérez",
    "email": "juan@example.com",
    "cedula": "1-2345-6789",
    "strikes": 2,
    "activo": true,
    "provincia": "San José",
    "fecha_creacion": "2025-01-15T10:00:00.000Z"
  },
  {
    "id_entidad": 1,
    "userType": "ENTIDAD",
    "nombre_entidad": "Bomberos Central",
    "tipo_entidad": "BOMBEROS",
    "email": "bomberos@go.cr",
    "activo": true,
    "provincia": "San José"
  },
  {
    "id_admin": 2,
    "userType": "ADMIN",
    "nombre": "María",
    "apellidos": "González",
    "email": "maria@lazarus.com",
    "nivel_acceso": "ADMIN",
    "activo": true
  }
]
```

**Funcionalidad Frontend:**
- Tabla con todos los usuarios
- Filtros por tipo (CIUDADANO, ENTIDAD, ADMIN)
- Búsqueda por nombre/email
- Indicadores visuales de estado (activo/inactivo)
- Mostrar strikes de ciudadanos con alertas si >= 2

---

### 2. Ver Usuarios por Tipo

#### Ciudadanos

**GET** `/users/ciudadanos`

```json
[
  {
    "id_ciudadano": 1,
    "nombre": "Juan",
    "apellidos": "Pérez López",
    "email": "juan@example.com",
    "cedula": "1-2345-6789",
    "telefono": "+506 8888-8888",
    "strikes": 2,
    "activo": true,
    "provincia": "San José",
    "canton": "Central",
    "distrito": "Carmen",
    "direccion": "Calle 1, Avenida 2",
    "fecha_creacion": "2025-01-15T10:00:00.000Z"
  }
]
```

#### Entidades Públicas

**GET** `/users/entidades`

```json
[
  {
    "id_entidad": 1,
    "nombre_entidad": "Bomberos Central",
    "tipo_entidad": "BOMBEROS",
    "email": "bomberos@go.cr",
    "telefono_emergencia": "911",
    "provincia": "San José",
    "ubicacion": "Estación Central, Calle 10",
    "activo": true,
    "fecha_creacion": "2025-01-10T08:00:00.000Z"
  }
]
```

**Tipos de entidad disponibles:**
- `BOMBEROS`
- `POLICIA`
- `CRUZ_ROJA`
- `TRANSITO`
- `AMBULANCIA`
- `MUNICIPALIDAD`
- `OTROS`

#### Administradores

**GET** `/users/administradores`

```json
[
  {
    "id_admin": 1,
    "nombre": "Carlos",
    "apellidos": "Rodríguez Mora",
    "email": "admin@lazarus.com",
    "nivel_acceso": "ADMIN",
    "provincia": "San José",
    "activo": true,
    "fecha_creacion": "2025-01-01T00:00:00.000Z"
  }
]
```

**Niveles de acceso:**
- `SUPER_ADMIN` - Acceso total
- `ADMIN` - Acceso completo
- `MODERADOR` - Acceso limitado

---

### 3. Ver Detalle de Usuario Específico

**GET** `/users/:userType/:id`

**Ejemplos:**
- `/users/CIUDADANO/1`
- `/users/ENTIDAD/2`
- `/users/ADMIN/3`

**Respuesta (Ciudadano):**
```json
{
  "id_ciudadano": 1,
  "userType": "CIUDADANO",
  "nombre": "Juan",
  "apellidos": "Pérez López",
  "email": "juan@example.com",
  "cedula": "1-2345-6789",
  "telefono": "+506 8888-8888",
  "strikes": 2,
  "activo": true,
  "provincia": "San José",
  "canton": "Central",
  "distrito": "Carmen",
  "direccion": "Calle 1, Avenida 2",
  "fecha_creacion": "2025-01-15T10:00:00.000Z",
  "fecha_actualizacion": "2025-01-20T15:30:00.000Z"
}
```

**Funcionalidad Frontend:**
- Modal o página de detalle
- Mostrar toda la información del usuario
- Botones de acción (habilitar/deshabilitar, incrementar strikes)
- Historial de incidentes (si es ciudadano)

---

### 4. Habilitar/Deshabilitar Usuario

**PATCH** `/users/:userType/:id/toggle-status`

**Ejemplos:**
- `PATCH /users/CIUDADANO/1/toggle-status`
- `PATCH /users/ENTIDAD/2/toggle-status`

**Sin body** - Solo cambia el estado actual

**Respuesta:**
```json
{
  "message": "Estado del usuario actualizado"
}
```

**Funcionalidad Frontend:**
- Botón toggle o switch
- Confirmación antes de cambiar estado
- Actualizar UI inmediatamente
- Mostrar notificación de éxito

**Casos de uso:**
- Deshabilitar ciudadano con mal comportamiento
- Suspender entidad temporalmente
- Bloquear acceso de administrador

---

### 5. Incrementar Strikes a Ciudadano

**PATCH** `/users/ciudadano/:id/strike`

**Ejemplo:** `PATCH /users/ciudadano/1/strike`

**Sin body** - Incrementa automáticamente

**Respuesta:**
```json
{
  "id_ciudadano": 1,
  "nombre": "Juan",
  "apellidos": "Pérez",
  "email": "juan@example.com",
  "strikes": 3,
  "activo": false
}
```

**Lógica automática:**
- ✅ Strike 1: Solo advertencia
- ⚠️ Strike 2: Última advertencia
- 🚫 Strike 3: Cuenta deshabilitada automáticamente

**Funcionalidad Frontend:**
- Botón "Incrementar Strike" con confirmación
- Mostrar advertencia si es el strike 3
- Sistema envía email automáticamente al ciudadano
- Actualizar contador de strikes en la UI
- Si llega a 3, mostrar que la cuenta fue deshabilitada

---

### 6. Crear Nuevos Usuarios

#### Crear Ciudadano

**POST** `/auth/register`

```json
{
  "nombre": "Pedro",
  "apellidos": "Ramírez Castro",
  "cedula": "1-0987-6543",
  "email": "pedro@example.com",
  "contraseña": "Pedro123456",
  "telefono": "+506 8888-7777",
  "provincia": "Alajuela",
  "canton": "Central",
  "distrito": "Alajuela",
  "direccion": "Del parque 200m norte"
}
```

#### Crear Entidad Pública

**POST** `/auth/register-entidad`

```json
{
  "nombre_entidad": "Cruz Roja San José",
  "tipo_entidad": "CRUZ_ROJA",
  "email": "cruzroja@sj.cr",
  "contraseña": "CruzRoja123!",
  "telefono_emergencia": "911",
  "provincia": "San José",
  "canton": "Central",
  "distrito": "Carmen",
  "ubicacion": "Av. 14, Calle Central"
}
```

#### Crear Administrador

**POST** `/auth/register-admin`

```json
{
  "nombre": "Ana",
  "apellidos": "Fernández Mora",
  "email": "ana.admin@lazarus.com",
  "contraseña": "Admin123456",
  "nivel_acceso": "ADMIN",
  "provincia": "San José",
  "canton": "Central",
  "distrito": "Carmen"
}
```

**Funcionalidad Frontend:**
- Formularios específicos para cada tipo de usuario
- Validación de campos requeridos
- Verificación de email único (usar `/auth/check-email`)
- Contraseña mínimo 8 caracteres
- Confirmación de creación exitosa

---

## 🚨 Gestión de Incidentes

El administrador puede **ver, editar y eliminar** cualquier incidente.

### 1. Ver Todos los Incidentes

**GET** `/incidents`

**Query params opcionales:**
- `tipo`: INCENDIO, ROBO, ACCIDENTE, etc.
- `severidad`: BAJA, MEDIA, ALTA, CRITICA
- `estado`: PENDIENTE, EN_PROCESO, RESUELTO, CANCELADO
- `ciudadanoId`: ID del ciudadano (filtrar por usuario)

**Ejemplo:**
```
GET /incidents?estado=PENDIENTE&severidad=ALTA
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "tipo": "INCENDIO",
    "descripcion": "Incendio en edificio comercial",
    "severidad": "ALTA",
    "estado": "EN_PROCESO",
    "latitud": 9.9281,
    "longitud": -84.0907,
    "direccion": "Centro de San José",
    "fecha_creacion": "2025-01-20T14:30:00.000Z",
    "ciudadano": {
      "id_ciudadano": 1,
      "nombre": "Juan",
      "apellidos": "Pérez",
      "email": "juan@example.com"
    }
  }
]
```

**Funcionalidad Frontend:**
- Tabla con todos los incidentes
- Filtros por tipo, severidad, estado
- Búsqueda por descripción
- Mapa mostrando ubicación de incidentes
- Indicadores visuales por severidad (colores)
- Ordenar por fecha (más recientes primero)

---

### 2. Ver Detalle de Incidente

**GET** `/incidents/:id`

```json
{
  "id": 1,
  "tipo": "INCENDIO",
  "descripcion": "Incendio en edificio comercial, planta 3",
  "severidad": "ALTA",
  "estado": "EN_PROCESO",
  "latitud": 9.9281,
  "longitud": -84.0907,
  "direccion": "Centro de San José, Calle 5, Avenida 2",
  "fecha_creacion": "2025-01-20T14:30:00.000Z",
  "fecha_actualizacion": "2025-01-20T15:00:00.000Z",
  "ciudadano": {
    "id_ciudadano": 1,
    "nombre": "Juan",
    "apellidos": "Pérez López",
    "email": "juan@example.com",
    "telefono": "+506 8888-8888"
  }
}
```

---

### 3. Actualizar Incidente (Cambiar Estado)

**PATCH** `/incidents/:id`

El admin puede cambiar **cualquier campo** del incidente.

**Body (cambiar estado):**
```json
{
  "estado": "RESUELTO"
}
```

**Estados disponibles:**
- `PENDIENTE` - Recién creado
- `EN_PROCESO` - Entidad lo está atendiendo
- `RESUELTO` - Completado exitosamente
- `CANCELADO` - Falso o spam (incrementa strikes automáticamente)

**⚠️ IMPORTANTE:** Si se marca como `CANCELADO`:
- Se incrementa automáticamente 1 strike al ciudadano
- Se envía email de advertencia al ciudadano
- Si llega a 3 strikes, la cuenta se deshabilita automáticamente

**Body (cambiar descripción y severidad):**
```json
{
  "descripcion": "Incendio controlado en edificio comercial",
  "severidad": "MEDIA"
}
```

**Funcionalidad Frontend:**
- Dropdown o select para cambiar estado
- Editor para modificar descripción
- Selector de severidad
- Confirmación especial si se marca como CANCELADO
- Mostrar advertencia: "Esto incrementará strikes del usuario"

---

### 4. Eliminar Incidente

**DELETE** `/incidents/:id`

**Respuesta:** `204 No Content`

**Funcionalidad Frontend:**
- Botón "Eliminar" con confirmación
- Modal: "¿Estás seguro? Esta acción no se puede deshacer"
- Remover de la lista después de eliminar

---

### 5. Ver Estadísticas de Incidentes

**GET** `/incidents/statistics`

```json
{
  "total": 150,
  "byStatus": {
    "PENDIENTE": 20,
    "EN_PROCESO": 45,
    "RESUELTO": 80,
    "CANCELADO": 5
  },
  "bySeverity": {
    "BAJA": 40,
    "MEDIA": 60,
    "ALTA": 35,
    "CRITICA": 15
  },
  "byType": {
    "INCENDIO": 25,
    "ROBO": 30,
    "ACCIDENTE": 45,
    "INUNDACION": 20,
    "OTROS": 30
  }
}
```

**Funcionalidad Frontend:**
- Dashboard con gráficos (pie charts, bar charts)
- Tarjetas con métricas clave
- Indicadores de tendencias

---

## 📢 Gestión de Notificaciones

### 1. Ver Todas las Notificaciones

**GET** `/notifications`

```json
[
  {
    "id": 1,
    "titulo": "Mantenimiento programado",
    "mensaje": "El sistema estará en mantenimiento el sábado",
    "tipo_usuario": "TODOS",
    "leido": false,
    "fecha_creacion": "2025-01-20T10:00:00.000Z"
  }
]
```

---

### 2. Crear Notificación

**POST** `/notifications`

```json
{
  "titulo": "Alerta de emergencia",
  "mensaje": "Se ha detectado actividad sísmica en la región",
  "tipo_usuario": "TODOS",
  "usuario_id": null
}
```

**Campos:**
- `titulo`: Título de la notificación
- `mensaje`: Contenido completo
- `tipo_usuario`: "CIUDADANO" | "ENTIDAD" | "ADMIN" | "TODOS"
- `usuario_id`: (opcional) ID específico del usuario, null para todos

**Funcionalidad Frontend:**
- Formulario para crear notificaciones
- Radio buttons para seleccionar tipo de destinatario
- Checkbox "Enviar a usuario específico" (muestra campo de ID)
- Vista previa antes de enviar

---

### 3. Eliminar Notificación

**DELETE** `/notifications/:id`

---

## 📊 Estadísticas y Reportes

### 1. Dashboard General

**GET** `/statistics/dashboard`

```json
{
  "totalUsuarios": 250,
  "totalIncidentes": 150,
  "incidentesActivos": 65,
  "incidentesResueltos": 80,
  "ciudadanosConStrikes": 15,
  "entidadesActivas": 10
}
```

**Funcionalidad Frontend:**
- Tarjetas con métricas principales
- Gráficos de líneas para tendencias
- Indicadores de crecimiento/decrecimiento

---

### 2. Estadísticas de Usuarios por Tipo

**GET** `/statistics/users/type`

```json
{
  "ciudadanos": 200,
  "entidades": 25,
  "administradores": 5
}
```

---

### 3. Incidentes Recientes

**GET** `/statistics/incidents/recent?limit=10`

```json
[
  {
    "id": 1,
    "tipo": "INCENDIO",
    "severidad": "ALTA",
    "estado": "EN_PROCESO",
    "fecha_creacion": "2025-01-20T14:30:00.000Z"
  }
]
```

---

### 4. Tendencias de Incidentes

**GET** `/statistics/incidents/trends?days=30`

```json
{
  "labels": ["2025-01-01", "2025-01-02", "..."],
  "data": [5, 8, 3, 12, 6, "..."]
}
```

**Funcionalidad Frontend:**
- Gráfico de líneas mostrando incidentes por día
- Selector de rango de fechas

---

### 5. Incidentes por Ubicación

**GET** `/statistics/incidents/location`

```json
{
  "San José": 80,
  "Alajuela": 30,
  "Cartago": 20,
  "Heredia": 15,
  "Guanacaste": 5
}
```

**Funcionalidad Frontend:**
- Mapa de calor de Costa Rica
- Gráfico de barras por provincia

---

### 6. Actividad de Usuario Específico

**GET** `/statistics/users/:userId/activity?userType=CIUDADANO`

```json
{
  "userId": 1,
  "userType": "CIUDADANO",
  "totalIncidentes": 5,
  "incidentesActivos": 2,
  "incidentesResueltos": 3,
  "strikes": 0,
  "fechaRegistro": "2025-01-15T10:00:00.000Z"
}
```

---

## 👤 Perfil del Administrador

### 1. Ver Perfil Propio

**GET** `/auth/profile`

```json
{
  "id": 1,
  "nombre": "Carlos",
  "apellidos": "Rodríguez Mora",
  "email": "admin@lazarus.com",
  "nivel_acceso": "ADMIN",
  "provincia": "San José",
  "canton": "Central",
  "distrito": "Carmen",
  "userType": "administrador",
  "activo": true,
  "fecha_creacion": "2025-01-01T00:00:00.000Z",
  "fecha_actualizacion": "2025-01-10T12:00:00.000Z"
}
```

---

### 2. Actualizar Perfil Propio

**PATCH** `/auth/profile`

```json
{
  "nombre": "Carlos Eduardo",
  "apellidos": "Rodríguez Mora",
  "provincia": "Alajuela",
  "canton": "Central",
  "distrito": "Alajuela"
}
```

**Campos permitidos para admin:**
- `nombre`
- `apellidos`
- `provincia`
- `canton`
- `distrito`

**Campos protegidos (NO se pueden cambiar):**
- ❌ `email`
- ❌ `nivel_acceso` (solo SUPER_ADMIN puede cambiar)
- ❌ `activo`

---

### 3. Recuperación de Contraseña

**POST** `/auth/forgot-password`

```json
{
  "email": "admin@lazarus.com"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Se han enviado las instrucciones para restablecer la contraseña al correo admin@lazarus.com"
}
```

**POST** `/auth/reset-password`

```json
{
  "token": "abc123xyz456...",
  "newPassword": "NuevaContraseña123"
}
```

---

## 🎨 Componentes de UI Recomendados

### Dashboard Principal
```
┌─────────────────────────────────────┐
│  Dashboard de Administrador         │
├─────────────────────────────────────┤
│  ┌────────┐ ┌────────┐ ┌────────┐ │
│  │ 250    │ │ 150    │ │ 65     │ │
│  │Usuarios│ │Inciden.│ │Activos │ │
│  └────────┘ └────────┘ └────────┘ │
│                                     │
│  Gráfico de Incidentes (línea)     │
│  ┌─────────────────────────────┐  │
│  │                             │  │
│  └─────────────────────────────┘  │
│                                     │
│  Mapa de Calor de Incidentes       │
└─────────────────────────────────────┘
```

### Gestión de Usuarios
```
┌─────────────────────────────────────┐
│  Usuarios  [+ Crear]  [Filtros ▼]  │
├─────────────────────────────────────┤
│ Nombre    Email          Strikes  │
│ ───────────────────────────────── │
│ Juan P.   juan@...  ⚠️ 2   [🔧]  │
│ María G.  maria@... ✅ 0   [🔧]  │
│ Pedro R.  pedro@... 🚫 3   [🔧]  │
└─────────────────────────────────────┘
```

### Detalle de Incidente
```
┌─────────────────────────────────────┐
│  Incidente #123                     │
├─────────────────────────────────────┤
│  Tipo: 🔥 INCENDIO                 │
│  Severidad: 🔴 ALTA                │
│  Estado: [Dropdown ▼]               │
│                                     │
│  Descripción:                       │
│  Incendio en edificio...           │
│                                     │
│  📍 Mapa                           │
│  [Mapa interactivo]                 │
│                                     │
│  👤 Reportado por:                 │
│  Juan Pérez (juan@...)             │
│                                     │
│  [Editar] [Marcar CANCELADO]       │
│           [Eliminar]                │
└─────────────────────────────────────┘
```

---

## 🔄 Flujo de Trabajo del Administrador

### 1. Login
```
Login → Token JWT → Guardar en localStorage → Dashboard
```

### 2. Gestionar Incidentes Falsos
```
Ver Incidentes → Filtrar por tipo → Detalle incidente → 
Marcar CANCELADO → Confirmar (advertencia strikes) → 
Sistema incrementa strikes automáticamente → 
Email enviado al ciudadano → 
Si 3 strikes: cuenta deshabilitada automáticamente
```

### 3. Gestionar Usuarios Problemáticos
```
Ver Usuarios → Filtrar con strikes >= 2 → 
Ver detalle → Revisar historial → 
[Opción A] Incrementar strike manualmente → 
[Opción B] Deshabilitar cuenta directamente
```

### 4. Crear Nueva Entidad
```
Usuarios → [+ Crear] → Seleccionar "Entidad Pública" → 
Llenar formulario → Validar email único → 
Crear → Email de bienvenida enviado automáticamente
```

---

## 🚀 Notas de Implementación

### Headers Requeridos en Todas las Peticiones
```javascript
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
  'Content-Type': 'application/json'
};
```

### Manejo de Errores Comunes
```javascript
- 401 Unauthorized → Redirigir a login
- 403 Forbidden → Mostrar "No tienes permisos"
- 404 Not Found → Mostrar "Recurso no encontrado"
- 500 Server Error → Mostrar "Error del servidor"
```

### WebSockets (Actualizaciones en Tiempo Real)
```javascript
// Conectar a WebSocket
const socket = io('http://localhost:3000', {
  auth: { token: localStorage.getItem('authToken') }
});

// Escuchar nuevos incidentes
socket.on('incident-created', (data) => {
  // Actualizar lista de incidentes
});

// Escuchar actualizaciones de incidentes
socket.on('incident-updated', (data) => {
  // Actualizar incidente específico
});
```

### Validaciones Frontend
```javascript
- Email único: Verificar con POST /auth/check-email antes de crear
- Contraseña: Mínimo 8 caracteres
- Confirmación destructiva: Modal antes de eliminar o deshabilitar
- Strikes: Advertencia especial al marcar incidente como CANCELADO
```

---

## 📦 Resumen de Permisos del Admin

| Funcionalidad | Permiso |
|--------------|---------|
| ✅ Ver todos los usuarios | Completo |
| ✅ Crear usuarios (cualquier tipo) | Completo |
| ✅ Habilitar/Deshabilitar usuarios | Completo |
| ✅ Incrementar strikes | Completo |
| ✅ Ver todos los incidentes | Completo |
| ✅ Editar cualquier incidente | Completo |
| ✅ Eliminar incidentes | Completo |
| ✅ Crear notificaciones | Completo |
| ✅ Ver estadísticas completas | Completo |
| ✅ Gestionar su propio perfil | Completo |

**El administrador tiene control total sobre el sistema Lazarus.**

---

## 🎯 Checklist de Implementación

### Autenticación
- [ ] Pantalla de login
- [ ] Guardar token JWT
- [ ] Interceptor para agregar token en peticiones
- [ ] Manejo de token expirado
- [ ] Logout (limpiar localStorage)

### Dashboard
- [ ] Tarjetas con métricas principales
- [ ] Gráfico de incidentes por fecha
- [ ] Mapa de calor de incidentes
- [ ] Lista de incidentes recientes
- [ ] Ciudadanos con advertencia de strikes

### Gestión de Usuarios
- [ ] Tabla con todos los usuarios
- [ ] Filtros por tipo de usuario
- [ ] Búsqueda por nombre/email
- [ ] Modal de detalle de usuario
- [ ] Formulario crear ciudadano
- [ ] Formulario crear entidad
- [ ] Formulario crear administrador
- [ ] Botón habilitar/deshabilitar
- [ ] Botón incrementar strikes
- [ ] Indicadores visuales de strikes

### Gestión de Incidentes
- [ ] Tabla con todos los incidentes
- [ ] Filtros por tipo/severidad/estado
- [ ] Mapa mostrando ubicaciones
- [ ] Modal de detalle de incidente
- [ ] Editor de incidente
- [ ] Dropdown cambiar estado
- [ ] Confirmación para marcar CANCELADO
- [ ] Botón eliminar con confirmación

### Notificaciones
- [ ] Lista de notificaciones
- [ ] Formulario crear notificación
- [ ] Selector de destinatarios
- [ ] Eliminar notificación

### Estadísticas
- [ ] Dashboard con gráficos
- [ ] Estadísticas de usuarios
- [ ] Tendencias de incidentes
- [ ] Mapa de calor geográfico

### Perfil
- [ ] Ver perfil propio
- [ ] Editar perfil
- [ ] Cambiar contraseña

---

## 📞 Soporte

Para más información sobre la implementación del backend, consultar:
- `API_ENDPOINTS.md` - Lista completa de endpoints
- `FRONTEND_INTEGRATION_GUIDE.md` - Guía de integración
- `PROFILE_API_DOCS.md` - Documentación de perfil de usuario
- `DOCUMENTACION_PASSWORD_RESET.md` - Sistema de recuperación de contraseña

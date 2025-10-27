# 🔐 Sistema de Roles y Permisos - Lazarus Backend

## 📋 Resumen del Sistema de Roles

El sistema Lazarus implementa **3 roles principales** con permisos específicos para cada uno:

### 1. 👤 CIUDADANO
**Propósito:** Usuario regular que reporta incidentes y monitorea el sistema.

**Permisos:**
- ✅ Registrarse en el sistema (automáticamente reciben rol CIUDADANO)
- ✅ Crear incidentes de emergencia
- ✅ Ver todos los incidentes (públicos)
- ✅ Ver incidentes cercanos a su ubicación
- ✅ Editar **solo** sus propios incidentes (descripción y severidad)
- ✅ Eliminar sus propios incidentes
- ✅ Ver su propio perfil
- ✅ Actualizar su propio perfil (nombre, email, contraseña)
- ✅ Ver sus propias notificaciones
- ✅ Marcar notificaciones como leídas
- ✅ Ver sus propias estadísticas de actividad
- ✅ Recibir notificaciones en tiempo real vía WebSocket

**Restricciones:**
- ❌ No puede cambiar el **estado** de incidentes (NUEVO → REVISION → ATENDIDO)
- ❌ No puede ver perfiles de otros usuarios
- ❌ No puede editar/eliminar incidentes de otros
- ❌ No puede acceder a estadísticas generales del sistema
- ❌ No puede crear otros usuarios
- ❌ No puede incrementar strikes

---

### 2. 🚨 ENTIDAD PUBLICA
**Propósito:** Entidad de respuesta (Bomberos, Policía, Cruz Roja, etc.) que gestiona y atiende incidentes.

**Permisos:**
- ✅ Ver todos los incidentes
- ✅ Ver incidentes cercanos
- ✅ **Cambiar el estado de cualquier incidente** (NUEVO → REVISION → ATENDIDO → FALSO)
- ✅ Ver lista completa de usuarios
- ✅ Ver perfil de cualquier usuario
- ✅ Ver su propio perfil y actualizarlo
- ✅ Ver estadísticas del sistema (dashboard, tendencias, gráficas)
- ✅ Ver incidentes recientes
- ✅ Ver incidentes por ubicación
- ✅ **Incrementar strikes** a usuarios cuando marcan reportes como FALSO
- ✅ Crear notificaciones para usuarios
- ✅ Ver sus propias notificaciones
- ✅ Enviar notificaciones de cambio de estado
- ✅ Recibir alertas de nuevos incidentes en tiempo real

**Restricciones:**
- ❌ No puede editar campos de incidentes (solo cambiar estado)
- ❌ No puede crear nuevos usuarios
- ❌ No puede eliminar usuarios
- ❌ No puede eliminar incidentes
- ❌ No puede cambiar roles de usuarios
- ❌ No puede ver estadísticas de usuarios por rol

---

### 3. 👨‍💼 ADMIN (Administrador)
**Propósito:** Administrador del sistema con acceso total para gestionar usuarios, incidentes y configuraciones.

**Permisos:**
- ✅ **Acceso total a todos los endpoints**
- ✅ Crear usuarios (incluido crear cuentas de ENTIDAD)
- ✅ Ver lista completa de usuarios
- ✅ Ver perfil de cualquier usuario
- ✅ Actualizar cualquier usuario (cambiar rol, estado, etc.)
- ✅ Eliminar usuarios
- ✅ Crear incidentes
- ✅ Ver todos los incidentes
- ✅ Editar cualquier incidente (todos los campos)
- ✅ Cambiar estado de incidentes
- ✅ Eliminar cualquier incidente
- ✅ Incrementar strikes
- ✅ Ver todas las notificaciones del sistema
- ✅ Crear notificaciones para cualquier usuario
- ✅ Enviar mensajes del sistema (broadcast)
- ✅ Ver todas las estadísticas (usuarios, incidentes, tendencias)
- ✅ Ver estadísticas de cualquier usuario

**Sin restricciones:** Control total del sistema.

---

## 🛣️ Matriz de Permisos por Endpoint

### 👤 Usuarios (`/api/users`)

| Endpoint | CIUDADANO | ENTIDAD | ADMIN | Notas |
|----------|-----------|---------|-------|-------|
| `POST /users` | ❌ | ❌ | ✅ | Solo admin crea usuarios (ENTIDAD) |
| `GET /users` | ❌ | ✅ | ✅ | Lista de usuarios |
| `GET /users/:id` | ✅* | ✅ | ✅ | *Solo su propio perfil |
| `PATCH /users/:id` | ✅* | ✅* | ✅ | *Solo su propio perfil (sin cambiar rol/estado) |
| `DELETE /users/:id` | ❌ | ❌ | ✅ | Solo admin elimina |
| `PATCH /users/:id/strike` | ❌ | ✅ | ✅ | Incrementar strikes |

---

### 🚨 Incidentes (`/api/incidents`)

| Endpoint | CIUDADANO | ENTIDAD | ADMIN | Notas |
|----------|-----------|---------|-------|-------|
| `POST /incidents` | ✅ | ❌ | ✅ | Ciudadanos reportan incidentes |
| `GET /incidents` | ✅ | ✅ | ✅ | Ver todos (con filtros) |
| `GET /incidents/statistics` | ❌ | ✅ | ✅ | Estadísticas agregadas |
| `GET /incidents/nearby` | ✅ | ✅ | ✅ | Incidentes cercanos |
| `GET /incidents/:id` | ✅ | ✅ | ✅ | Ver detalle |
| `PATCH /incidents/:id` | ✅* | ✅** | ✅ | *Solo sus incidentes (desc/sev), **Solo estado |
| `DELETE /incidents/:id` | ✅* | ❌ | ✅ | *Solo sus propios incidentes |

---

### 🔔 Notificaciones (`/api/notifications`)

| Endpoint | CIUDADANO | ENTIDAD | ADMIN | Notas |
|----------|-----------|---------|-------|-------|
| `POST /notifications` | ❌ | ✅ | ✅ | Crear notificaciones |
| `GET /notifications` | ❌ | ❌ | ✅ | Ver todas |
| `GET /notifications/user/:userId` | ✅* | ✅* | ✅ | *Solo propias |
| `GET /notifications/user/:userId/unread` | ✅* | ✅* | ✅ | *Solo propias |
| `GET /notifications/:id` | ✅ | ✅ | ✅ | Ver una |
| `PATCH /notifications/:id/read` | ✅ | ✅ | ✅ | Marcar como leída |
| `PATCH /notifications/user/:userId/read-all` | ✅* | ✅* | ✅ | *Solo propias |
| `DELETE /notifications/:id` | ✅ | ✅ | ✅ | Eliminar |
| `POST /notifications/incident-status` | ❌ | ✅ | ✅ | Notificar cambio estado |
| `POST /notifications/incident-nearby` | ❌ | ✅ | ✅ | Notificar cercano |
| `POST /notifications/system-message` | ❌ | ❌ | ✅ | Mensaje del sistema |

---

### 📊 Estadísticas (`/api/statistics`)

| Endpoint | CIUDADANO | ENTIDAD | ADMIN | Notas |
|----------|-----------|---------|-------|-------|
| `GET /statistics/dashboard` | ❌ | ✅ | ✅ | Dashboard general |
| `GET /statistics/incidents/status` | ❌ | ✅ | ✅ | Por estado |
| `GET /statistics/incidents/severity` | ❌ | ✅ | ✅ | Por severidad |
| `GET /statistics/incidents/type` | ❌ | ✅ | ✅ | Por tipo |
| `GET /statistics/users/role` | ❌ | ❌ | ✅ | Por rol (solo admin) |
| `GET /statistics/incidents/recent` | ❌ | ✅ | ✅ | Recientes |
| `GET /statistics/incidents/trends` | ❌ | ✅ | ✅ | Tendencias |
| `GET /statistics/incidents/location` | ❌ | ✅ | ✅ | Por ubicación |
| `GET /statistics/users/:userId/activity` | ✅* | ✅ | ✅ | *Solo propias |

---

### 🔐 Autenticación (`/api/auth`)

| Endpoint | CIUDADANO | ENTIDAD | ADMIN | Notas |
|----------|-----------|---------|-------|-------|
| `POST /auth/register` | 🌐 Público | 🌐 Público | 🌐 Público | Auto-asigna rol CIUDADANO |
| `POST /auth/login` | 🌐 Público | 🌐 Público | 🌐 Público | Todos pueden iniciar sesión |

---

## 🔄 Flujos de Trabajo por Rol

### 📱 Flujo de CIUDADANO

```
1. Registro → Rol CIUDADANO automático
2. Login → Recibe JWT token
3. Ve mapa con incidentes cercanos
4. Reporta incidente:
   POST /api/incidents
   {
     "tipo": "MEDICA",
     "severidad": "ALTA",
     "descripcion": "Accidente de tráfico",
     "latitud": 9.9281,
     "longitud": -84.0907,
     "direccion": "Av. Central, San José"
   }
5. ✅ WebSocket: Todos reciben el nuevo incidente en tiempo real
6. Ciudadano puede:
   - Ver estado de su incidente
   - Recibir notificaciones cuando cambia el estado
   - Ver incidentes cercanos mientras se mueve
   - Editar su incidente (solo desc/severidad)
```

---

### 🚒 Flujo de ENTIDAD PUBLICA

```
1. Admin crea cuenta de ENTIDAD:
   POST /api/users
   {
     "nombre": "Bomberos San José",
     "email": "bomberos@sanjose.go.cr",
     "contraseña": "SecurePass123!",
     "rol": "ENTIDAD"
   }
2. ENTIDAD inicia sesión
3. Ve dashboard con estadísticas:
   GET /api/statistics/dashboard
4. Ve lista de incidentes nuevos:
   GET /api/incidents?estado=NUEVO
5. Selecciona incidente para atender:
   PATCH /api/incidents/42
   {
     "estado": "REVISION"
   }
6. ✅ WebSocket: Ciudadano recibe notificación "Tu incidente está siendo atendido"
7. ENTIDAD emite su ubicación en tiempo real:
   socket.emit('location:update', { userId: 5, latitude: 9.93, longitude: -84.09 })
8. ✅ Ciudadano ve en el mapa la ubicación de la entidad acercándose
9. Al terminar:
   PATCH /api/incidents/42
   {
     "estado": "ATENDIDO"
   }
10. Si el reporte era falso:
    PATCH /api/incidents/42 { "estado": "FALSO" }
    PATCH /api/users/10/strike
    → Usuario recibe strike (3 strikes = cuenta DESHABILITADA)
```

---

### 👨‍💼 Flujo de ADMINISTRADOR

```
1. Login como ADMIN
2. Gestión de usuarios:
   - Ver todos: GET /api/users
   - Crear ENTIDAD: POST /api/users con rol=ENTIDAD
   - Deshabilitar usuario problemático:
     PATCH /api/users/15 { "estado": "DESHABILITADO" }
3. Gestión de incidentes:
   - Ver estadísticas: GET /api/statistics/dashboard
   - Editar cualquier incidente: PATCH /api/incidents/:id
   - Eliminar reportes spam: DELETE /api/incidents/:id
4. Enviar mensajes del sistema:
   POST /api/notifications/system-message
   {
     "userId": 10,
     "message": "Tu cuenta será revisada por actividad sospechosa"
   }
5. Ver estadísticas de usuarios:
   GET /api/statistics/users/role
   GET /api/statistics/users/42/activity
```

---

## 🛡️ Implementación de Seguridad

### Guards Aplicados

```typescript
// Todos los controladores (excepto /auth) requieren:
@UseGuards(JwtAuthGuard, RolesGuard)

// JwtAuthGuard: Verifica que el usuario tenga un token válido
// RolesGuard: Verifica que el usuario tenga el rol requerido
```

### Decoradores Utilizados

```typescript
// En cada endpoint:
@Roles(UserRole.ADMIN, UserRole.ENTIDAD)  // Lista de roles permitidos
@GetUser('id')  // Obtener ID del usuario autenticado
@GetUser('rol')  // Obtener rol del usuario autenticado
@GetUser()  // Obtener objeto completo del usuario
```

### Ejemplo de Endpoint Protegido

```typescript
@Patch(':id')
@Roles(UserRole.CIUDADANO, UserRole.ENTIDAD, UserRole.ADMIN)
async update(
  @Param('id', ParseIntPipe) id: number,
  @Body(ValidationPipe) updateIncidentDto: UpdateIncidentDto,
  @GetUser('id') userId: number,
  @GetUser('rol') userRole: UserRole,
): Promise<Incident> {
  return this.incidentsService.update(id, updateIncidentDto, userId, userRole);
}
```

---

## 🔑 Sistema de JWT

### Payload del Token

```typescript
{
  email: "juan@ejemplo.com",
  sub: 1,  // User ID
  rol: "CIUDADANO",
  iat: 1635724800,  // Issued at
  exp: 1635811200   // Expiration
}
```

### Uso en el Frontend

```javascript
// Guardar token al login
localStorage.setItem('access_token', data.access_token);

// Incluir en cada request
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
  'Content-Type': 'application/json'
};
```

---

## ⚠️ Sistema de Strikes

### Lógica Automática

```typescript
1. ENTIDAD/ADMIN marca incidente como FALSO:
   PATCH /api/incidents/:id { estado: "FALSO" }

2. Backend automáticamente:
   PATCH /api/users/:userId/strike

3. Service incrementa strikes:
   strikes++
   
4. Si strikes >= 3:
   estado = DESHABILITADO

5. Usuario deshabilitado no puede hacer login:
   throw UnauthorizedException('Cuenta deshabilitada')
```

---

## 📱 Endpoints Públicos vs Protegidos

### 🌐 Públicos (Sin autenticación)

```
POST /api/auth/register
POST /api/auth/login
```

### 🔒 Protegidos (Requieren JWT)

**Todos los demás endpoints** requieren:
- Header: `Authorization: Bearer <token>`
- Token válido y no expirado
- Rol apropiado según el endpoint

---

## 🚀 Recomendaciones de Implementación Frontend

### 1. Guardar Información del Usuario

```javascript
// Al hacer login/register
const { access_token, user } = await authService.login(email, password);

localStorage.setItem('access_token', access_token);
localStorage.setItem('user', JSON.stringify(user));
```

### 2. Renderizado Condicional por Rol

```jsx
const user = JSON.parse(localStorage.getItem('user'));

{user.rol === 'CIUDADANO' && (
  <button onClick={handleReportIncident}>Reportar Incidente</button>
)}

{(user.rol === 'ENTIDAD' || user.rol === 'ADMIN') && (
  <button onClick={handleViewDashboard}>Ver Dashboard</button>
)}

{user.rol === 'ADMIN' && (
  <button onClick={handleCreateEntity}>Crear Entidad</button>
)}
```

### 3. Rutas Protegidas (React Router)

```jsx
<Route
  path="/admin"
  element={
    <ProtectedRoute requiredRole="ADMIN">
      <AdminPanel />
    </ProtectedRoute>
  }
/>

<Route
  path="/dashboard"
  element={
    <ProtectedRoute requiredRole={['ENTIDAD', 'ADMIN']}>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

### 4. Manejo de Errores 403 Forbidden

```javascript
try {
  await fetch('/api/incidents/42', {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ estado: 'ATENDIDO' })
  });
} catch (error) {
  if (error.status === 403) {
    alert('No tienes permisos para esta acción');
  }
}
```

---

## 📊 Resumen Visual

```
┌──────────────┬────────────────┬────────────────┬────────────────┐
│   Acción     │   CIUDADANO    │    ENTIDAD     │     ADMIN      │
├──────────────┼────────────────┼────────────────┼────────────────┤
│ Crear        │ ✅ Incidentes  │ ✅ Notifs      │ ✅ Todo        │
│ incidente    │                │                │                │
├──────────────┼────────────────┼────────────────┼────────────────┤
│ Cambiar      │ ❌             │ ✅             │ ✅             │
│ estado       │                │                │                │
├──────────────┼────────────────┼────────────────┼────────────────┤
│ Ver          │ ✅ Todos       │ ✅ Todos       │ ✅ Todos       │
│ incidentes   │                │                │                │
├──────────────┼────────────────┼────────────────┼────────────────┤
│ Ver          │ ❌             │ ✅             │ ✅             │
│ estadísticas │                │                │                │
├──────────────┼────────────────┼────────────────┼────────────────┤
│ Gestionar    │ ❌             │ ❌             │ ✅             │
│ usuarios     │                │                │                │
├──────────────┼────────────────┼────────────────┼────────────────┤
│ Incrementar  │ ❌             │ ✅             │ ✅             │
│ strikes      │                │                │                │
└──────────────┴────────────────┴────────────────┴────────────────┘
```

---

## ✅ Verificación de Implementación

Para verificar que el sistema de roles funciona:

```bash
# 1. Compilar
npm run build

# 2. Iniciar servidor
npm run start:dev

# 3. Probar endpoints
# Como CIUDADANO (sin permisos para stats):
curl -H "Authorization: Bearer <token_ciudadano>" \
  http://localhost:3000/api/statistics/dashboard
# Resultado esperado: 403 Forbidden

# Como ENTIDAD (con permisos):
curl -H "Authorization: Bearer <token_entidad>" \
  http://localhost:3000/api/statistics/dashboard
# Resultado esperado: 200 OK con datos
```

---

**Sistema implementado exitosamente con seguridad basada en roles! 🎉**
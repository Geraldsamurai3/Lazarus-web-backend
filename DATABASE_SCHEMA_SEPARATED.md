# 🗄️ Esquema de Base de Datos - Sistema de Tablas Separadas por Rol

## 📊 Resumen del Cambio

El sistema ahora utiliza **3 tablas separadas** para cada tipo de usuario, en lugar de una tabla única con roles. Esto permite tener campos específicos para cada tipo de usuario y mejor organización de datos.

---

## 🏗️ Estructura de Tablas

### 1. 👤 Tabla: `ciudadanos`

**Propósito:** Almacena usuarios regulares que reportan incidentes.

```sql
CREATE TABLE ciudadanos (
  id_ciudadano INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  apellidos VARCHAR(255) NOT NULL,
  cedula VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  contraseña VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  provincia VARCHAR(255) NOT NULL,
  canton VARCHAR(255) NOT NULL,
  distrito VARCHAR(255) NOT NULL,
  direccion TEXT,
  strikes INT DEFAULT 0,
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Campos Específicos:**
- `cedula`: Número de identificación único (requerido)
- `nombre` + `apellidos`: Nombre completo separado
- `direccion`: Dirección completa en texto
- `strikes`: Sistema de penalizaciones (0-3)
- `activo`: FALSE si tiene 3 strikes

**Índices:**
```sql
CREATE INDEX idx_ciudadanos_email ON ciudadanos(email);
CREATE INDEX idx_ciudadanos_cedula ON ciudadanos(cedula);
CREATE INDEX idx_ciudadanos_activo ON ciudadanos(activo);
```

---

### 2. 🚨 Tabla: `entidades_publicas`

**Propósito:** Almacena entidades de respuesta (bomberos, policía, cruz roja, etc.).

```sql
CREATE TABLE entidades_publicas (
  id_entidad INT PRIMARY KEY AUTO_INCREMENT,
  nombre_entidad VARCHAR(255) NOT NULL,
  tipo_entidad ENUM('BOMBEROS', 'POLICIA', 'CRUZ_ROJA', 'TRANSITO', 'AMBULANCIA', 'MUNICIPALIDAD', 'OTROS') NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  contraseña VARCHAR(255) NOT NULL,
  telefono_emergencia VARCHAR(20) NOT NULL,
  provincia VARCHAR(255) NOT NULL,
  canton VARCHAR(255) NOT NULL,
  distrito VARCHAR(255) NOT NULL,
  ubicacion TEXT NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Campos Específicos:**
- `nombre_entidad`: Nombre de la organización (ej: "Bomberos San José")
- `tipo_entidad`: Tipo de entidad de respuesta
- `telefono_emergencia`: Número de emergencias
- `ubicacion`: Dirección de la estación/sede
- No tiene `strikes` (solo ciudadanos)

**Tipos de Entidad:**
- `BOMBEROS`: Cuerpo de Bomberos
- `POLICIA`: Fuerza Pública
- `CRUZ_ROJA`: Cruz Roja Costarricense
- `TRANSITO`: Policía de Tránsito
- `AMBULANCIA`: Servicios de ambulancia
- `MUNICIPALIDAD`: Servicios municipales
- `OTROS`: Otras entidades de respuesta

**Índices:**
```sql
CREATE INDEX idx_entidades_email ON entidades_publicas(email);
CREATE INDEX idx_entidades_tipo ON entidades_publicas(tipo_entidad);
CREATE INDEX idx_entidades_activo ON entidades_publicas(activo);
```

---

### 3. 👨‍💼 Tabla: `administradores`

**Propósito:** Almacena administradores del sistema.

```sql
CREATE TABLE administradores (
  id_admin INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  apellidos VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  contraseña VARCHAR(255) NOT NULL,
  nivel_acceso ENUM('SUPER_ADMIN', 'ADMIN', 'MODERADOR') DEFAULT 'ADMIN',
  provincia VARCHAR(255) NOT NULL,
  canton VARCHAR(255) NOT NULL,
  distrito VARCHAR(255) NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Campos Específicos:**
- `nivel_acceso`: Nivel de permisos del administrador
  - `SUPER_ADMIN`: Acceso total, puede crear otros admins
  - `ADMIN`: Gestión completa del sistema
  - `MODERADOR`: Permisos limitados de moderación
- No tiene `strikes` ni `cedula`
- No tiene `telefono` (se asume contacto por email)

**Índices:**
```sql
CREATE INDEX idx_admin_email ON administradores(email);
CREATE INDEX idx_admin_nivel ON administradores(nivel_acceso);
```

---

### 4. 📍 Tabla: `incidentes` (Actualizada)

**Cambios:** Ahora se relaciona con `ciudadanos` en lugar de `users`.

```sql
CREATE TABLE incidentes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ciudadano_id INT NOT NULL,
  tipo ENUM('MEDICA', 'INFRAESTRUCTURA', 'SEGURIDAD', 'AMBIENTE', 'OTRO') NOT NULL,
  descripcion TEXT NOT NULL,
  severidad ENUM('BAJA', 'MEDIA', 'ALTA', 'CRITICA') NOT NULL,
  latitud DECIMAL(10, 8) NOT NULL,
  longitud DECIMAL(11, 8) NOT NULL,
  direccion VARCHAR(255) NOT NULL,
  estado ENUM('NUEVO', 'REVISION', 'ATENDIDO', 'FALSO') DEFAULT 'NUEVO',
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (ciudadano_id) REFERENCES ciudadanos(id_ciudadano) ON DELETE CASCADE
);
```

**Índices:**
```sql
CREATE INDEX idx_incidentes_ciudadano ON incidentes(ciudadano_id);
CREATE INDEX idx_incidentes_estado ON incidentes(estado);
CREATE INDEX idx_incidentes_tipo ON incidentes(tipo);
CREATE INDEX idx_incidentes_severidad ON incidentes(severidad);
CREATE INDEX idx_incidentes_fecha ON incidentes(fecha_creacion);
```

---

## 🔄 Sistema de Autenticación Unificado

### Flujo de Login

```
1. Usuario envía email + contraseña
2. Sistema busca en las 3 tablas:
   - ciudadanos
   - entidades_publicas
   - administradores
3. Si encuentra el email:
   - Verifica contraseña
   - Verifica que activo = TRUE
   - Genera JWT con userType
4. JWT incluye:
   {
     "email": "user@example.com",
     "sub": 1,  // ID del usuario
     "userType": "CIUDADANO" | "ENTIDAD" | "ADMIN"
   }
```

### Tipos de Usuario (UserType)

```typescript
export enum UserType {
  CIUDADANO = 'CIUDADANO',
  ENTIDAD = 'ENTIDAD',
  ADMIN = 'ADMIN',
}
```

---

## 📝 DTOs por Tipo de Usuario

### RegisterCiudadanoDto

```typescript
{
  "nombre": "Juan",
  "apellidos": "Pérez Mora",
  "cedula": "1-2345-6789",
  "email": "juan@ejemplo.com",
  "contraseña": "Password123!",
  "telefono": "8888-8888",
  "provincia": "San José",
  "canton": "Central",
  "distrito": "Carmen",
  "direccion": "Calle 5, Avenida 2, Casa 123"
}
```

### RegisterEntidadDto

```typescript
{
  "nombre_entidad": "Bomberos San José",
  "tipo_entidad": "BOMBEROS",
  "email": "bomberos@sanjose.go.cr",
  "contraseña": "Bomberos123!",
  "telefono_emergencia": "911",
  "provincia": "San José",
  "canton": "Central",
  "distrito": "Carmen",
  "ubicacion": "Estación Central, Av. 5, Calle 12"
}
```

### RegisterAdminDto

```typescript
{
  "nombre": "Carlos",
  "apellidos": "Rodríguez",
  "email": "admin@lazarus.com",
  "contraseña": "AdminPass123!",
  "nivel_acceso": "ADMIN",
  "provincia": "San José",
  "canton": "Escazú",
  "distrito": "San Rafael"
}
```

---

## 🔐 Sistema de Permisos Actualizado

### Permisos por UserType

| Acción | CIUDADANO | ENTIDAD | ADMIN |
|--------|-----------|---------|-------|
| Crear incidente | ✅ | ❌ | ✅ |
| Cambiar estado incidente | ❌ | ✅ | ✅ |
| Ver estadísticas | ❌ | ✅ | ✅ |
| Crear entidad | ❌ | ❌ | ✅ |
| Incrementar strikes | ❌ | ✅ | ✅ |
| Gestionar admins | ❌ | ❌ | ✅ (SUPER_ADMIN) |

---

## 🔄 Migración de Datos

### Si ya tienes datos en `users`

```sql
-- Migrar CIUDADANOS
INSERT INTO ciudadanos (nombre, apellidos, cedula, email, contraseña, provincia, canton, distrito, strikes, activo, fecha_creacion)
SELECT 
  SUBSTRING_INDEX(nombre, ' ', 1) as nombre,
  SUBSTRING_INDEX(nombre, ' ', -1) as apellidos,
  'N/A' as cedula,  -- Deberá actualizarse manualmente
  email,
  contraseña,
  'San José' as provincia,
  'Central' as canton,
  'Carmen' as distrito,
  strikes,
  CASE WHEN estado = 'HABILITADO' THEN TRUE ELSE FALSE END as activo,
  fecha_creacion
FROM users
WHERE rol = 'CIUDADANO';

-- Migrar ENTIDADES
INSERT INTO entidades_publicas (nombre_entidad, tipo_entidad, email, contraseña, telefono_emergencia, provincia, canton, distrito, ubicacion, activo, fecha_registro)
SELECT 
  nombre as nombre_entidad,
  'OTROS' as tipo_entidad,  -- Deberá actualizarse manualmente
  email,
  contraseña,
  '911' as telefono_emergencia,
  'San José' as provincia,
  'Central' as canton,
  'Carmen' as distrito,
  'Por definir' as ubicacion,
  CASE WHEN estado = 'HABILITADO' THEN TRUE ELSE FALSE END as activo,
  fecha_creacion
FROM users
WHERE rol = 'ENTIDAD';

-- Migrar ADMINS
INSERT INTO administradores (nombre, apellidos, email, contraseña, nivel_acceso, provincia, canton, distrito, activo, fecha_creacion)
SELECT 
  SUBSTRING_INDEX(nombre, ' ', 1) as nombre,
  SUBSTRING_INDEX(nombre, ' ', -1) as apellidos,
  email,
  contraseña,
  'ADMIN' as nivel_acceso,
  'San José' as provincia,
  'Escazú' as canton,
  'San Rafael' as distrito,
  CASE WHEN estado = 'HABILITADO' THEN TRUE ELSE FALSE END as activo,
  fecha_creacion
FROM users
WHERE rol = 'ADMIN';

-- Actualizar referencias en incidents
UPDATE incidents i
INNER JOIN ciudadanos c ON i.usuario_id = (
  SELECT id FROM users WHERE email = c.email AND rol = 'CIUDADANO'
)
SET i.ciudadano_id = c.id_ciudadano;

-- Eliminar tabla antigua (CUIDADO: hacer backup antes)
-- DROP TABLE users;
```

---

## 📡 Endpoints API Actualizados

### Autenticación

```bash
# Registrar ciudadano (público)
POST /api/auth/register
{
  "nombre": "Juan",
  "apellidos": "Pérez",
  "cedula": "1-2345-6789",
  "email": "juan@ejemplo.com",
  "contraseña": "Password123!",
  "provincia": "San José",
  "canton": "Central",
  "distrito": "Carmen"
}

# Login (todos)
POST /api/auth/login
{
  "email": "juan@ejemplo.com",
  "contraseña": "Password123!"
}

# Response
{
  "access_token": "eyJhbGciOi...",
  "user": {
    "id": 1,
    "userType": "CIUDADANO",
    "email": "juan@ejemplo.com",
    "nombre": "Juan",
    "apellidos": "Pérez",
    "cedula": "1-2345-6789",
    "strikes": 0
  }
}
```

### Gestión de Usuarios

```bash
# Admin crea entidad
POST /api/users/entidad
Authorization: Bearer <admin_token>
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

# Admin crea otro admin
POST /api/users/admin
Authorization: Bearer <super_admin_token>
{
  "nombre": "María",
  "apellidos": "González",
  "email": "maria@lazarus.com",
  "contraseña": "Admin123!",
  "nivel_acceso": "MODERADOR",
  "provincia": "Alajuela",
  "canton": "Central",
  "distrito": "Alajuela"
}

# Incrementar strikes de ciudadano
PATCH /api/ciudadanos/:id/strike
Authorization: Bearer <entidad_token>
```

---

## 🎯 Ventajas del Nuevo Sistema

### ✅ Beneficios

1. **Separación Clara:** Cada tipo de usuario tiene su propia tabla
2. **Campos Específicos:** Campos relevantes para cada rol (cedula solo para ciudadanos, tipo_entidad solo para entidades)
3. **Mejor Rendimiento:** Índices optimizados por tipo
4. **Escalabilidad:** Fácil agregar campos específicos sin afectar otros tipos
5. **Seguridad:** Strikes solo aplican a ciudadanos, nivel_acceso solo a admins
6. **Consultas Más Simples:** No necesitas filtrar por rol en cada query

### 📊 Comparación

| Característica | Sistema Anterior (1 tabla) | Sistema Nuevo (3 tablas) |
|----------------|----------------------------|--------------------------|
| Flexibilidad | ⚠️ Media | ✅ Alta |
| Performance | ⚠️ Bueno | ✅ Excelente |
| Mantenimiento | ⚠️ Complejo | ✅ Simple |
| Campos NULL | ❌ Muchos | ✅ Pocos |
| Validaciones | ⚠️ Condicionales | ✅ Nativas |

---

## 🚀 Próximos Pasos

1. **Ejecutar migraciones:** Crear las 3 nuevas tablas
2. **Migrar datos:** Si tienes datos existentes
3. **Actualizar módulos:** Users, Auth, Incidents
4. **Probar endpoints:** Con cada tipo de usuario
5. **Actualizar documentación:** Frontend integration guide

---

## 📋 Script de Migración Completo

```sql
-- 1. Crear nuevas tablas
CREATE TABLE ciudadanos (
  id_ciudadano INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  apellidos VARCHAR(255) NOT NULL,
  cedula VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  contraseña VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  provincia VARCHAR(255) NOT NULL,
  canton VARCHAR(255) NOT NULL,
  distrito VARCHAR(255) NOT NULL,
  direccion TEXT,
  strikes INT DEFAULT 0,
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_cedula (cedula),
  INDEX idx_activo (activo)
);

CREATE TABLE entidades_publicas (
  id_entidad INT PRIMARY KEY AUTO_INCREMENT,
  nombre_entidad VARCHAR(255) NOT NULL,
  tipo_entidad ENUM('BOMBEROS', 'POLICIA', 'CRUZ_ROJA', 'TRANSITO', 'AMBULANCIA', 'MUNICIPALIDAD', 'OTROS') NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  contraseña VARCHAR(255) NOT NULL,
  telefono_emergencia VARCHAR(20) NOT NULL,
  provincia VARCHAR(255) NOT NULL,
  canton VARCHAR(255) NOT NULL,
  distrito VARCHAR(255) NOT NULL,
  ubicacion TEXT NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_tipo (tipo_entidad),
  INDEX idx_activo (activo)
);

CREATE TABLE administradores (
  id_admin INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  apellidos VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  contraseña VARCHAR(255) NOT NULL,
  nivel_acceso ENUM('SUPER_ADMIN', 'ADMIN', 'MODERADOR') DEFAULT 'ADMIN',
  provincia VARCHAR(255) NOT NULL,
  canton VARCHAR(255) NOT NULL,
  distrito VARCHAR(255) NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_nivel (nivel_acceso)
);

-- 2. Actualizar tabla de incidentes
ALTER TABLE incidents 
  DROP FOREIGN KEY incidents_ibfk_1;

ALTER TABLE incidents 
  CHANGE usuario_id ciudadano_id INT NOT NULL;

ALTER TABLE incidents
  ADD CONSTRAINT fk_incidentes_ciudadano 
  FOREIGN KEY (ciudadano_id) REFERENCES ciudadanos(id_ciudadano) ON DELETE CASCADE;

-- 3. Renombrar tabla incidents a incidentes (opcional)
RENAME TABLE incidents TO incidentes;
```

---

**Sistema de tablas separadas implementado! 🎉**
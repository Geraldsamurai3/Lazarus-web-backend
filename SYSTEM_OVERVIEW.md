# 📊 Resumen del Nuevo Sistema de Tablas

## 🗄️ Estructura de Base de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                    LAZARUS DATABASE                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────┐ │
│  │   ciudadanos     │  │ entidades_       │  │ adminis- │ │
│  │                  │  │   publicas       │  │ tradores │ │
│  ├──────────────────┤  ├──────────────────┤  ├──────────┤ │
│  │ id_ciudadano PK  │  │ id_entidad PK    │  │id_admin PK││
│  │ nombre           │  │ nombre_entidad   │  │nombre     │ │
│  │ apellidos        │  │ tipo_entidad     │  │apellidos  │ │
│  │ cedula ✨        │  │ email            │  │email      │ │
│  │ email            │  │ contraseña       │  │contraseña │ │
│  │ contraseña       │  │ telefono_emerg✨ │  │nivel_acc✨│ │
│  │ telefono         │  │ provincia        │  │provincia  │ │
│  │ provincia        │  │ canton           │  │canton     │ │
│  │ canton           │  │ distrito         │  │distrito   │ │
│  │ distrito         │  │ ubicacion ✨     │  │activo     │ │
│  │ direccion        │  │ activo           │  │fecha_crea │ │
│  │ strikes ✨       │  │ fecha_registro   │  └──────────┘ │
│  │ activo           │  └──────────────────┘               │
│  │ fecha_creacion   │                                     │
│  └──────────────────┘                                     │
│           │                                                │
│           │ FK: ciudadano_id                               │
│           ▼                                                │
│  ┌──────────────────┐                                     │
│  │   incidentes     │                                     │
│  ├──────────────────┤                                     │
│  │ id PK            │                                     │
│  │ ciudadano_id FK  │◄── Solo ciudadanos reportan        │
│  │ tipo             │                                     │
│  │ descripcion      │                                     │
│  │ severidad        │                                     │
│  │ latitud          │                                     │
│  │ longitud         │                                     │
│  │ direccion        │                                     │
│  │ estado           │                                     │
│  │ fecha_creacion   │                                     │
│  │ fecha_actualizac │                                     │
│  └──────────────────┘                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Leyenda:
PK = Primary Key
FK = Foreign Key
✨ = Campo específico de este tipo de usuario
```

## 👥 Comparación de Campos por Tipo

### Campos Comunes (Todos)
- ✅ email (único)
- ✅ contraseña (hasheada)
- ✅ provincia
- ✅ canton
- ✅ distrito
- ✅ activo (boolean)
- ✅ fecha_creacion/fecha_registro

### Campos Únicos por Tipo

**👤 CIUDADANO:**
- cedula (identificación nacional)
- nombre + apellidos (separados)
- telefono (opcional)
- direccion (texto completo)
- **strikes** (sistema de penalizaciones 0-3)

**🚨 ENTIDAD PÚBLICA:**
- nombre_entidad (nombre de la organización)
- **tipo_entidad** (BOMBEROS, POLICIA, CRUZ_ROJA, etc.)
- **telefono_emergencia** (línea directa)
- **ubicacion** (dirección de la estación)

**👨‍💼 ADMINISTRADOR:**
- nombre + apellidos (separados)
- **nivel_acceso** (SUPER_ADMIN, ADMIN, MODERADOR)

## 🔄 Flujo de Autenticación Unificado

```
Usuario ingresa: email + contraseña
          │
          ▼
    ┌─────────────┐
    │ UnifiedAuth │
    │   Service   │
    └─────────────┘
          │
          ├─► Busca en ciudadanos
          ├─► Busca en entidades_publicas
          └─► Busca en administradores
          │
          ▼
    ┌─────────────┐
    │ ¿Encontrado?│
    └─────────────┘
          │
          ├─YES─► Verifica contraseña
          │         │
          │         ├─VALID─► Verifica activo
          │         │           │
          │         │           ├─TRUE─► Genera JWT
          │         │           │         {
          │         │           │           email,
          │         │           │           sub: id,
          │         │           │           userType: "CIUDADANO"|"ENTIDAD"|"ADMIN"
          │         │           │         }
          │         │           │
          │         │           └─FALSE─► Error: Cuenta deshabilitada
          │         │
          │         └─INVALID─► Error: Credenciales inválidas
          │
          └─NO──► Error: Credenciales inválidas
```

## 📝 Ejemplos de Datos

### Ciudadano
```json
{
  "id_ciudadano": 1,
  "nombre": "Juan",
  "apellidos": "Pérez Mora",
  "cedula": "1-2345-6789",
  "email": "juan@ejemplo.com",
  "telefono": "8888-8888",
  "provincia": "San José",
  "canton": "Central",
  "distrito": "Carmen",
  "direccion": "Calle 5, Avenida 2, Casa 123",
  "strikes": 0,
  "activo": true,
  "fecha_creacion": "2025-10-26T00:00:00.000Z"
}
```

### Entidad Pública
```json
{
  "id_entidad": 1,
  "nombre_entidad": "Bomberos San José",
  "tipo_entidad": "BOMBEROS",
  "email": "bomberos@sanjose.go.cr",
  "telefono_emergencia": "911",
  "provincia": "San José",
  "canton": "Central",
  "distrito": "Carmen",
  "ubicacion": "Estación Central, Av. 5, Calle 12",
  "activo": true,
  "fecha_registro": "2025-10-26T00:00:00.000Z"
}
```

### Administrador
```json
{
  "id_admin": 1,
  "nombre": "Carlos",
  "apellidos": "Rodríguez López",
  "email": "admin@lazarus.com",
  "nivel_acceso": "SUPER_ADMIN",
  "provincia": "San José",
  "canton": "Escazú",
  "distrito": "San Rafael",
  "activo": true,
  "fecha_creacion": "2025-10-26T00:00:00.000Z"
}
```

## 🎯 Archivos Creados

1. ✅ `src/users/entity/ciudadano.entity.ts`
2. ✅ `src/users/entity/entidad-publica.entity.ts`
3. ✅ `src/users/entity/administrador.entity.ts`
4. ✅ `src/users/dto/user-roles.dto.ts` (DTOs para cada tipo)
5. ✅ `src/users/services/unified-auth.service.ts` (Autenticación unificada)
6. ✅ `src/incidents/entity/incident.entity.ts` (Actualizado con FK a ciudadanos)

## ⚙️ Próximos Pasos

1. **Actualizar app.module.ts** - Registrar las 3 nuevas entidades en TypeORM
2. **Actualizar auth.module.ts** - Usar UnifiedAuthService
3. **Actualizar auth.controller.ts** - Endpoints para cada tipo
4. **Actualizar JWT strategy** - Manejar userType
5. **Actualizar guards** - Verificar userType en lugar de rol
6. **Crear controladores** - Separados para ciudadanos, entidades y admins
7. **Migrar datos** - Si existe información en tabla antigua
8. **Probar sistema** - Con los 3 tipos de usuarios

¿Continúo con la implementación de los módulos actualizados?

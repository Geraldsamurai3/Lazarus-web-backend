# 👑 Sistema de Primer Usuario Admin - Lazarus

## 🎯 Funcionalidad Implementada

Se ha implementado un sistema donde **el primer usuario que se registre automáticamente se convierte en ADMIN**, y todos los usuarios subsecuentes entran como **CIUDADANO** hasta que un administrador les asigne otros roles.

## 🔧 Cómo Funciona

### 1. Primer Usuario = ADMIN
- Cuando no hay usuarios en la base de datos (count = 0)
- El primer usuario que se registre automáticamente recibe rol `ADMIN`
- Mensaje especial: "Bienvenido! Eres el primer usuario y ahora eres ADMIN."

### 2. Usuarios Subsecuentes = CIUDADANO
- Todos los usuarios posteriores se registran como `CIUDADANO`
- Mensaje: "Registro exitoso como CIUDADANO."

### 3. Cambio de Roles por Admin
- Solo usuarios con rol `ADMIN` pueden cambiar roles
- Los admins no pueden cambiar su propio rol (medida de seguridad)

## 📡 Endpoints

### Registro de Usuario
```http
POST /auth/register
Content-Type: application/json

{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "contraseña": "123456"
}
```

**Respuesta del Primer Usuario:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "rol": "ADMIN",
    "estado": "HABILITADO"
  },
  "message": "Bienvenido! Eres el primer usuario y ahora eres ADMIN."
}
```

**Respuesta de Usuarios Posteriores:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "nombre": "María González",
    "email": "maria@example.com",
    "rol": "CIUDADANO",
    "estado": "HABILITADO"
  },
  "message": "Registro exitoso como CIUDADANO."
}
```

### Cambiar Rol de Usuario (Solo Admin)
```http
PATCH /users/{userId}/role
Content-Type: application/json

{
  "rol": "ENTIDAD",
  "adminUserId": 1
}
```

**Respuesta Exitosa:**
```json
{
  "id": 2,
  "nombre": "María González",
  "email": "maria@example.com",
  "rol": "ENTIDAD",
  "estado": "HABILITADO",
  "fecha_creacion": "2025-10-04T10:30:00.000Z"
}
```

## 🛡️ Validaciones de Seguridad

### ✅ Verificaciones Implementadas:
1. **Solo ADMIN puede cambiar roles**
   - Se verifica que `adminUserId` tenga rol `ADMIN`
   - Error: "Solo los administradores pueden cambiar roles de usuarios"

2. **Admin no puede cambiar su propio rol**
   - Previene que un admin se quite permisos accidentalmente
   - Error: "Los administradores no pueden cambiar su propio rol"

3. **Usuario objetivo debe existir**
   - Se verifica que el usuario a modificar exista
   - Error: "Usuario con ID X no encontrado"

4. **Validación de DTOs**
   - `rol` debe ser un valor válido del enum `UserRole`
   - `adminUserId` debe ser un número válido

## 🎭 Roles Disponibles

- **ADMIN**: Control total del sistema
- **ENTIDAD**: Organizaciones de emergencia
- **CIUDADANO**: Usuarios regulares

## 🧪 Casos de Prueba

### Caso 1: Primer Usuario
```bash
# Base de datos vacía
POST /auth/register
# Resultado: Usuario con rol ADMIN
```

### Caso 2: Segundo Usuario
```bash
# Ya existe un usuario
POST /auth/register
# Resultado: Usuario con rol CIUDADANO
```

### Caso 3: Admin Cambia Rol
```bash
# Admin (ID: 1) cambia rol de usuario (ID: 2) a ENTIDAD
PATCH /users/2/role
Body: {"rol": "ENTIDAD", "adminUserId": 1}
# Resultado: Usuario 2 ahora es ENTIDAD
```

### Caso 4: Ciudadano Intenta Cambiar Rol
```bash
# Ciudadano (ID: 2) intenta cambiar rol
PATCH /users/3/role
Body: {"rol": "ENTIDAD", "adminUserId": 2}
# Resultado: Error 409 - "Solo los administradores pueden cambiar roles"
```

### Caso 5: Admin Intenta Cambiar Su Propio Rol
```bash
# Admin (ID: 1) intenta cambiar su propio rol
PATCH /users/1/role
Body: {"rol": "CIUDADANO", "adminUserId": 1}
# Resultado: Error 409 - "Los administradores no pueden cambiar su propio rol"
```

## 🔄 Flujo de Trabajo Recomendado

### Para el Primer Usuario (Admin):
1. Registrarse en la plataforma
2. Automáticamente obtiene permisos de ADMIN
3. Puede gestionar todos los usuarios del sistema

### Para Administradores:
1. Revisar usuarios registrados: `GET /users`
2. Identificar usuarios que necesitan roles especiales
3. Cambiar roles según sea necesario: `PATCH /users/{id}/role`

### Para Usuarios Regulares:
1. Registrarse como CIUDADANO
2. Esperar a que un admin les asigne rol ENTIDAD si es necesario
3. Usar la plataforma según sus permisos

## 🚀 Ventajas del Sistema

- ✅ **Seguridad por defecto**: Usuarios entran con permisos mínimos
- ✅ **Fácil setup inicial**: Primer usuario es automáticamente admin
- ✅ **Control granular**: Admins pueden gestionar roles específicamente
- ✅ **Prevención de errores**: Admins no pueden eliminarse a sí mismos
- ✅ **Auditable**: Todos los cambios requieren ID del admin que los realiza

---

**¡El sistema está listo para gestionar usuarios con roles apropiados!** 🎉
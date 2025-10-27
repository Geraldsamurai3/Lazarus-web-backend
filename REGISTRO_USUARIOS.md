# 📝 Guía de Registro de Usuarios - Lazarus

## 🎯 Endpoints de Registro

### 1️⃣ Registrar CIUDADANO (Público)

**Endpoint:** `POST /auth/register`  
**Autenticación:** ❌ No requiere

**Body JSON:**
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
  "direccion": "Barrio Amón, Calle 5, Avenida 7"
}
```

**Ejemplo cURL:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Carlos",
    "apellidos": "Pérez González",
    "email": "juan.perez@gmail.com",
    "contraseña": "Password123!",
    "cedula": "1-2345-6789",
    "telefono": "8888-8888",
    "provincia": "San José",
    "canton": "Central",
    "distrito": "Carmen",
    "direccion": "Barrio Amón, Calle 5, Avenida 7"
  }'
```

**Respuesta Exitosa:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "userType": "CIUDADANO",
    "nombre": "Juan Carlos",
    "apellidos": "Pérez González",
    "email": "juan.perez@gmail.com",
    "cedula": "1-2345-6789",
    "telefono": "8888-8888",
    "provincia": "San José",
    "canton": "Central",
    "distrito": "Carmen",
    "direccion": "Barrio Amón, Calle 5, Avenida 7",
    "strikes": 0,
    "activo": true,
    "fecha_creacion": "2025-10-26T17:00:00.000Z"
  }
}
```

---

### 2️⃣ Registrar ENTIDAD PÚBLICA

**Endpoint:** `POST /auth/register-entidad`  
**Autenticación:** ❌ No requiere

**Body JSON:**
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

**Tipos de Entidad Válidos:**
- `"BOMBEROS"`
- `"POLICIA"`
- `"CRUZ_ROJA"`
- `"TRANSITO"`
- `"AMBULANCIA"`
- `"MUNICIPALIDAD"`
- `"OTROS"`

**Ejemplo cURL:**
```bash
curl -X POST http://localhost:3000/auth/register-entidad \
  -H "Content-Type: application/json" \
  -d '{
    "nombre_entidad": "Bomberos Central San José",
    "tipo_entidad": "BOMBEROS",
    "email": "bomberos.central@go.cr",
    "contraseña": "Bomberos2025!",
    "telefono_emergencia": "911",
    "provincia": "San José",
    "canton": "Central",
    "distrito": "Carmen",
    "ubicacion": "Estación Central, Av. 8, Calle 9-11"
  }'
```

**Respuesta Exitosa:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "userType": "ENTIDAD",
    "nombre_entidad": "Bomberos Central San José",
    "tipo_entidad": "BOMBEROS",
    "email": "bomberos.central@go.cr",
    "telefono_emergencia": "911",
    "provincia": "San José",
    "canton": "Central",
    "distrito": "Carmen",
    "ubicacion": "Estación Central, Av. 8, Calle 9-11",
    "activo": true,
    "fecha_registro": "2025-10-26T17:00:00.000Z"
  }
}
```

---

### 3️⃣ Registrar ADMINISTRADOR

**Endpoint:** `POST /auth/register-admin`  
**Autenticación:** ❌ No requiere

**Body JSON:**
```json
{
  "nombre": "María Elena",
  "apellidos": "Rodríguez Castro",
  "email": "maria.admin@lazarus.com",
  "contraseña": "Admin2025!",
  "nivel_acceso": "ADMIN",
  "provincia": "San José",
  "canton": "Central",
  "distrito": "Carmen"
}
```

**Niveles de Acceso Válidos:**
- `"SUPER_ADMIN"` - Acceso completo al sistema
- `"ADMIN"` - Administrador regular
- `"MODERADOR"` - Permisos limitados

**Ejemplo cURL:**
```bash
curl -X POST http://localhost:3000/auth/register-admin \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "María Elena",
    "apellidos": "Rodríguez Castro",
    "email": "maria.admin@lazarus.com",
    "contraseña": "Admin2025!",
    "provincia": "San José",
    "canton": "Central",
    "distrito": "Carmen"
  }'
```

**Respuesta Exitosa:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "userType": "ADMIN",
    "nombre": "María Elena",
    "apellidos": "Rodríguez Castro",
    "email": "maria.admin@lazarus.com",
    "nivel_acceso": "ADMIN",
    "provincia": "San José",
    "canton": "Central",
    "distrito": "Carmen",
    "activo": true,
    "fecha_creacion": "2025-10-26T17:00:00.000Z"
  }
}
```

---

## 🔐 Login

**Endpoint:** `POST /auth/login`  
**Autenticación:** ❌ No requiere

**Body JSON (para cualquier tipo de usuario):**
```json
{
  "email": "usuario@example.com",
  "contraseña": "Password123!"
}
```

**Ejemplo cURL:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan.perez@gmail.com",
    "contraseña": "Password123!"
  }'
```

---

## 🛡️ Validaciones

### Ciudadano
- ✅ `nombre`: requerido, string
- ✅ `apellidos`: requerido, string
- ✅ `cedula`: requerido, string, único
- ✅ `email`: requerido, email válido, único
- ✅ `contraseña`: requerido, mínimo 8 caracteres
- ⚪ `telefono`: opcional, string
- ✅ `provincia`: requerido, string
- ✅ `canton`: requerido, string
- ✅ `distrito`: requerido, string
- ⚪ `direccion`: opcional, string

### Entidad Pública
- ✅ `nombre_entidad`: requerido, string
- ✅ `tipo_entidad`: requerido, enum (BOMBEROS, POLICIA, etc.)
- ✅ `email`: requerido, email válido, único
- ✅ `contraseña`: requerido, mínimo 8 caracteres
- ✅ `telefono_emergencia`: requerido, string
- ✅ `provincia`: requerido, string
- ✅ `canton`: requerido, string
- ✅ `distrito`: requerido, string
- ✅ `ubicacion`: requerido, string

### Administrador
- ✅ `nombre`: requerido, string
- ✅ `apellidos`: requerido, string
- ✅ `email`: requerido, email válido, único
- ✅ `contraseña`: requerido, mínimo 8 caracteres
- ⚪ `nivel_acceso`: opcional, enum (default: ADMIN)
- ✅ `provincia`: requerido, string
- ✅ `canton`: requerido, string
- ✅ `distrito`: requerido, string

---

## ❌ Errores Comunes

### Email ya existe
```json
{
  "statusCode": 409,
  "message": "El email ya está registrado",
  "error": "Conflict"
}
```

### Campos faltantes
```json
{
  "statusCode": 400,
  "message": [
    "nombre must be a string",
    "nombre should not be empty"
  ],
  "error": "Bad Request"
}
```

### Contraseña muy corta
```json
{
  "statusCode": 400,
  "message": [
    "contraseña must be longer than or equal to 8 characters"
  ],
  "error": "Bad Request"
}
```

### Tipo de entidad inválido
```json
{
  "statusCode": 400,
  "message": [
    "tipo_entidad must be a valid enum value"
  ],
  "error": "Bad Request"
}
```



---

## 📋 Flujo Completo de Prueba

### 1. Registrar un ciudadano
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Pedro",
    "apellidos": "López",
    "email": "pedro@test.com",
    "contraseña": "Test1234!",
    "cedula": "1-1111-1111",
    "telefono": "7777-7777",
    "provincia": "Heredia",
    "canton": "Heredia",
    "distrito": "Mercedes"
  }'
```

Guarda el `access_token` de la respuesta.

### 2. Login con el ciudadano
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "pedro@test.com",
    "contraseña": "Test1234!"
  }'
```

### 3. Crear un incidente (como ciudadano)
```bash
curl -X POST http://localhost:3000/incidents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_CIUDADANO>" \
  -d '{
    "tipo": "INCENDIO",
    "descripcion": "Incendio en casa",
    "severidad": "ALTA",
    "latitud": 9.9281,
    "longitud": -84.0907,
    "direccion": "Heredia Centro"
  }'
```

### 4. Registrar una entidad
```bash
curl -X POST http://localhost:3000/auth/register-entidad \
  -H "Content-Type: application/json" \
  -d '{
    "nombre_entidad": "Cruz Roja Heredia",
    "tipo_entidad": "CRUZ_ROJA",
    "email": "cruzroja.heredia@go.cr",
    "contraseña": "CruzRoja2025!",
    "telefono_emergencia": "128",
    "provincia": "Heredia",
    "canton": "Heredia",
    "distrito": "Mercedes",
    "ubicacion": "Centro de Heredia"
  }'
```

---

## 🎯 Resumen de Endpoints

| Endpoint | Método | Autenticación | Acceso |
|----------|--------|---------------|--------|
| `/auth/register` | POST | ❌ No | Público |
| `/auth/register-entidad` | POST | ❌ No | Público |
| `/auth/register-admin` | POST | ❌ No | Público |
| `/auth/login` | POST | ❌ No | Público |

---

## ✅ Campos Requeridos por Tipo

### CIUDADANO
```
✅ nombre
✅ apellidos  
✅ cedula
✅ email
✅ contraseña
✅ provincia
✅ canton
✅ distrito
⚪ telefono (opcional)
⚪ direccion (opcional)
```

### ENTIDAD
```
✅ nombre_entidad
✅ tipo_entidad
✅ email
✅ contraseña
✅ telefono_emergencia
✅ provincia
✅ canton
✅ distrito
✅ ubicacion
```

### ADMINISTRADOR
```
✅ nombre
✅ apellidos
✅ email
✅ contraseña
✅ provincia
✅ canton
✅ distrito
```

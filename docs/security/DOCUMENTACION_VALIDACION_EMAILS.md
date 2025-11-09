# 🔍 Validación de Emails - Sistema Anti-Duplicados

## Descripción

Sistema completo de validación de emails para prevenir duplicados en el registro y facilitar la recuperación de contraseñas.

---

## ✅ Funcionalidades Implementadas

### 1. Validación Automática en Registro

**Todas las funciones de registro ahora verifican automáticamente si el email ya existe:**

- ✅ `registerCiudadano()` - Valida antes de crear cuenta de ciudadano
- ✅ `registerEntidad()` - Valida antes de crear cuenta de entidad
- ✅ `registerAdmin()` - Valida antes de crear cuenta de administrador

**Comportamiento:**
```typescript
// Si el email ya existe en CUALQUIERA de las 3 tablas
throw new ConflictException('El email ya está registrado');
```

**Respuesta HTTP:**
```json
{
  "statusCode": 409,
  "message": "El email ya está registrado",
  "error": "Conflict"
}
```

---

### 2. Verificación Mejorada en Recuperación de Contraseña

**`forgotPassword()` ahora:**
- ✅ Verifica si el email existe en las 3 tablas
- ✅ Registra logs detallados para debugging
- ✅ Retorna mensaje genérico por seguridad

**Logs generados:**
```
🔐 Solicitud de reset de contraseña para: usuario@test.com
✅ Token de reset generado y enviado a usuario@test.com (CIUDADANO)
```

**Si el email NO existe:**
```
⚠️ Email no encontrado: noexiste@test.com
```

---

### 3. Endpoint de Verificación de Email (NUEVO)

**Endpoint público para validar disponibilidad de emails en el frontend.**

#### `POST /auth/check-email`

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "email": "nuevo@ejemplo.com"
}
```

**Respuesta - Email Disponible (200 OK):**
```json
{
  "available": true,
  "message": "El email está disponible"
}
```

**Respuesta - Email Ya Registrado (200 OK):**
```json
{
  "available": false,
  "message": "El email ya está registrado en el sistema"
}
```

**Validaciones:**
- `email` debe ser un email válido (formato)
- Campo requerido

**Ejemplo cURL:**
```bash
curl -X POST http://localhost:3000/auth/check-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@ejemplo.com"}'
```

**Ejemplo JavaScript:**
```javascript
async function checkEmailAvailability(email) {
  const response = await fetch('http://localhost:3000/auth/check-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();
  
  if (data.available) {
    console.log('✅ Email disponible');
  } else {
    console.log('❌ Email ya registrado');
  }
  
  return data;
}
```

---

## 🛠️ Métodos Internos (Backend)

### `emailExists(email: string): Promise<boolean>`

**Descripción:** Verifica si un email existe en cualquiera de las 3 tablas.

**Uso interno:**
```typescript
const exists = await this.unifiedAuthService.emailExists('test@test.com');
if (exists) {
  throw new ConflictException('Email duplicado');
}
```

**Retorna:**
- `true` - El email existe
- `false` - El email no existe

**Tablas consultadas:**
1. `ciudadano`
2. `entidad_publica`
3. `administrador`

---

### `findByEmail(email: string)`

**Descripción:** Encuentra un usuario por email en cualquiera de las 3 tablas.

**Uso interno:**
```typescript
const result = await this.unifiedAuthService.findByEmail('test@test.com');

if (result) {
  console.log(result.user);       // Usuario encontrado
  console.log(result.userType);   // CIUDADANO | ENTIDAD | ADMIN
  console.log(result.repository); // Repository para operaciones
}
```

**Retorna:**
```typescript
{
  user: Ciudadano | EntidadPublica | Administrador,
  userType: UserType,
  repository: Repository<any>
} | null
```

---

### `checkEmailAvailability(email: string)`

**Descripción:** Método público para verificar disponibilidad (usado por endpoint).

**Uso interno:**
```typescript
const result = await this.unifiedAuthService.checkEmailAvailability('test@test.com');
// { available: true/false, message: string }
```

---

## 🎨 Implementación en Frontend

### Validación en Tiempo Real

```tsx
import { useState, useEffect } from 'react';
import { debounce } from 'lodash'; // Opcional

export function RegisterForm() {
  const [email, setEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState<{
    checking: boolean;
    available: boolean | null;
    message: string;
  }>({
    checking: false,
    available: null,
    message: '',
  });

  // Debounce para no hacer muchas requests
  const checkEmail = debounce(async (emailValue: string) => {
    if (!emailValue || !emailValue.includes('@')) return;

    setEmailStatus({ checking: true, available: null, message: '' });

    try {
      const response = await fetch('http://localhost:3000/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailValue }),
      });

      const data = await response.json();
      
      setEmailStatus({
        checking: false,
        available: data.available,
        message: data.message,
      });
    } catch (error) {
      setEmailStatus({
        checking: false,
        available: null,
        message: 'Error al verificar email',
      });
    }
  }, 500); // 500ms de debounce

  useEffect(() => {
    checkEmail(email);
  }, [email]);

  return (
    <div>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu-email@ejemplo.com"
      />
      
      {emailStatus.checking && (
        <span className="text-gray-500">🔄 Verificando...</span>
      )}
      
      {emailStatus.available === true && (
        <span className="text-green-600">✅ {emailStatus.message}</span>
      )}
      
      {emailStatus.available === false && (
        <span className="text-red-600">❌ {emailStatus.message}</span>
      )}
    </div>
  );
}
```

### Validación Antes de Submit

```typescript
async function handleRegister(formData: RegisterData) {
  // Verificar email antes de enviar
  const checkResult = await fetch('http://localhost:3000/auth/check-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: formData.email }),
  }).then(r => r.json());

  if (!checkResult.available) {
    alert('El email ya está registrado. Por favor usa otro.');
    return;
  }

  // Proceder con el registro
  const response = await fetch('http://localhost:3000/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });

  // ... resto del código
}
```

---

## 🧪 Testing

### Test 1: Email Disponible

```bash
curl -X POST http://localhost:3000/auth/check-email \
  -H "Content-Type: application/json" \
  -d '{"email":"nuevo@test.com"}'

# Respuesta esperada:
# {
#   "available": true,
#   "message": "El email está disponible"
# }
```

### Test 2: Email Ya Registrado

```bash
curl -X POST http://localhost:3000/auth/check-email \
  -H "Content-Type: application/json" \
  -d '{"email":"ciudadano@test.com"}'

# Respuesta esperada:
# {
#   "available": false,
#   "message": "El email ya está registrado en el sistema"
# }
```

### Test 3: Intentar Registro con Email Duplicado

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan",
    "apellidos": "Pérez",
    "cedula": "123456789",
    "email": "ciudadano@test.com",
    "contraseña": "password123",
    "direccion": "San José"
  }'

# Respuesta esperada (409 Conflict):
# {
#   "statusCode": 409,
#   "message": "El email ya está registrado",
#   "error": "Conflict"
# }
```

### Test 4: Forgot Password con Email No Existente

```bash
curl -X POST http://localhost:3000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"noexiste@test.com"}'

# Respuesta (misma por seguridad):
# {
#   "message": "Si el email existe en el sistema, recibirás un correo..."
# }

# Log en servidor:
# ⚠️ Email no encontrado: noexiste@test.com
```

---

## 📊 Flujo de Validación

### Registro de Usuario

```
1. Usuario ingresa email en formulario
   ↓
2. Frontend llama POST /auth/check-email (opcional, UX mejorada)
   ↓
3. Backend verifica en 3 tablas con emailExists()
   ↓
4. Retorna { available: true/false }
   ↓
5. Usuario completa formulario y hace submit
   ↓
6. Backend valida nuevamente en registerCiudadano()
   ↓
7. Si existe: throw ConflictException (409)
   Si no existe: Crear cuenta exitosamente
```

### Recuperación de Contraseña

```
1. Usuario ingresa email en "Olvidé mi contraseña"
   ↓
2. Frontend llama POST /auth/forgot-password
   ↓
3. Backend verifica con findByEmail()
   ↓
4a. Si existe: Genera token + Envía email
4b. Si NO existe: Log de advertencia
   ↓
5. Retorna mensaje genérico (seguridad)
   ↓
6. Usuario recibe email solo si el email existe
```

---

## 🔒 Consideraciones de Seguridad

### ✅ Implementado

1. **Validación en Múltiples Capas:**
   - Validación en frontend (UX)
   - Validación en backend antes de guardar
   - Validación con DTO (class-validator)

2. **Mensaje Genérico en Forgot Password:**
   - No revela si un email existe o no
   - Previene enumeración de usuarios
   - Solo logs internos para admin

3. **Email Único Global:**
   - Un email solo puede estar en UNA tabla
   - No duplicados entre Ciudadano/Entidad/Admin

### ⚠️ Consideraciones

**Endpoint `/auth/check-email` ES PÚBLICO:**
- Cualquiera puede verificar si un email existe
- Esto es normal para UX de registro
- Si necesitas más privacidad, protege con rate limiting

**Recomendación:** Agregar rate limiting:
```typescript
// Limitar a 10 requests por minuto por IP
@Throttle(10, 60)
@Post('check-email')
```

---

## 📝 Errores Comunes

### Error 409: Email ya registrado

**Causa:** El email existe en alguna de las 3 tablas.

**Solución:** Usar otro email o recuperar la contraseña de la cuenta existente.

### Error 400: Email inválido

**Causa:** Formato de email incorrecto.

**Ejemplo inválido:**
```json
{ "email": "no-es-un-email" }
```

**Solución:** Usar formato válido: `usuario@dominio.com`

---

## 🚀 Mejoras Futuras Sugeridas

1. **Rate Limiting en `/check-email`:**
   ```bash
   npm install @nestjs/throttler
   ```

2. **Cache de Emails Verificados:**
   - Evitar consultas repetidas a BD
   - TTL de 5 minutos

3. **Validación de Dominios:**
   - Lista blanca/negra de dominios de email
   - Validar que el dominio existe (DNS lookup)

4. **Historial de Intentos:**
   - Registrar intentos de registro con emails duplicados
   - Detectar posibles ataques

---

## 📖 Resumen de Cambios

### Archivos Modificados

1. **`src/users/services/unified-auth.service.ts`**
   - ✅ Método `emailExists()` - Verificación centralizada
   - ✅ Método `checkEmailAvailability()` - Endpoint público
   - ✅ Método `findByEmail()` actualizado con `repository`
   - ✅ `registerCiudadano()` usa `emailExists()`
   - ✅ `registerEntidad()` usa `emailExists()`
   - ✅ `registerAdmin()` usa `emailExists()`
   - ✅ `forgotPassword()` con logs mejorados

2. **`src/auth/auth.service.ts`**
   - ✅ Método `checkEmail()` delegando a UnifiedAuthService

3. **`src/auth/auth.controller.ts`**
   - ✅ Endpoint `POST /auth/check-email` nuevo

4. **`src/users/dto/user-roles.dto.ts`**
   - ✅ DTO `CheckEmailDto` para validación

### Nuevos Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth/check-email` | Verificar disponibilidad de email |

### Métodos Internos Nuevos

| Método | Descripción | Retorno |
|--------|-------------|---------|
| `emailExists()` | Verifica si email existe | `boolean` |
| `checkEmailAvailability()` | Versión pública de verificación | `{ available, message }` |

---

**Documentación generada:** 1 de noviembre, 2025  
**Versión del sistema:** Lazarus Backend v1.0  
**Endpoints Base:** `http://localhost:3000`

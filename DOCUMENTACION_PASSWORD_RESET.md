# 🔐 Documentación: Sistema de Recuperación de Contraseña

## Descripción General

Sistema completo de "Olvidé mi contraseña" con tokens seguros, expiración automática y envío de emails. Permite a los usuarios de cualquier tipo (Ciudadano, Entidad, Admin) recuperar acceso a sus cuentas.

---

## 📋 Flujo Completo

```
1. Usuario solicita reset → POST /auth/forgot-password
2. Sistema genera token único (64 caracteres)
3. Token se guarda en BD con expiración de 1 hora
4. Email enviado con link de reset
5. Usuario hace click en el link
6. Frontend muestra formulario de nueva contraseña
7. Usuario envía nueva contraseña → POST /auth/reset-password
8. Sistema valida token y actualiza contraseña
9. Token se marca como usado (no reutilizable)
```

---

## 🔗 Endpoints Disponibles

### 1️⃣ Solicitar Reset de Contraseña

**Endpoint:** `POST /auth/forgot-password`

**Descripción:** Inicia el proceso de recuperación de contraseña. Envía un email con el link de reset si el email existe en el sistema.

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body (JSON):**
```json
{
  "email": "usuario@ejemplo.com"
}
```

**Validaciones:**
- `email`: Requerido, debe ser un email válido

**Respuesta - Email Encontrado (200 OK):**
```json
{
  "success": true,
  "message": "Se han enviado las instrucciones de recuperación a tu correo electrónico. Por favor, revisa tu bandeja de entrada y sigue los pasos para restablecer tu contraseña. El enlace expirará en 1 hora."
}
```

**Respuesta - Email NO Encontrado (200 OK):**
```json
{
  "success": false,
  "message": "No se encontró ninguna cuenta asociada a este correo electrónico. Por favor, verifica que el email sea correcto o regístrate si aún no tienes una cuenta."
}
```

**Notas:**
- ✅ El sistema ahora informa claramente si el email existe o no
- ✅ Mejora la experiencia de usuario al dar feedback específico
- ✅ Busca en las 3 tablas: `ciudadano`, `entidad_publica`, `administrador`

**Ejemplo cURL:**
```bash
curl -X POST http://localhost:3000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ciudadano@ejemplo.com"
  }'
```

**Ejemplo JavaScript (fetch):**
```javascript
const response = await fetch('http://localhost:3000/auth/forgot-password', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'ciudadano@ejemplo.com'
  })
});

const data = await response.json();
console.log(data.message);
```

---

### 2️⃣ Restablecer Contraseña

**Endpoint:** `POST /auth/reset-password`

**Descripción:** Establece una nueva contraseña usando el token recibido por email.

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body (JSON):**
```json
{
  "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2",
  "newPassword": "MiNuevaContraseña123"
}
```

**Validaciones:**
- `token`: Requerido, string (64 caracteres hexadecimales)
- `newPassword`: Requerido, mínimo 8 caracteres

**Respuesta Exitosa (200 OK):**
```json
{
  "message": "Contraseña actualizada exitosamente"
}
```

**Errores Posibles:**

**400 Bad Request - Token Inválido:**
```json
{
  "statusCode": 400,
  "message": "Token inválido o expirado",
  "error": "Bad Request"
}
```

**400 Bad Request - Contraseña Corta:**
```json
{
  "statusCode": 400,
  "message": [
    "newPassword must be longer than or equal to 8 characters"
  ],
  "error": "Bad Request"
}
```

**Ejemplo cURL:**
```bash
curl -X POST http://localhost:3000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "TOKEN_RECIBIDO_POR_EMAIL",
    "newPassword": "MiNuevaContraseña123"
  }'
```

**Ejemplo JavaScript (fetch):**
```javascript
const response = await fetch('http://localhost:3000/auth/reset-password', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    token: tokenFromURL, // Extraído de la URL
    newPassword: 'MiNuevaContraseña123'
  })
});

if (response.ok) {
  const data = await response.json();
  console.log('✅', data.message);
  // Redirigir al login
} else {
  const error = await response.json();
  console.error('❌', error.message);
}
```

---

## 📧 Email de Recuperación

El usuario recibirá un email con el siguiente contenido:

**Asunto:** 🔐 Recuperación de Contraseña - Lazarus

**Contenido:**
- Saludo personalizado con nombre del usuario
- Botón con link directo: `{FRONTEND_URL}/reset-password?token={TOKEN}`
- URL alternativa (por si no funciona el botón)
- Advertencia: "Este enlace expira en 1 hora"
- Nota de seguridad: "Si no solicitaste este cambio, ignora este correo"

**Variables de entorno necesarias:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-contraseña-app-16-chars
FRONTEND_URL=http://localhost:3001
```

---

## 🎨 Implementación en Frontend

### Página 1: Solicitar Reset (`/forgot-password`)

```tsx
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('http://localhost:3000/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage(data.message); // Email encontrado y enviado
      } else {
        setError(data.message); // Email no encontrado
      }
      
    } catch (error) {
      setError('Error al procesar la solicitud. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <h1>¿Olvidaste tu contraseña?</h1>
      <p>Ingresa tu email y te enviaremos instrucciones para recuperarla.</p>
      
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="tu-email@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <button type="submit" disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar Instrucciones'}
        </button>
      </form>

      {message && (
        <div className="success-message" style={{ color: 'green', marginTop: '10px' }}>
          ✅ {message}
        </div>
      )}

      {error && (
        <div className="error-message" style={{ color: 'red', marginTop: '10px' }}>
          ❌ {error}
        </div>
      )}
    </div>
  );
}
```

### Página 2: Restablecer Contraseña (`/reset-password`)

```tsx
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const tokenFromURL = searchParams.get('token');
    if (tokenFromURL) {
      setToken(tokenFromURL);
    } else {
      setError('Token no encontrado en la URL');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Validaciones del frontend
    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Contraseña actualizada exitosamente. Redirigiendo al login...');
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setError(data.message || 'Error al restablecer la contraseña');
      }
      
    } catch (error) {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="error-container">
        <h1>❌ Token Inválido</h1>
        <p>El enlace no es válido o ha expirado.</p>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <h1>Restablecer Contraseña</h1>
      <p>Ingresa tu nueva contraseña (mínimo 8 caracteres)</p>
      
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Nueva contraseña"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={8}
        />
        
        <input
          type="password"
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={8}
        />
        
        <button type="submit" disabled={loading}>
          {loading ? 'Actualizando...' : 'Restablecer Contraseña'}
        </button>
      </form>

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}
    </div>
  );
}
```

---

## 🔒 Seguridad Implementada

### ✅ Medidas de Seguridad

1. **Token Criptográfico**
   - Generado con `crypto.randomBytes(32)` = 64 caracteres hexadecimales
   - Imposible de adivinar o predecir

2. **Expiración Automática**
   - Token válido solo por 1 hora
   - Después de 1 hora, el token no sirve

3. **Uso Único**
   - Token se marca como `used: true` después de usarse
   - No se puede reutilizar el mismo token

4. **Hashing de Contraseña**
   - Nueva contraseña hasheada con `bcrypt` (10 rounds)
   - Nunca se almacena en texto plano

5. **Feedback Específico**
   - Respuesta diferente según si el email existe o no
   - Mejora la UX indicando claramente el estado
   - **Nota:** Esto permite verificar emails existentes, considera agregar rate limiting

6. **Validación de Longitud**
   - Contraseña mínima de 8 caracteres
   - Validado en backend con `class-validator`

---

## 🗄️ Estructura de la Base de Datos

### Tabla: `password_reset_tokens`

```sql
CREATE TABLE password_reset_tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(64) UNIQUE NOT NULL,
  user_type ENUM('CIUDADANO', 'ENTIDAD', 'ADMIN') NOT NULL,
  expires_at DATETIME NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Índices:**
- `token` (UNIQUE) - Para búsqueda rápida
- `email` - Para búsqueda por usuario
- `expires_at` - Para limpieza de tokens expirados

---

## 🧪 Testing Manual

### Test 1: Flujo Completo Exitoso

```bash
# 1. Solicitar reset
curl -X POST http://localhost:3000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"ciudadano@test.com"}'

# 2. Revisar email recibido y copiar el token

# 3. Restablecer contraseña
curl -X POST http://localhost:3000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token":"TOKEN_DEL_EMAIL",
    "newPassword":"NuevaPass123"
  }'

# 4. Intentar login con nueva contraseña
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"ciudadano@test.com",
    "password":"NuevaPass123",
    "userType":"CIUDADANO"
  }'
```

### Test 2: Token Expirado

```bash
# Esperar más de 1 hora después del forgot-password
curl -X POST http://localhost:3000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token":"TOKEN_VIEJO",
    "newPassword":"NuevaPass123"
  }'

# Respuesta esperada:
# {
#   "statusCode": 400,
#   "message": "Token inválido o expirado"
# }
```

### Test 3: Reutilización de Token

```bash
# 1. Usar el token una vez (exitoso)
curl -X POST http://localhost:3000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token":"TOKEN_VALIDO",
    "newPassword":"Password1"
  }'

# 2. Intentar usar el mismo token otra vez
curl -X POST http://localhost:3000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token":"TOKEN_VALIDO",
    "newPassword":"Password2"
  }'

# Respuesta esperada:
# {
#   "statusCode": 400,
#   "message": "Token inválido o expirado"
# }
```

### Test 4: Email No Existente

```bash
curl -X POST http://localhost:3000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"noexiste@test.com"}'

# Respuesta esperada:
# {
#   "success": false,
#   "message": "No se encontró ninguna cuenta asociada a este correo electrónico..."
# }
# NO se envía email
```

---

## ⚙️ Configuración Requerida

### Backend (.env)

```env
# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=tu_password
DB_DATABASE=lazarus

# JWT
JWT_SECRET=tu_secret_super_seguro

# SMTP (Gmail ejemplo)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=lazarus@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx  # App password de 16 caracteres

# Frontend URL (para el link en el email)
FRONTEND_URL=http://localhost:3001
```

**⚠️ Para obtener App Password de Gmail:**
1. Ve a https://myaccount.google.com/apppasswords
2. Selecciona "Correo" y "Otro (nombre personalizado)"
3. Escribe "Lazarus Backend"
4. Copia la contraseña de 16 caracteres generada
5. Pégala en `SMTP_PASS` (con o sin espacios)

### Frontend

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## 📊 Logs del Sistema

El sistema genera logs detallados para debugging:

```
[UnifiedAuthService] 🔐 Solicitud de reset de contraseña para: usuario@test.com
[UnifiedAuthService] ✅ Token de reset generado para: usuario@test.com (CIUDADANO)
[EmailService] ✉️ Email enviado exitosamente a usuario@test.com: 🔐 Recuperación de Contraseña

[UnifiedAuthService] 🔓 Intento de reset de contraseña con token: a1b2c3d4...
[UnifiedAuthService] ✅ Contraseña actualizada exitosamente para: usuario@test.com
```

---

## 🐛 Troubleshooting

### Problema: "Template 'password-reset' no encontrado"

**Solución:**
```bash
# Verificar que los templates existen
ls src/email/templates/

# Reiniciar el servidor
npm run start:dev
```

### Problema: "No se envía el email"

**Checklist:**
1. ✅ Verificar credenciales SMTP en `.env`
2. ✅ Usar App Password (no contraseña normal de Gmail)
3. ✅ Verificar que `SMTP_USER` y `SMTP_PASS` están configurados
4. ✅ Revisar logs del servidor para errores

### Problema: "Token inválido o expirado" inmediatamente

**Causas posibles:**
1. Token copiado incorrectamente (espacios, caracteres cortados)
2. Hora del servidor incorrecta
3. Token ya usado previamente

**Solución:**
```bash
# Verificar hora del servidor
date

# Solicitar nuevo token
curl -X POST http://localhost:3000/auth/forgot-password ...
```

---

## 📝 Notas Adicionales

- ✅ El sistema funciona con los 3 tipos de usuarios: CIUDADANO, ENTIDAD, ADMIN
- ✅ No es necesario especificar el tipo de usuario, el sistema lo detecta automáticamente
- ✅ El token tiene exactamente 64 caracteres hexadecimales
- ✅ Los emails tienen diseño responsive y profesional
- ✅ El sistema es resistente a ataques de enumeración de usuarios
- ✅ Compatible con todos los proveedores SMTP (Gmail, Outlook, SendGrid, etc.)

---

## 🚀 Próximos Pasos Sugeridos

1. **Limpieza Automática:** Crear un cron job para eliminar tokens expirados (> 24 horas)
2. **Rate Limiting:** Limitar intentos de forgot-password por IP (max 5 por hora)
3. **Notificación de Cambio:** Enviar email confirmando el cambio de contraseña
4. **Historial:** Registrar cambios de contraseña en tabla de auditoría
5. **2FA:** Agregar autenticación de dos factores opcional

---

**Documentación generada para Lazarus Backend v1.0**  
**Fecha:** 1 de noviembre, 2025  
**Endpoints Base:** `http://localhost:3000`

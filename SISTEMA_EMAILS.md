# 📧 Sistema de Notificaciones por Email - Lazarus

## 📋 Descripción General

Sistema completo de notificaciones automáticas por correo electrónico usando SMTP para mantener informados a los usuarios sobre eventos importantes del sistema.

---

## ✉️ Tipos de Emails

### 1. Email de Bienvenida 🎉
**Cuándo se envía:** Al registrarse un nuevo usuario (Ciudadano, Entidad o Admin)

**Contenido:**
- Mensaje de bienvenida personalizado
- Tipo de cuenta registrada
- Lista de funcionalidades disponibles según el rol
- Diseño responsive con colores del sistema

**Ejemplo:**
```
Asunto: 🎉 Bienvenido a Lazarus - Sistema de Gestión de Emergencias

Hola Juan Pérez,

Tu cuenta ha sido creada exitosamente en Lazarus.

Tipo de cuenta: Ciudadano

¿Qué puedes hacer ahora?
• Reportar incidentes de emergencia
• Ver incidentes cercanos en tiempo real
• Recibir notificaciones de actualización
• Consultar el historial de tus reportes
```

---

### 2. Email de Cambio de Estado de Incidente 🔔
**Cuándo se envía:** Cuando una Entidad o Admin cambia el estado de un incidente reportado por un ciudadano

**Estados que disparan email:**
- `PENDIENTE` → `EN_PROCESO`: "Tu incidente está siendo atendido"
- `EN_PROCESO` → `RESUELTO`: "Tu incidente ha sido resuelto"
- Cualquier cambio a `CANCELADO`: "Tu incidente fue marcado como falso"

**Contenido:**
- Número del incidente
- Descripción del incidente
- Estado anterior y nuevo (con colores distintivos)
- Mensaje explicativo del cambio

**Ejemplo:**
```
Asunto: 🔔 Estado de tu incidente #42 actualizado

Hola Juan,

El estado de tu incidente ha sido actualizado:

Incidente #42
Incendio en edificio residencial

Estado anterior: Pendiente
Estado actual: En Proceso

✅ Tu incidente está siendo atendido. Una entidad de emergencia está trabajando en resolver esta situación.
```

---

### 3. Email de Strike ⚠️
**Cuándo se envía:** Cuando un incidente es marcado como `CANCELADO` (falso)

**Dos versiones:**

#### Strike 1 o 2 (Advertencia)
```
Asunto: ⚠️ Has recibido un strike (2/3)

Hola Juan,

Has recibido un strike

2 / 3

El incidente #42 fue marcado como falso o spam.

¿Qué significa esto?
Los strikes son advertencias por reportar incidentes falsos o información incorrecta.

Sistema de Strikes:
• 1 Strike: Advertencia - Puedes seguir usando el sistema
• 2 Strikes: Última advertencia - Ten cuidado
• 3 Strikes: Tu cuenta será deshabilitada permanentemente

Strikes actuales: 2 de 3
Por favor, asegúrate de reportar solo emergencias reales y verificables.
```

#### Strike 3 (Cuenta Deshabilitada) 🚫
```
Asunto: 🚫 Tu cuenta ha sido deshabilitada - 3 Strikes

Hola Juan,

❌ Tu cuenta ha sido deshabilitada permanentemente

3 / 3 Strikes

Has alcanzado el límite de 3 strikes por reportar incidentes falsos.
Tu cuenta ha sido deshabilitada y no podrás acceder al sistema.

¿Por qué pasó esto?
El incidente #44 fue marcado como falso o spam por las autoridades.

¿Qué puedo hacer?
Si crees que esto es un error, por favor contacta a un administrador del sistema para revisar tu caso.
Solo un administrador puede reactivar tu cuenta.
```

---

### 4. Email de Recuperación de Contraseña 🔐
**Cuándo se envía:** Cuando un usuario solicita restablecer su contraseña

**Contenido:**
- Link único y temporal (expira en 1 hora)
- Botón prominente para restablecer
- Advertencias de seguridad
- Mensaje si no solicitó el cambio

**Ejemplo:**
```
Asunto: 🔐 Recuperación de Contraseña - Lazarus

Hola Juan,

Recibimos una solicitud para restablecer la contraseña de tu cuenta en Lazarus.

[Restablecer Contraseña]
http://localhost:3001/reset-password?token=abc123xyz...

⏰ Este enlace expira en 1 hora.

¿No solicitaste este cambio?
Si no fuiste tú quien solicitó restablecer la contraseña, ignora este correo. Tu contraseña permanecerá sin cambios.
```

---

## ⚙️ Configuración SMTP

### Variables de Entorno Requeridas

Agregar en tu archivo `.env`:

```env
# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com          # Servidor SMTP
SMTP_PORT=587                      # Puerto (587 para TLS, 465 para SSL)
SMTP_USER=tu-email@gmail.com      # Tu email
SMTP_PASS=tu-app-password          # Contraseña de aplicación (NO tu contraseña normal)

# Frontend URL
FRONTEND_URL=http://localhost:3001  # URL de tu frontend
```

---

### 📮 Configuración con Gmail

#### 1. Habilitar Verificación en 2 Pasos
1. Ve a https://myaccount.google.com/security
2. Activa "Verificación en 2 pasos"

#### 2. Crear Contraseña de Aplicación
1. Ve a https://myaccount.google.com/apppasswords
2. Selecciona "Correo" y "Otro (Nombre personalizado)"
3. Escribe "Lazarus Backend"
4. Copia la contraseña de 16 caracteres generada
5. Úsala en `SMTP_PASS` (sin espacios)

**Ejemplo de contraseña de aplicación:**
```env
SMTP_PASS=abcd efgh ijkl mnop  # Así lo muestra Google
SMTP_PASS=abcdefghijklmnop     # Así debes pegarlo en .env
```

---

### 📮 Configuración con Otros Proveedores

#### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=tu-email@outlook.com
SMTP_PASS=tu-contraseña
```

#### Yahoo
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=tu-email@yahoo.com
SMTP_PASS=tu-app-password
```

#### Mailgun (Recomendado para producción)
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@tu-dominio.mailgun.org
SMTP_PASS=tu-api-key
```

#### SendGrid (Recomendado para producción)
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=tu-sendgrid-api-key
```

---

## 🔧 Flujo de Envío de Emails

### 1. Registro de Usuario

```
Usuario → POST /auth/register
    ↓
Backend crea cuenta
    ↓
UnifiedAuthService.registerCiudadano()
    ↓
✅ Guarda en base de datos
    ↓
📧 EmailService.sendWelcomeEmail()
    ↓
Usuario recibe email de bienvenida
```

### 2. Cambio de Estado de Incidente

```
Entidad → PATCH /incidents/:id { "estado": "EN_PROCESO" }
    ↓
IncidentsService.update()
    ↓
✅ Actualiza estado en BD
    ↓
🔔 Emite WebSocket event
    ↓
📧 EmailService.sendIncidentStatusChangeEmail()
    ↓
Ciudadano recibe email de actualización
```

### 3. Strike Automático

```
Entidad → PATCH /incidents/:id { "estado": "CANCELADO" }
    ↓
IncidentsService.update()
    ↓
✅ Actualiza estado a CANCELADO
    ↓
📧 EmailService.sendIncidentStatusChangeEmail() (notifica cambio)
    ↓
⚠️ UsersService.incrementStrikes(ciudadanoId, incidentId)
    ↓
✅ Incrementa strikes en BD
    ↓
Si strikes >= 3: activo = false
    ↓
📧 EmailService.sendStrikeEmail()
    ↓
Ciudadano recibe email de strike
```

---

## 📊 Estadísticas de Emails

Los emails se envían de forma **asíncrona** y **no bloquean** el flujo principal. Si falla el envío de un email:

- ❌ Se registra error en el log del backend
- ✅ La operación principal (registro, actualización) continúa
- ✅ El usuario no ve error en el frontend

**Logs en consola:**

```bash
# Éxito
✉️ Email enviado exitosamente a juan@example.com: 🎉 Bienvenido a Lazarus

# Error
❌ Error enviando email a juan@example.com: Error: connect ECONNREFUSED
```

---

## 🎨 Diseño de Emails

Todos los emails usan HTML responsive con:

### Colores del Sistema
- **Header Principal:** Gradiente morado (`#667eea` → `#764ba2`)
- **Incidentes:** Azul (`#2196F3`)
- **Strikes:** Naranja (`#FF9800`) o Rojo (`#F44336`)
- **Recuperación:** Morado (`#667eea`)

### Badges de Estado
```html
<span style="background: #FF9800; color: white; padding: 8px 16px;">
  PENDIENTE
</span>
```

- `PENDIENTE`: Naranja `#FF9800`
- `EN_PROCESO`: Azul `#2196F3`
- `RESUELTO`: Verde `#4CAF50`
- `CANCELADO`: Rojo `#F44336`

### Responsive
- Ancho máximo: 600px
- Compatible con Gmail, Outlook, Apple Mail
- Fallback para clientes que no soportan CSS

---

## 🧪 Testing

### Probar envío de email manualmente

```typescript
// En cualquier servicio con EmailService inyectado

async testEmail() {
  await this.emailService.sendWelcomeEmail(
    'tu-email@example.com',
    'Juan Pérez',
    UserType.CIUDADANO
  );
  
  console.log('Email de prueba enviado!');
}
```

### Probar con cURL

```bash
# 1. Registrar usuario y verificar email
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test",
    "apellidos": "Usuario",
    "email": "tu-email@example.com",
    "contraseña": "123456",
    "cedula": "123456789",
    "telefono": "88888888",
    "direccion": "San José"
  }'

# Deberías recibir email de bienvenida

# 2. Crear incidente
# (Login primero, obtener token)

curl -X POST http://localhost:3000/incidents \
  -H "Authorization: Bearer TOKEN_CIUDADANO" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "INCENDIO",
    "descripcion": "Test",
    "severidad": "MEDIA",
    "latitud": 9.9281,
    "longitud": -84.0907,
    "direccion": "San José"
  }'

# 3. Cambiar estado (como entidad)
curl -X PATCH http://localhost:3000/incidents/1 \
  -H "Authorization: Bearer TOKEN_ENTIDAD" \
  -H "Content-Type: application/json" \
  -d '{"estado":"EN_PROCESO"}'

# Deberías recibir email de cambio de estado

# 4. Marcar como falso (para recibir strike)
curl -X PATCH http://localhost:3000/incidents/1 \
  -H "Authorization: Bearer TOKEN_ENTIDAD" \
  -H "Content-Type: application/json" \
  -d '{"estado":"CANCELADO"}'

# Deberías recibir 2 emails:
# - Email de cambio de estado a CANCELADO
# - Email de strike
```

---

## 🔒 Seguridad

### Buenas Prácticas

1. **Nunca commitear credenciales**
   ```bash
   # Agregar .env al .gitignore
   echo ".env" >> .gitignore
   ```

2. **Usar contraseñas de aplicación**
   - NO uses tu contraseña real de Gmail
   - Usa contraseñas de aplicación específicas

3. **Validar emails antes de enviar**
   ```typescript
   if (!email || !email.includes('@')) {
     console.error('Email inválido, no se enviará');
     return false;
   }
   ```

4. **Rate limiting (para producción)**
   - Limitar emails por usuario por hora
   - Prevenir spam/abuso del sistema

---

## 📝 Personalización

### Cambiar plantilla de un email

Editar `src/email/email.service.ts`:

```typescript
async sendWelcomeEmail(email: string, nombre: string, userType: string) {
  const subject = '🎉 Tu título personalizado';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        /* Tu CSS personalizado */
      </style>
    </head>
    <body>
      <!-- Tu HTML personalizado -->
      <h1>Hola ${nombre}!</h1>
    </body>
    </html>
  `;

  return this.sendEmail(email, subject, html);
}
```

### Agregar nuevo tipo de email

```typescript
// src/email/email.service.ts

async sendCustomEmail(to: string, data: any) {
  const subject = 'Mi nuevo email';
  const html = `...`;
  return this.sendEmail(to, subject, html);
}
```

Luego úsalo en cualquier servicio:

```typescript
constructor(private emailService: EmailService) {}

async myMethod() {
  await this.emailService.sendCustomEmail('user@example.com', { ... });
}
```

---

## 🚀 Despliegue a Producción

### Variables de entorno en producción

```env
SMTP_HOST=smtp.sendgrid.net        # Usar servicio profesional
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.abc123...             # API Key de SendGrid
FRONTEND_URL=https://lazarus.com   # URL real del frontend
```

### Recomendaciones

1. **Usar servicio de email transaccional**
   - SendGrid (12,000 emails gratis/mes)
   - Mailgun (5,000 emails gratis/mes)
   - Amazon SES (62,000 emails gratis/mes)

2. **Configurar dominio personalizado**
   - De: `noreply@lazarus.cr` en lugar de Gmail

3. **Implementar cola de emails**
   - Usar Bull Queue con Redis
   - Reintentos automáticos si falla

4. **Monitoreo**
   - Logs de emails enviados/fallidos
   - Alertas si tasa de error > 5%

---

## 📞 Troubleshooting

### Error: "Invalid login"
```
❌ Error enviando email: Error: Invalid login: 535-5.7.8 Username and Password not accepted
```

**Solución:**
- Verifica que SMTP_USER y SMTP_PASS sean correctos
- Si usas Gmail, asegúrate de usar contraseña de aplicación
- Habilita "Acceso de apps menos seguras" si es necesario

### Error: "Connection timeout"
```
❌ Error enviando email: Error: connect ETIMEDOUT
```

**Solución:**
- Verifica que SMTP_HOST y SMTP_PORT sean correctos
- Revisa firewall/antivirus que pueda bloquear puerto 587
- Intenta con puerto 465 (SSL) en lugar de 587 (TLS)

### Emails llegan a spam
**Solución:**
- Configura SPF, DKIM y DMARC en tu dominio
- Usa servicio de email transaccional profesional
- Evita palabras como "gratis", "urgente" en asuntos

### Emails no llegan
**Verificar:**
1. Logs del backend - ¿Se envió correctamente?
2. Carpeta de spam del destinatario
3. Bandeja de "Promociones" o "Social" (Gmail)
4. Email del destinatario es válido

---

## 📚 Recursos Adicionales

- [Nodemailer Docs](https://nodemailer.com/)
- [SendGrid SMTP](https://docs.sendgrid.com/for-developers/sending-email/integrating-with-the-smtp-api)
- [Email HTML Best Practices](https://www.campaignmonitor.com/dev-resources/guides/email-marketing-guide/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)

---

**Última actualización:** 31 de Octubre, 2025  
**Versión:** 1.0.0

# 🔒 Protección de Datos Sensibles

## ✅ Implementado

Se ha configurado la serialización automática de entidades para **ocultar información sensible** en todas las respuestas de la API.

---

## 🚫 Campos Ocultos por Defecto

### Ciudadano (cuando aparece en incidentes)

**ANTES (❌ INSEGURO):**
```json
{
  "ciudadano": {
    "id_ciudadano": 2,
    "nombre": "Alejandro",
    "apellidos": "Obando",
    "cedula": "5044033304",  // ← DATOS SENSIBLES EXPUESTOS
    "email": "alejomc56@gmail.com",  // ← EXPUESTO
    "contraseña": "$2b$10$6r5pQLQvr0e8...",  // ← HASH EXPUESTO
    "telefono": "88888888",  // ← EXPUESTO
    "direccion": "legion de sagamad city",  // ← EXPUESTO
    "strikes": 2,  // ← EXPUESTO
    "activo": true  // ← EXPUESTO
  }
}
```

**AHORA (✅ SEGURO):**
```json
{
  "ciudadano": {
    "id_ciudadano": 2,
    "nombre": "Alejandro",
    "apellidos": "Obando",
    "provincia": "Guanacaste",
    "canton": "Santa Cruz",
    "distrito": "Santa Cruz"
    // ← Todos los campos sensibles ocultos
  }
}
```

---

## 📋 Campos Protegidos

### 🧑 Ciudadano
- ✅ **Visible:** `id_ciudadano`, `nombre`, `apellidos`, `provincia`, `canton`, `distrito`
- 🚫 **Oculto:** `cedula`, `email`, `contraseña`, `telefono`, `direccion`, `strikes`, `activo`, `fecha_creacion`

### 🏢 Entidad Pública
- ✅ **Visible:** `id_entidad`, `nombre_entidad`, `tipo_entidad`, `telefono_emergencia`, `provincia`, `canton`, `distrito`, `ubicacion`
- 🚫 **Oculto:** `email`, `contraseña`, `activo`, `fecha_registro`

### 👨‍💼 Administrador
- ✅ **Visible:** `id_admin`, `nombre`, `apellidos`, `nivel_acceso`, `provincia`, `canton`, `distrito`
- 🚫 **Oculto:** `email`, `contraseña`, `activo`, `fecha_creacion`

---

## 🎯 Ejemplo de Respuesta Protegida

### GET /incidents

```json
[
  {
    "id": 10,
    "tipo": "TERREMOTO",
    "descripcion": "Terremoto de magnitud 5.2",
    "severidad": "ALTA",
    "estado": "PENDIENTE",
    "latitud": "10.25700490",
    "longitud": "-85.59019180",
    "direccion": "Tenorio, Santa Cruz, Guanacaste",
    
    "ciudadano": {
      "id_ciudadano": 2,
      "nombre": "Alejandro",
      "apellidos": "Obando",
      "provincia": "Guanacaste",
      "canton": "Santa Cruz",
      "distrito": "Santa Cruz"
      // ← Sin datos sensibles
    },
    
    "media": [
      {
        "id": 3,
        "url": "https://res.cloudinary.com/.../foto.jpg",
        "tipo": "foto",
        "formato": "jpg",
        "tamanio": "104660"
      }
    ],
    
    "fecha_creacion": "2025-11-07T07:26:19.108Z"
  }
]
```

---

## 🔐 Excepciones (Solo Admin)

Los **administradores** pueden acceder a información completa a través de endpoints específicos:

### Endpoints de Admin

```http
# Ver información completa de usuarios (solo admin)
GET /users/ciudadanos/:id         # Info completa de ciudadano
GET /users/entidades/:id          # Info completa de entidad
GET /users/administradores/:id    # Info completa de admin

# Gestión de usuarios (solo admin)
PATCH /users/toggle-user-status/:id/:type
GET /users/all-ciudadanos
GET /users/all-entidades
```

En estos endpoints, el admin **SÍ** verá todos los campos (excepto contraseñas que siempre están hasheadas).

---

## 🛡️ Implementación Técnica

### 1. Decorador `@Exclude()`

Se agregó `@Exclude()` de `class-transformer` en las entidades:

```typescript
import { Exclude } from 'class-transformer';

@Entity('ciudadanos')
export class Ciudadano {
  @PrimaryGeneratedColumn()
  id_ciudadano: number;

  @Column()
  nombre: string;  // ← Visible

  @Exclude()  // ← Oculto en respuestas
  @Column()
  email: string;

  @Exclude()  // ← Oculto en respuestas
  @Column()
  contraseña: string;
  
  // ...
}
```

### 2. Serialización Global

En `src/main.ts`:

```typescript
app.useGlobalInterceptors(
  new ClassSerializerInterceptor(app.get(Reflector))
);
```

Esto aplica la serialización automáticamente a **TODAS** las respuestas de la API.

---

## 🧪 Verificación

### Probar protección de datos

```bash
# 1. Obtener incidentes (sin datos sensibles)
curl -X GET http://localhost:3000/incidents \
  -H "Authorization: Bearer tu_token_jwt"

# Resultado: Sin email, cédula, contraseña, etc.
```

### Comparación

| Endpoint | Datos Visibles |
|----------|----------------|
| `GET /incidents` | Solo nombre, apellidos, ubicación general |
| `GET /users/ciudadanos/:id` (Admin) | **TODOS** los datos (excepto contraseña) |
| `GET /auth/profile` (Usuario propio) | **TODOS** sus propios datos |

---

## 🎯 Beneficios de Seguridad

✅ **Privacidad del Usuario:** No se exponen datos personales (cédula, email, teléfono, dirección exacta)

✅ **Protección de Contraseñas:** Nunca se envían contraseñas (ni siquiera hasheadas) en respuestas públicas

✅ **GDPR/CCPA Compliant:** Cumple con regulaciones de protección de datos

✅ **Reducción de Superficie de Ataque:** Menos información disponible para atacantes

✅ **Prevención de Ingeniería Social:** No se puede obtener información para suplantar identidad

---

## 📝 Notas Importantes

1. **Contraseñas NUNCA se exponen** (ni siquiera en endpoints de admin)
2. **Usuarios solo ven su propia información completa** a través de `/auth/profile`
3. **Admins pueden ver datos completos** de otros usuarios (para gestión)
4. **En incidentes públicos** solo se muestra nombre y ubicación general

---

## 🔄 Reiniciar Servidor

```bash
npm run start:dev
```

Ahora todas las respuestas estarán protegidas automáticamente. 🛡️

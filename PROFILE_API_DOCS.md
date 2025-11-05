# API de Perfil de Usuario

Sistema completo de gestión de perfiles para cualquier tipo de usuario (Ciudadano, Entidad Pública, Administrador) en Lazarus.

## 📋 Endpoints Disponibles

### 1. Obtener Perfil del Usuario Autenticado

**GET** `/auth/profile`

Obtiene toda la información del perfil del usuario que está autenticado.

**Headers requeridos:**
```
Authorization: Bearer <jwt_token>
```

**Respuesta exitosa (200):**

Para **Ciudadano**:
```json
{
  "id": 1,
  "nombre": "Juan",
  "apellidos": "Pérez López",
  "email": "juan@example.com",
  "cedula": "1-2345-6789",
  "telefono": "+506 8888-8888",
  "provincia": "San José",
  "canton": "Central",
  "distrito": "Carmen",
  "direccion": "Calle 1, Avenida 2",
  "userType": "ciudadano",
  "activo": true,
  "strikes": 0,
  "fecha_creacion": "2025-01-15T10:30:00.000Z",
  "fecha_actualizacion": "2025-01-15T10:30:00.000Z"
}
```

Para **Entidad Pública**:
```json
{
  "id": 2,
  "nombre_entidad": "Bomberos Central",
  "tipo_entidad": "BOMBEROS",
  "email": "bomberos@example.com",
  "telefono_emergencia": "911",
  "provincia": "San José",
  "canton": "Central",
  "distrito": "Carmen",
  "ubicacion": "Avenida Central, Calle 5",
  "userType": "entidad_publica",
  "activo": true,
  "fecha_creacion": "2025-01-15T10:30:00.000Z",
  "fecha_actualizacion": "2025-01-15T10:30:00.000Z"
}
```

Para **Administrador**:
```json
{
  "id": 3,
  "nombre": "María",
  "apellidos": "González Rojas",
  "email": "admin@lazarus.com",
  "provincia": "San José",
  "canton": "Central",
  "distrito": "Carmen",
  "nivel_acceso": "ADMIN",
  "userType": "administrador",
  "activo": true,
  "fecha_creacion": "2025-01-15T10:30:00.000Z",
  "fecha_actualizacion": "2025-01-15T10:30:00.000Z"
}
```

**Errores posibles:**
- `401 Unauthorized` - Token JWT inválido o expirado
- `404 Not Found` - Usuario no encontrado

---

### 2. Actualizar Perfil del Usuario Autenticado

**PATCH** `/auth/profile`

Actualiza la información del perfil del usuario autenticado. Solo actualiza los campos que se envíen en el body.

**Headers requeridos:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body de la petición:**

Para **Ciudadano** (campos permitidos):
```json
{
  "nombre": "Juan Carlos",
  "apellidos": "Pérez López",
  "telefono": "+506 9999-9999",
  "provincia": "Alajuela",
  "canton": "Central",
  "distrito": "Alajuela",
  "direccion": "Nueva dirección, casa 123"
}
```

Para **Entidad Pública** (campos permitidos):
```json
{
  "nombre_entidad": "Bomberos Central Actualizado",
  "telefono_emergencia": "911",
  "provincia": "San José",
  "canton": "Escazú",
  "distrito": "Escazú Centro",
  "ubicacion": "Nueva ubicación de la estación"
}
```

Para **Administrador** (campos permitidos):
```json
{
  "nombre": "María José",
  "apellidos": "González Rojas",
  "provincia": "Cartago",
  "canton": "Central",
  "distrito": "Oriental"
}
```

**Respuesta exitosa (200):**
Retorna el perfil completo actualizado (mismo formato que GET /auth/profile)

**Errores posibles:**
- `400 Bad Request` - No hay campos válidos para actualizar
- `401 Unauthorized` - Token JWT inválido o expirado
- `404 Not Found` - Usuario no encontrado

---

## 🔒 Seguridad

- **Autenticación JWT requerida**: Ambos endpoints requieren un token JWT válido
- **Campos protegidos**: No se pueden actualizar campos sensibles:
  - ❌ Email (inmutable)
  - ❌ Cédula (inmutable)
  - ❌ Tipo de entidad (inmutable)
  - ❌ Nivel de acceso (solo administrador puede cambiar)
  - ❌ Estado activo (solo administrador puede cambiar)
  - ❌ Strikes (solo el sistema puede incrementar)

- **Validación por tipo de usuario**: Solo se permiten actualizar campos específicos según el tipo de usuario
- **Auto-actualización**: Los usuarios solo pueden modificar su propio perfil

---

## 📝 Ejemplos de Uso

### Ejemplo con cURL

**Obtener perfil:**
```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Actualizar perfil:**
```bash
curl -X PATCH http://localhost:3000/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Carlos",
    "telefono": "+506 9999-9999"
  }'
```

### Ejemplo con JavaScript (Fetch API)

```javascript
// Obtener perfil
const getProfile = async () => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch('http://localhost:3000/auth/profile', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (response.ok) {
    const profile = await response.json();
    console.log('Perfil:', profile);
    return profile;
  }
};

// Actualizar perfil
const updateProfile = async (updateData) => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch('http://localhost:3000/auth/profile', {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updateData)
  });
  
  if (response.ok) {
    const updatedProfile = await response.json();
    console.log('Perfil actualizado:', updatedProfile);
    return updatedProfile;
  }
};

// Uso
getProfile();
updateProfile({ nombre: 'Juan Carlos', telefono: '+506 9999-9999' });
```

### Ejemplo con Axios

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

// Interceptor para agregar el token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Obtener perfil
export const getProfile = async () => {
  const { data } = await api.get('/auth/profile');
  return data;
};

// Actualizar perfil
export const updateProfile = async (updateData) => {
  const { data } = await api.patch('/auth/profile', updateData);
  return data;
};
```

### Ejemplo con React Hook

```typescript
import { useState, useEffect } from 'react';

interface Profile {
  id: number;
  nombre?: string;
  apellidos?: string;
  nombre_entidad?: string;
  email: string;
  userType: 'ciudadano' | 'entidad_publica' | 'administrador';
  activo: boolean;
  // ... otros campos
}

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('http://localhost:3000/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Error al obtener perfil');
      
      const data = await response.json();
      setProfile(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updateData: Partial<Profile>) => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('http://localhost:3000/auth/profile', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) throw new Error('Error al actualizar perfil');
      
      const data = await response.json();
      setProfile(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return { profile, loading, error, updateProfile, refetch: fetchProfile };
};

// Uso en componente
const ProfileComponent = () => {
  const { profile, loading, updateProfile } = useProfile();

  const handleUpdate = async () => {
    try {
      await updateProfile({
        nombre: 'Nuevo nombre',
        telefono: '+506 9999-9999'
      });
      alert('Perfil actualizado');
    } catch (error) {
      alert('Error al actualizar');
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (!profile) return <div>No se encontró el perfil</div>;

  return (
    <div>
      <h1>Perfil de {profile.nombre || profile.nombre_entidad}</h1>
      <p>Email: {profile.email}</p>
      <p>Tipo: {profile.userType}</p>
      <button onClick={handleUpdate}>Actualizar perfil</button>
    </div>
  );
};
```

---

## 🎯 Notas Importantes

1. **Actualización parcial**: Solo envía los campos que quieras actualizar, no necesitas enviar todo el objeto
2. **Validación automática**: Todos los campos se validan automáticamente con class-validator
3. **Tipo de usuario detectado**: El sistema detecta automáticamente el tipo de usuario desde el JWT
4. **Fechas automáticas**: `fecha_actualizacion` se actualiza automáticamente en cada cambio
5. **Logs del sistema**: Todas las actualizaciones se registran en los logs del servidor

---

## 🔄 Flujo Completo

1. Usuario se autentica con POST /auth/login
2. Recibe token JWT con userId y userType
3. Usa el token para GET /auth/profile (ver sus datos)
4. Envía PATCH /auth/profile con los campos a actualizar
5. Recibe el perfil actualizado en la respuesta

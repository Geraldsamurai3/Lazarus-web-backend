# 🌐 Configuración CORS - Frontend + Backend

## 📡 Estado del Backend (Railway)

### Configuración CORS Actual:
```typescript
origin: función dinámica que acepta CUALQUIER origen
credentials: true ✅
methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
allowedHeaders: Content-Type, Authorization, Accept
```

**✅ El backend está configurado para aceptar peticiones de cualquier dominio con credentials.**

---

## 🎯 Configuración Requerida en el Frontend

### 1. Variable de Entorno

Crea o edita `.env.local` en tu proyecto Next.js:

```env
NEXT_PUBLIC_API_URL=https://lazarus-web-backend-production.up.railway.app
```

**⚠️ IMPORTANTE:** 
- Debe empezar con `NEXT_PUBLIC_` para que esté disponible en el navegador
- Debe incluir `https://` al inicio
- NO debe terminar con `/`

---

### 2. Archivo de Configuración API

**Ubicación:** `lib/api.ts` o `services/api.ts`

```typescript
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://lazarus-web-backend-production.up.railway.app';

console.log('API_URL configurada:', API_URL); // Para debugging

export async function apiRequest(
  endpoint: string, 
  options: RequestInit = {}
): Promise<Response> {
  const url = `${API_URL}${endpoint}`;
  
  console.log('📡 Fetching:', url); // Para debugging

  const config: RequestInit = {
    ...options,
    credentials: 'include', // ✅ CRÍTICO - Envía cookies y permite Authorization header
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }
    
    return response;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}

// Helper methods
export const api = {
  get: (endpoint: string, options?: RequestInit) => 
    apiRequest(endpoint, { ...options, method: 'GET' }),
  
  post: (endpoint: string, data?: any, options?: RequestInit) => 
    apiRequest(endpoint, { 
      ...options, 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
  
  patch: (endpoint: string, data?: any, options?: RequestInit) => 
    apiRequest(endpoint, { 
      ...options, 
      method: 'PATCH', 
      body: JSON.stringify(data) 
    }),
  
  delete: (endpoint: string, options?: RequestInit) => 
    apiRequest(endpoint, { ...options, method: 'DELETE' }),
};
```

---

### 3. Servicio de Autenticación

**Ubicación:** `lib/services/auth.service.ts`

```typescript
// lib/services/auth.service.ts
import { api } from '../api';

export const authService = {
  async login(email: string, password: string) {
    console.log('🔐 Intentando login con:', { email });
    
    const response = await api.post('/auth/login', {
      email,
      contraseña: password, // ← Nombre del campo en el backend
    });

    const data = await response.json();
    
    // Guardar token en localStorage
    if (data.access_token) {
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return data;
  },

  async register(userData: {
    nombre: string;
    apellidos: string;
    email: string;
    contraseña: string;
    cedula: string;
    telefono: string;
    provincia: string;
    canton: string;
    distrito: string;
    direccion: string;
  }) {
    const response = await api.post('/auth/register', userData);
    const data = await response.json();
    
    if (data.access_token) {
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return data;
  },

  async getProfile() {
    const token = localStorage.getItem('access_token');
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/profile`,
      {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    return response.json();
  },

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },

  getToken() {
    return localStorage.getItem('access_token');
  },

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};
```

---

### 4. Hook de Autenticación (Opcional)

**Ubicación:** `hooks/useAuth.ts`

```typescript
// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { authService } from '@/lib/services/auth.service';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = authService.getUser();
    setUser(storedUser);
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await authService.login(email, password);
      setUser(data.user);
      return data;
    } catch (error) {
      console.error('❌ Error en login:', error);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };
}
```

---

## 🔑 Puntos Críticos

### ✅ LO QUE DEBE ESTAR SIEMPRE:

1. **`credentials: 'include'`** en TODAS las peticiones fetch
2. **URL completa con `https://`** en NEXT_PUBLIC_API_URL
3. **`contraseña`** (no `password`) en el body del login
4. **`Authorization: Bearer ${token}`** en headers para endpoints protegidos

### ❌ ERRORES COMUNES:

```typescript
// ❌ INCORRECTO
fetch('lazarus-web-backend-production.up.railway.app/auth/login') // Sin https://

// ❌ INCORRECTO
fetch(url) // Sin credentials: 'include'

// ❌ INCORRECTO
body: JSON.stringify({ email, password }) // Backend espera "contraseña"

// ✅ CORRECTO
fetch('https://lazarus-web-backend-production.up.railway.app/auth/login', {
  credentials: 'include',
  body: JSON.stringify({ email, contraseña: password })
})
```

---

## 🧪 Testing

### Verificar que funciona:

1. **Abrir consola del navegador** (F12)
2. **Ver logs**:
   ```
   API_URL configurada: https://lazarus-web-backend-production.up.railway.app
   📡 Fetching: https://lazarus-web-backend-production.up.railway.app/auth/login
   🔐 Intentando login con: { email: 'test@example.com' }
   ```

3. **Verificar Network tab**:
   - Status: `200 OK` (exitoso)
   - Response headers debe incluir: `Access-Control-Allow-Origin: http://localhost:3001`
   - Request headers debe incluir: `Content-Type: application/json`

---

## 🚀 Deploy en Vercel

Cuando despliegues tu frontend en Vercel, agrega la variable de entorno:

**Vercel Dashboard → Tu Proyecto → Settings → Environment Variables**

```
Key: NEXT_PUBLIC_API_URL
Value: https://lazarus-web-backend-production.up.railway.app
```

**⚠️ Reinicia el deployment** después de agregar la variable.

---

## 📝 Resumen

| Configuración | Valor |
|--------------|-------|
| Backend URL | `https://lazarus-web-backend-production.up.railway.app` |
| CORS Origin | Acepta cualquier origen |
| Credentials | `include` (OBLIGATORIO) |
| Content-Type | `application/json` |
| Auth Header | `Authorization: Bearer <token>` |
| Campo contraseña | `contraseña` (español) |

---

## 🆘 Troubleshooting

### Error: "CORS policy"
- ✅ Verifica que `credentials: 'include'` esté en el fetch
- ✅ Verifica que la URL tenga `https://`

### Error: "Failed to fetch"
- ✅ Verifica que Railway esté desplegado y funcionando
- ✅ Visita `https://lazarus-web-backend-production.up.railway.app` en el navegador

### Error: "404 Not Found"
- ✅ Verifica la ruta: `/auth/login` (no `/api/auth/login`)
- ✅ Verifica que NEXT_PUBLIC_API_URL no termine con `/`

### Error: "Unauthorized"
- ✅ Verifica que estés enviando `contraseña` (no `password`)
- ✅ Verifica que el email y contraseña sean correctos

---

**¡Listo para usar!** 🎉

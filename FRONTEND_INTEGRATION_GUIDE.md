# 📋 Guía de Integración Frontend - Lazarus API

## 🚀 Base URL
```javascript
const API_BASE_URL = 'http://localhost:3001';
```

## 👤 REGISTRO DE USUARIO

### Endpoint
```http
POST http://localhost:3001/auth/register
Content-Type: application/json
```

### Datos Requeridos
```json
{
  "nombre": "string",        // Requerido
  "email": "string",         // Requerido (formato email válido)
  "contraseña": "string"     // Requerido (mínimo 6 caracteres)
}
```

### Ejemplo Completo
```javascript
// Registro de usuario
const registerUser = async (userData) => {
  try {
    const response = await fetch('http://localhost:3001/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nombre: userData.nombre,
        email: userData.email,
        contraseña: userData.contraseña
      })
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error registrando usuario:', error);
    throw error;
  }
};
```

### Respuesta Exitosa (Primer Usuario - ADMIN)
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nombre": "Admin Principal",
    "email": "admin@lazarus.com",
    "rol": "ADMIN",
    "estado": "HABILITADO"
  },
  "message": "Bienvenido! Eres el primer usuario y ahora eres ADMIN."
}
```

### Respuesta Exitosa (Usuarios Posteriores - CIUDADANO)
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "rol": "CIUDADANO",
    "estado": "HABILITADO"
  },
  "message": "Registro exitoso como CIUDADANO."
}
```

## 🔐 LOGIN DE USUARIO

### Endpoint
```http
POST http://localhost:3001/auth/login
Content-Type: application/json
```

### Datos Requeridos
```json
{
  "email": "string",         // Requerido (formato email válido)
  "contraseña": "string"     // Requerido (mínimo 6 caracteres)
}
```

### Ejemplo Completo
```javascript
// Login de usuario
const loginUser = async (credentials) => {
  try {
    const response = await fetch('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: credentials.email,
        contraseña: credentials.contraseña
      })
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
};
```

## 🧪 EJEMPLOS DE PRUEBA

### 1. Registrar Primer Usuario (Se convierte en ADMIN)
```javascript
const primerusuario = {
  nombre: "Admin Principal",
  email: "admin@lazarus.com",
  contraseña: "123456"
};

registerUser(primerusuario)
  .then(response => {
    console.log('Usuario registrado:', response);
    // Guardar token: localStorage.setItem('token', response.access_token);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

### 2. Registrar Usuario Normal (Se convierte en CIUDADANO)
```javascript
const usuarioNormal = {
  nombre: "Juan Pérez",
  email: "juan@example.com",
  contraseña: "123456"
};

registerUser(usuarioNormal)
  .then(response => {
    console.log('Usuario registrado:', response);
  });
```

### 3. Login
```javascript
const credentials = {
  email: "admin@lazarus.com",
  contraseña: "123456"
};

loginUser(credentials)
  .then(response => {
    console.log('Login exitoso:', response);
    localStorage.setItem('token', response.access_token);
    localStorage.setItem('user', JSON.stringify(response.user));
  });
```

## ⚠️ POSIBLES ERRORES

### Error 400 - Bad Request
```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "contraseña must be longer than or equal to 6 characters"
  ],
  "error": "Bad Request"
}
```

### Error 409 - Conflict (Email ya existe)
```json
{
  "statusCode": 409,
  "message": "El email ya está registrado",
  "error": "Conflict"
}
```

### Error 401 - Unauthorized (Login fallido)
```json
{
  "statusCode": 401,
  "message": "Credenciales inválidas",
  "error": "Unauthorized"
}
```

## 🔧 VALIDACIONES FRONTEND

### Validar antes de enviar:
```javascript
const validateUserData = (userData) => {
  const errors = [];

  if (!userData.nombre || userData.nombre.trim() === '') {
    errors.push('El nombre es requerido');
  }

  if (!userData.email || !isValidEmail(userData.email)) {
    errors.push('Email inválido');
  }

  if (!userData.contraseña || userData.contraseña.length < 6) {
    errors.push('La contraseña debe tener al menos 6 caracteres');
  }

  return errors;
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
```

## 🎯 HOOK REACT (Ejemplo)

```javascript
import { useState } from 'react';

const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Validar datos
      const validationErrors = validateUserData(userData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      const response = await fetch('http://localhost:3001/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en el registro');
      }

      const result = await response.json();
      
      // Guardar token y usuario
      localStorage.setItem('token', result.access_token);
      localStorage.setItem('user', JSON.stringify(result.user));
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en el login');
      }

      const result = await response.json();
      
      localStorage.setItem('token', result.access_token);
      localStorage.setItem('user', JSON.stringify(result.user));
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { register, login, loading, error };
};

export default useAuth;
```

## 📱 COMPONENTE DE REGISTRO (Ejemplo)

```jsx
import React, { useState } from 'react';
import useAuth from './useAuth';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    contraseña: ''
  });
  
  const { register, loading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const result = await register(formData);
      console.log('Registro exitoso:', result);
      alert(result.message); // Muestra si es ADMIN o CIUDADANO
      // Redirigir o actualizar UI
    } catch (err) {
      console.error('Error en registro:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Nombre:</label>
        <input
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          required
        />
      </div>
      
      <div>
        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      
      <div>
        <label>Contraseña:</label>
        <input
          type="password"
          name="contraseña"
          value={formData.contraseña}
          onChange={handleChange}
          minLength="6"
          required
        />
      </div>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Registrando...' : 'Registrar'}
      </button>
      
      {error && <div style={{color: 'red'}}>{error}</div>}
    </form>
  );
};

export default RegisterForm;
```

## ✅ CHECKLIST DE DEBUGGING

Si el usuario no se está creando, verifica:

1. **URL Correcta**: `http://localhost:3001/auth/register`
2. **Content-Type**: `'application/json'`
3. **Campos Requeridos**: `nombre`, `email`, `contraseña`
4. **Validaciones**:
   - Email formato válido
   - Contraseña mínimo 6 caracteres
   - Nombre no vacío
5. **Servidor Corriendo**: Backend en puerto 3001
6. **CORS**: Ya configurado para localhost:3000
7. **Base de Datos**: Conectada y funcionando

---

**🎯 Con esta información tu frontend debería poder crear usuarios correctamente!**
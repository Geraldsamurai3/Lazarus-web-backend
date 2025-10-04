# 🚀 Configuración de Puertos - Lazarus

## 📡 Configuración Actual

### Frontend
- **Puerto**: `3000`
- **URL**: `http://localhost:3000`
- **Tipo**: React/Next.js Application

### Backend API
- **Puerto**: `3001`
- **URL**: `http://localhost:3001`
- **Tipo**: NestJS API Server

### WebSocket
- **Puerto**: `3001` (mismo que API)
- **URL**: `ws://localhost:3001`
- **Tipo**: Socket.IO Server

### Base de Datos
- **Puerto**: `3307`
- **Host**: `127.0.0.1`
- **Tipo**: MySQL/MariaDB

## 🔧 Configuraciones Actualizadas

### Archivo `.env`
```env
PORT=3001
DB_PORT=3307
```

### CORS Configuration
```typescript
// src/main.ts & src/websockets/events.gateway.ts
origin: [
  'http://localhost:3000',  // Frontend
  'http://localhost:3001',  // Backend (self)
  'http://10.24.23.119:3000' // Network frontend
]
```

### Frontend Connection
```javascript
// Para conectar desde el frontend al backend
const API_BASE_URL = 'http://localhost:3001';
const WEBSOCKET_URL = 'http://localhost:3001';

// Ejemplo de uso
fetch(`${API_BASE_URL}/api/users`)
socket = io(WEBSOCKET_URL)
```

## 🧪 Testing URLs

### API Endpoints
- **Health Check**: `http://localhost:3001`
- **Users**: `http://localhost:3001/users`
- **Auth**: `http://localhost:3001/auth/login`
- **Incidents**: `http://localhost:3001/incidents`

### WebSocket Test
- **Test Dashboard**: Abrir `websocket-test.html` en el navegador
- **Connection**: Se conecta a `ws://localhost:3001`

## 🔄 Comandos de Inicio

### Backend (Puerto 3001)
```bash
cd Lazarus-web-backend
npm run start:dev
# Servidor corriendo en http://localhost:3001
```

### Frontend (Puerto 3000)
```bash
cd lazarus-frontend  # o el nombre de tu carpeta frontend
npm run dev
# Aplicación corriendo en http://localhost:3000
```

## 🌐 URLs Completas

| Servicio | URL Local | URL Red |
|----------|-----------|---------|
| Frontend | `http://localhost:3000` | `http://10.24.23.119:3000` |
| Backend API | `http://localhost:3001` | `http://10.24.23.119:3001` |
| WebSocket | `ws://localhost:3001` | `ws://10.24.23.119:3001` |
| Database | `127.0.0.1:3307` | `127.0.0.1:3307` |

## 🔒 Notas de Seguridad

### Desarrollo
- CORS configurado para `localhost` y IP de red local
- WebSocket permite conexiones desde frontend

### Producción
```typescript
// Para producción, actualizar CORS:
origin: [
  'https://lazarus-frontend.com',
  'https://app.lazarus.com'
]
```

---

**✅ Configuración lista para desarrollo con:**
- **Frontend**: Puerto 3000
- **Backend**: Puerto 3001
- **Sin conflictos de puertos**
- **CORS configurado correctamente**
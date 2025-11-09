# 🔥 Lazarus - Sistema de Gestión de Crisis

**Lazarus** es una plataforma backend para la gestión de incidentes y emergencias en tiempo real. Built with NestJS, TypeORM y MySQL.

## 🏗️ Arquitectura del Sistema

### Entidades Principales

- **Users** - Gestión de usuarios con roles (ADMIN, ENTIDAD, CIUDADANO)
- **Incidents** - Gestión de reportes de incidentes con geolocalización
- **Notifications** - Sistema de notificaciones en tiempo real
- **IncidentMedia** - Medios adjuntos a los incidentes
- **Statistics** - Analytics y estadísticas del sistema

### Características Principales

✅ **Autenticación JWT** - Login/Register con tokens seguros  
✅ **Autorización por roles** - Control de permisos granular  
✅ **Geolocalización** - Búsqueda de incidentes por proximidad  
✅ **Sistema de notificaciones** - Alertas en tiempo real  
✅ **Analytics avanzados** - Estadísticas y tendencias  
✅ **Validación robusta** - DTOs con class-validator  

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+ 
- mariadb 8.0+
- npm o yarn

### 1. Clona el repositorio

```bash
git clone https://github.com/Geraldsamurai3/Lazarus-web-backend.git
cd Lazarus-web-backend
```

### 2. Instala dependencias

```bash
npm install
```

### 3. Configuración del entorno

Copia el archivo `.env` y configura tus variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=lazarus_db

# Application Configuration
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Environment
NODE_ENV=development
```

### 4. Configura la base de datos

```bash
# Crea la base de datos MySQL
mariadb -u root -p
CREATE DATABASE lazarus_db;
```

### 5. Ejecuta la aplicación

```bash
# Desarrollo con hot-reload
npm run start:dev

# Producción
npm run build
npm run start:prod
```

La API estará disponible en `http://localhost:3000/api`

## 📚 Documentación de la API

### Autenticación

```http
POST /api/auth/register
POST /api/auth/login
```

### Usuarios

```http
GET    /api/users
POST   /api/users
GET    /api/users/:id
PATCH  /api/users/:id
DELETE /api/users/:id
PATCH  /api/users/:id/strike
```

### Incidentes

```http
GET    /api/incidents
POST   /api/incidents
GET    /api/incidents/:id
PATCH  /api/incidents/:id
DELETE /api/incidents/:id
GET    /api/incidents/nearby?lat=10.123&lng=-74.456&radius=5
GET    /api/incidents/statistics
```

### Notificaciones

```http
GET    /api/notifications
POST   /api/notifications
GET    /api/notifications/user/:userId
GET    /api/notifications/user/:userId/unread
PATCH  /api/notifications/:id/read
PATCH  /api/notifications/user/:userId/read-all
DELETE /api/notifications/:id
```

### Estadísticas

```http
GET /api/statistics/dashboard
GET /api/statistics/incidents/status
GET /api/statistics/incidents/severity
GET /api/statistics/incidents/type
GET /api/statistics/users/role
GET /api/statistics/incidents/recent
GET /api/statistics/incidents/trends
GET /api/statistics/incidents/location
GET /api/statistics/users/:userId/activity
```

## 🛡️ Sistema de Roles

### CIUDADANO
- ✅ Crear incidentes
- ✅ Ver sus propios incidentes  
- ✅ Recibir notificaciones
- ❌ Cambiar estados de incidentes

### ENTIDAD
- ✅ Ver todos los incidentes
- ✅ Cambiar estados de incidentes
- ✅ Gestionar notificaciones
- ❌ Eliminar usuarios

### ADMIN
- ✅ Control total del sistema
- ✅ Gestionar usuarios
- ✅ Acceso a todas las estadísticas
- ✅ Eliminar cualquier contenido

## 📊 Tipos de Incidentes

- **MEDICA** - Emergencias médicas
- **INFRAESTRUCTURA** - Problemas de infraestructura
- **SEGURIDAD** - Incidentes de seguridad
- **AMBIENTE** - Problemas ambientales
- **OTRO** - Otros tipos de incidentes

## ⚡ Niveles de Severidad

- **BAJA** - Incidente menor
- **MEDIA** - Requiere atención
- **ALTA** - Urgente
- **CRITICA** - Emergencia máxima

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run start:dev

# Construcción
npm run build

# Producción
npm run start:prod

# Testing
npm run test
npm run test:watch
npm run test:cov
npm run test:e2e

# Linting
npm run lint
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Próximas Características

- [ ] WebSocket para notificaciones en tiempo real
- [ ] Sistema de archivos para medios
- [ ] Integración con mapas externos
- [ ] API de notificaciones push
- [ ] Sistema de moderación automática
- [ ] Exportación de reportes
- [ ] Dashboard en tiempo real



---

**Construido por el equipo Lazarus**
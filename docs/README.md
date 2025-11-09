# 📚 Documentación Técnica - Lazarus Backend

Sistema de gestión de emergencias ciudadanas con reportes geolocalizados, notificaciones en tiempo real y gestión de usuarios con roles.

---

## 📖 Índice General

### 🔌 API Documentation
> Endpoints, WebSockets y especificaciones técnicas de la API

- **[API Endpoints](api/API_ENDPOINTS.md)** - Lista completa de endpoints REST disponibles
- **[Lazarus API Docs](api/LAZARUS_API_DOCS.md)** - Documentación detallada de la API principal
- **[Profile API](api/PROFILE_API_DOCS.md)** - Endpoints de gestión de perfiles de usuario
- **[WebSocket API](api/WEBSOCKET_API_DOCS.md)** - Documentación de conexiones en tiempo real
- **[Admin Panel Requirements](api/ADMIN_PANEL_REQUIREMENTS.md)** - Especificaciones del panel administrativo

### 🎨 Frontend Integration
> Guías para integrar el frontend con el backend

- **[Frontend Integration Guide](frontend/FRONTEND_INTEGRATION_GUIDE.md)** - Guía completa de integración
- **[CORS Configuration](frontend/CORS_FRONTEND_CONFIG.md)** - Configuración CORS para frontend (Vercel/localhost)
- **[Geolocation Service](frontend/FRONTEND_GEOLOCATION_SERVICE.md)** - Servicio de geolocalización con caché
- **[Forgot Password Example](frontend/EJEMPLO_FRONTEND_FORGOT_PASSWORD.md)** - Ejemplo de implementación de recuperación de contraseña

### 🗄️ Database
> Esquemas de base de datos y migraciones

- **[Database Schema](database/DATABASE_SCHEMA_SEPARATED.md)** - Esquema completo de la base de datos
- **[Migration Success Tests](database/MIGRATION_SUCCESS_TESTS.md)** - Tests de validación de migraciones

### 🚀 Deployment
> Configuración de despliegue en Railway y otros servicios

- **[Port Configuration](deployment/PORT_CONFIGURATION.md)** - Configuración de puertos para Railway
- **[Ping Pong Fix](deployment/PING_PONG_FIX.md)** - Solución al problema ping/pong de WebSockets
- **[Ping Pong Explained](deployment/PING_PONG_EXPLAINED.md)** - Explicación técnica del mecanismo ping/pong

### ⚡ Features
> Funcionalidades específicas del sistema

- **[Sistema de Emails](features/SISTEMA_EMAILS.md)** - Sistema completo de emails con plantillas
- **[Implementación de Emails](features/IMPLEMENTACION_EMAILS.md)** - Detalles técnicos de emails transaccionales
- **[Sistema de Strikes](features/SISTEMA_STRIKES.md)** - Sistema de penalizaciones para usuarios
- **[Cloudinary Setup](features/CLOUDINARY_SETUP.md)** - Configuración de almacenamiento de imágenes
- **[Quick Start Cloudinary](features/QUICK_START_CLOUDINARY.md)** - Guía rápida de Cloudinary
- **[Guía Uso Cloudinary](features/GUIA_USO_CLOUDINARY.md)** - Guía detallada de uso de Cloudinary
- **[WebSocket Implementation](features/WEBSOCKET_IMPLEMENTATION.md)** - Implementación técnica de WebSockets

### 🔐 Security
> Autenticación, autorización y seguridad

- **[Roles and Permissions](security/ROLES_AND_PERMISSIONS.md)** - Sistema de roles y permisos
- **[Seguridad Datos Sensibles](security/SEGURIDAD_DATOS_SENSIBLES.md)** - Protección de datos sensibles
- **[Password Reset Documentation](security/DOCUMENTACION_PASSWORD_RESET.md)** - Sistema de recuperación de contraseña
- **[Email Validation](security/DOCUMENTACION_VALIDACION_EMAILS.md)** - Validación de emails

### 📋 Guides
> Guías generales y procedimientos

- **[System Overview](guides/SYSTEM_OVERVIEW.md)** - Visión general del sistema
- **[Testing Guide by Role](guides/TESTING_GUIDE_BY_ROLE.md)** - Guía de testing por rol de usuario
- **[Admin First User](guides/ADMIN_FIRST_USER.md)** - Creación del primer usuario administrador
- **[Registro de Usuarios](guides/REGISTRO_USUARIOS.md)** - Proceso de registro de usuarios
- **[Valores de Formularios](guides/VALORES_FORMULARIOS.md)** - Valores permitidos en formularios
- **[Respuesta Incidentes con Media](guides/RESPUESTA_INCIDENTES_CON_MEDIA.md)** - Estructura de respuestas de incidentes

---

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico
- **Framework**: NestJS 11.0.1
- **Base de Datos**: MariaDB (Railway)
- **Almacenamiento**: Cloudinary
- **Real-time**: WebSockets
- **Autenticación**: JWT (1h expiration)
- **Email**: Nodemailer + Handlebars
- **Task Scheduling**: @nestjs/schedule

### Módulos Principales
```
├── auth/           - Autenticación JWT
├── users/          - Gestión de usuarios y roles
├── incidents/      - Reportes de incidentes con geolocalización
├── incident-media/ - Gestión de archivos multimedia
├── notifications/  - Sistema de notificaciones en tiempo real
└── statistics/     - Estadísticas y analytics
```

---

## 🚀 Quick Start

### Variables de Entorno Requeridas
```env
# Database
DB_HOST=yamanote.proxy.rlwy.net
DB_PORT=20921
DB_USERNAME=root
DB_PASSWORD=<password>
DB_DATABASE=railway

# JWT
JWT_SECRET=<secret>
JWT_EXPIRATION=1h

# CORS
CORS_ORIGINS=http://localhost:3000,https://tu-app.vercel.app

# Cloudinary
CLOUDINARY_CLOUD_NAME=da84etlav
CLOUDINARY_API_KEY=<key>
CLOUDINARY_API_SECRET=<secret>

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<email>
EMAIL_PASS=<password>
```

### Instalación
```bash
npm install
npm run build
npm run start:prod
```

### Endpoints Base
- **API Base**: `https://lazarus-web-backend-production.up.railway.app`
- **Health Check**: `GET /`
- **WebSocket**: `wss://lazarus-web-backend-production.up.railway.app`

---

## 📞 Soporte

Para dudas técnicas, consultar la documentación específica en cada carpeta o revisar el código fuente en `src/`.

---

**Última actualización**: Enero 2025

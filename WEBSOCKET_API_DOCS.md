# 🔌 WebSocket API Documentation - Lazarus

## 📡 Connection

**URL:** `ws://localhost:3000` or `wss://your-domain.com`

### Connect with Socket.IO Client

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  query: {
    userId: '123' // Your user ID
  },
  transports: ['websocket'],
});

socket.on('connect', () => {
  console.log('Connected to Lazarus WebSocket');
});
```

---

## 🔥 Events Reference

### 1. INCIDENT EVENTS

#### 📥 Listen: `incident:created`
Emitted when a new incident is created.

```javascript
socket.on('incident:created', (data) => {
  console.log('New incident:', data);
  // data: { incident: { id, tipo, descripcion, severidad, latitud, longitud, ... } }
});
```

**Response Example:**
```json
{
  "incident": {
    "id": 1,
    "tipo": "MEDICA",
    "descripcion": "Accidente de tránsito con heridos",
    "severidad": "ALTA",
    "latitud": 3.4516,
    "longitud": -76.5320,
    "direccion": "Calle 5 con Carrera 100",
    "estado": "NUEVO",
    "fecha_creacion": "2025-10-03T10:30:00.000Z",
    "usuario": {
      "id": 5,
      "nombre": "Juan Pérez"
    }
  }
}
```

---

#### 📥 Listen: `incident:updated`
Emitted when an incident status changes.

```javascript
socket.on('incident:updated', (data) => {
  console.log('Incident updated:', data);
  // Update your UI with new status
});
```

**Response Example:**
```json
{
  "incidentId": 1,
  "oldStatus": "NUEVO",
  "newStatus": "REVISION",
  "updatedBy": 10
}
```

---

#### 📥 Listen: `incident:nearby`
Emitted when there's a new incident near your location.

```javascript
socket.on('incident:nearby', (data) => {
  console.log('Nearby incident alert:', data);
  // Show notification to user
});
```

---

#### 📤 Emit: `incident:subscribe`
Subscribe to updates for a specific incident.

```javascript
socket.emit('incident:subscribe', { incidentId: 1 });
```

---

#### 📤 Emit: `incident:unsubscribe`
Unsubscribe from incident updates.

```javascript
socket.emit('incident:unsubscribe', { incidentId: 1 });
```

---

### 2. LOCATION TRACKING 📍

#### 📤 Emit: `location:update`
Send your current location to the server (real-time tracking).

```javascript
// Send location every 5 seconds
setInterval(() => {
  socket.emit('location:update', {
    userId: 123,
    userType: 'ENTIDAD', // or 'CIUDADANO'
    latitude: 3.4516,
    longitude: -76.5320,
    timestamp: new Date()
  });
}, 5000);
```

**Payload:**
```typescript
{
  userId: number;
  userType: 'CIUDADANO' | 'ENTIDAD';
  latitude: number;
  longitude: number;
  timestamp: Date;
}
```

---

#### 📥 Listen: `entity:location`
Receive real-time location updates from emergency entities.

```javascript
socket.on('entity:location', (data) => {
  console.log('Entity moving:', data);
  // Update entity marker on map
  updateMapMarker(data.userId, data.latitude, data.longitude);
});
```

**Response Example:**
```json
{
  "userId": 50,
  "latitude": 3.4520,
  "longitude": -76.5325,
  "timestamp": "2025-10-03T10:35:00.000Z"
}
```

---

#### 📤 Emit: `entity:track`
Track a specific entity (ambulance, police, firefighters).

```javascript
socket.emit('entity:track', { entityId: 50 });
```

---

#### 📤 Emit: `entities:getLocations`
Get all active entity locations.

```javascript
socket.emit('entities:getLocations', (entities) => {
  console.log('Active entities:', entities);
  // Display all entities on map
  entities.forEach(entity => {
    addEntityMarker(entity);
  });
});
```

**Response Example:**
```json
[
  {
    "userId": 50,
    "latitude": 3.4520,
    "longitude": -76.5325,
    "timestamp": "2025-10-03T10:35:00.000Z"
  },
  {
    "userId": 51,
    "latitude": 3.4600,
    "longitude": -76.5400,
    "timestamp": "2025-10-03T10:35:05.000Z"
  }
]
```

---

### 3. NOTIFICATIONS 🔔

#### 📥 Listen: `notification`
Receive personal notifications.

```javascript
socket.on('notification', (data) => {
  console.log('New notification:', data);
  showNotification(data.message, data.type);
});
```

**Response Example:**
```json
{
  "userId": 123,
  "message": "Tu incidente ha sido atendido",
  "incidentId": 15,
  "type": "INFO"
}
```

---

#### 📥 Listen: `notification:broadcast`
Receive system-wide broadcast notifications.

```javascript
socket.on('notification:broadcast', (data) => {
  console.log('Broadcast:', data);
  showBroadcastAlert(data.message);
});
```

---

### 4. GEOFENCING 🗺️

#### 📤 Emit: `area:subscribe`
Subscribe to incidents in a specific geographic area.

```javascript
socket.emit('area:subscribe', {
  latitude: 3.4516,
  longitude: -76.5320,
  radius: 5 // kilometers
});
```

---

### 5. EMERGENCY ALERTS 🚨

#### 📥 Listen: `alert:emergency`
Critical emergency broadcasts.

```javascript
socket.on('alert:emergency', (data) => {
  console.log('EMERGENCY ALERT:', data);
  showEmergencyModal(data);
});
```

**Response Example:**
```json
{
  "type": "EVACUATION",
  "message": "Evacuación inmediata de la zona centro por inundación",
  "area": {
    "latitude": 3.4516,
    "longitude": -76.5320,
    "radius": 10
  }
}
```

---

### 6. CONNECTION HEALTH 💓

#### 📤 Emit: `ping`
Check connection status.

```javascript
socket.emit('ping', (response) => {
  console.log('Pong:', response);
});
```

**Response:**
```json
{
  "event": "pong",
  "data": {
    "timestamp": "2025-10-03T10:40:00.000Z"
  }
}
```

---

## 🎯 Complete Example: Frontend Integration

### React/Next.js Example

```typescript
// hooks/useSocket.ts
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = (userId: number) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    const socketInstance = io('http://localhost:3000', {
      query: { userId: userId.toString() }
    });

    // Listen for new incidents
    socketInstance.on('incident:created', (data) => {
      setIncidents(prev => [data.incident, ...prev]);
      // Show notification
      new Notification('Nuevo incidente', {
        body: data.incident.descripcion
      });
    });

    // Listen for incident updates
    socketInstance.on('incident:updated', (data) => {
      setIncidents(prev => prev.map(inc => 
        inc.id === data.incidentId 
          ? { ...inc, estado: data.newStatus }
          : inc
      ));
    });

    // Listen for nearby incidents
    socketInstance.on('incident:nearby', (data) => {
      showNearbyAlert(data);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [userId]);

  // Send location updates
  useEffect(() => {
    if (!socket) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        socket.emit('location:update', {
          userId,
          userType: 'CIUDADANO',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: new Date()
        });
      },
      (error) => console.error('Geolocation error:', error),
      { enableHighAccuracy: true, maximumAge: 5000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [socket, userId]);

  return { socket, incidents };
};
```

### Map Component with Real-time Updates

```typescript
// components/IncidentMap.tsx
import { useEffect, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';

export const IncidentMap = () => {
  const mapRef = useRef(null);
  const { socket, incidents } = useSocket(userId);

  useEffect(() => {
    // Track all entities on map
    socket?.emit('entities:getLocations', (entities) => {
      entities.forEach(entity => {
        addEntityMarker(entity);
      });
    });

    // Listen for entity movements
    socket?.on('entity:location', (data) => {
      updateEntityMarker(data.userId, {
        lat: data.latitude,
        lng: data.longitude
      });
    });
  }, [socket]);

  return (
    <div>
      <div ref={mapRef} style={{ height: '100vh' }} />
      {/* Render incidents on map */}
    </div>
  );
};
```

---

## 🔒 Security Considerations

1. **Authentication**: In production, authenticate WebSocket connections with JWT
2. **Rate Limiting**: Limit location update frequency
3. **Permissions**: Validate user permissions for sensitive events
4. **CORS**: Configure proper CORS settings for production

---

## 📊 Event Flow Diagram

```
User Creates Incident
    ↓
REST API POST /api/incidents
    ↓
Service saves to DB
    ↓
WebSocket emits incident:created
    ↓
All connected clients receive update
    ↓
Map updates in real-time
```

---

## 🚀 Testing with Socket.IO Client

```bash
npm install -g socket.io-client-tool
```

```bash
socket-io-client-tool connect http://localhost:3000
```

Or use Postman's WebSocket feature to test events!

---

**Built with ❤️ for Lazarus Emergency Management System**
# 📍 Servicio de Geolocalización - Frontend

## 🎯 Solución Completa para Guardar Ubicación del Usuario

### 📦 Estrategia 1: LocalStorage + Geolocation API (Recomendado)

```javascript
// services/locationService.js

class LocationService {
  constructor() {
    this.STORAGE_KEY = 'user_location';
    this.LOCATION_PERMISSION_KEY = 'location_permission_granted';
    this.LOCATION_EXPIRY_HOURS = 24; // Ubicación válida por 24 horas
  }

  /**
   * Obtener ubicación del usuario (con caché inteligente)
   */
  async getUserLocation() {
    try {
      // 1. Verificar si tenemos ubicación guardada y es reciente
      const cachedLocation = this.getCachedLocation();
      if (cachedLocation && !this.isLocationExpired(cachedLocation)) {
        console.log('📍 Usando ubicación en caché:', cachedLocation);
        return {
          lat: cachedLocation.lat,
          lng: cachedLocation.lng,
          fromCache: true
        };
      }

      // 2. Si el usuario YA dio permiso antes, obtener ubicación directamente
      if (this.hasLocationPermission()) {
        const location = await this.getCurrentPosition();
        this.saveLocation(location);
        return location;
      }

      // 3. Si es primera vez, pedir permiso
      const location = await this.requestLocationPermission();
      this.saveLocation(location);
      this.markPermissionGranted();
      return location;

    } catch (error) {
      console.error('❌ Error obteniendo ubicación:', error);
      
      // Fallback: usar ubicación guardada aunque esté expirada
      const cachedLocation = this.getCachedLocation();
      if (cachedLocation) {
        return {
          lat: cachedLocation.lat,
          lng: cachedLocation.lng,
          fromCache: true,
          expired: true
        };
      }

      // Último recurso: ubicación por defecto (San José Centro)
      return this.getDefaultLocation();
    }
  }

  /**
   * Solicitar permiso de ubicación al usuario
   */
  async requestLocationPermission() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalización no soportada'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
          };
          resolve(location);
        },
        (error) => {
          console.error('Error de geolocalización:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }

  /**
   * Obtener posición actual (sin pedir permiso)
   */
  async getCurrentPosition() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
          });
        },
        reject,
        { enableHighAccuracy: true, maximumAge: 300000 } // Cache 5 min
      );
    });
  }

  /**
   * Guardar ubicación en localStorage
   */
  saveLocation(location) {
    const locationData = {
      lat: location.lat,
      lng: location.lng,
      accuracy: location.accuracy,
      timestamp: Date.now()
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(locationData));
    console.log('✅ Ubicación guardada:', locationData);
  }

  /**
   * Obtener ubicación guardada
   */
  getCachedLocation() {
    const cached = localStorage.getItem(this.STORAGE_KEY);
    return cached ? JSON.parse(cached) : null;
  }

  /**
   * Verificar si la ubicación guardada expiró
   */
  isLocationExpired(location) {
    if (!location || !location.timestamp) return true;
    
    const expiryMs = this.LOCATION_EXPIRY_HOURS * 60 * 60 * 1000;
    const now = Date.now();
    const isExpired = (now - location.timestamp) > expiryMs;
    
    if (isExpired) {
      console.log('⏰ Ubicación expirada, solicitando nueva');
    }
    
    return isExpired;
  }

  /**
   * Verificar si el usuario ya dio permiso anteriormente
   */
  hasLocationPermission() {
    return localStorage.getItem(this.LOCATION_PERMISSION_KEY) === 'true';
  }

  /**
   * Marcar que el usuario dio permiso
   */
  markPermissionGranted() {
    localStorage.setItem(this.LOCATION_PERMISSION_KEY, 'true');
  }

  /**
   * Ubicación por defecto (San José, Costa Rica)
   */
  getDefaultLocation() {
    console.log('⚠️ Usando ubicación por defecto (San José)');
    return {
      lat: 9.9281,
      lng: -84.0907,
      isDefault: true
    };
  }

  /**
   * Limpiar ubicación guardada (logout o cambio de usuario)
   */
  clearLocation() {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.LOCATION_PERMISSION_KEY);
  }

  /**
   * Actualizar ubicación en tiempo real (para tracking)
   */
  watchLocation(callback) {
    if (!navigator.geolocation) {
      console.error('Geolocalización no disponible');
      return null;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now()
        };
        
        // Guardar la nueva ubicación
        this.saveLocation(location);
        
        // Notificar al callback
        if (callback) callback(location);
      },
      (error) => {
        console.error('Error en watchPosition:', error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000, // Actualizar cada 5 segundos
        timeout: 10000
      }
    );

    return watchId; // Para poder detener el tracking después
  }

  /**
   * Detener tracking de ubicación
   */
  stopWatchingLocation(watchId) {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
    }
  }
}

// Exportar instancia única (Singleton)
export const locationService = new LocationService();
```

---

## 🎨 Uso en React/Next.js

### Componente de Mapa con Ubicación Automática

```jsx
// components/IncidentMap.jsx
import { useEffect, useState } from 'react';
import { locationService } from '@/services/locationService';

export default function IncidentMap() {
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    initMap();
  }, []);

  const initMap = async () => {
    try {
      // Obtener ubicación del usuario (con caché automático)
      const location = await locationService.getUserLocation();
      
      setUserLocation(location);
      
      // Cargar incidentes cercanos
      await fetchNearbyIncidents(location.lat, location.lng);
      
      if (location.fromCache) {
        console.log('📍 Usando ubicación guardada');
      } else {
        console.log('📍 Ubicación obtenida del GPS');
      }
      
    } catch (error) {
      console.error('Error inicializando mapa:', error);
      // Usar ubicación por defecto
      const defaultLoc = locationService.getDefaultLocation();
      setUserLocation(defaultLoc);
      await fetchNearbyIncidents(defaultLoc.lat, defaultLoc.lng);
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyIncidents = async (lat, lng) => {
    const token = localStorage.getItem('access_token');
    const radius = 5000; // 5km

    const response = await fetch(
      `http://localhost:3000/incidents/nearby?lat=${lat}&lng=${lng}&radius=${radius}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );

    if (response.ok) {
      const data = await response.json();
      setIncidents(data);
    }
  };

  const refreshLocation = async () => {
    setLoading(true);
    // Limpiar caché para forzar nueva ubicación
    locationService.clearLocation();
    await initMap();
  };

  if (loading) {
    return <div>Obteniendo tu ubicación...</div>;
  }

  return (
    <div>
      <div className="location-info">
        📍 Tu ubicación: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
        {userLocation.fromCache && <span> (guardada)</span>}
        {userLocation.isDefault && <span> ⚠️ (por defecto)</span>}
        <button onClick={refreshLocation}>🔄 Actualizar</button>
      </div>

      {/* Tu componente de mapa aquí (Leaflet, Google Maps, etc) */}
      <div id="map">
        {/* Renderizar mapa con userLocation e incidents */}
      </div>
    </div>
  );
}
```

---

## 🚀 Hook Personalizado para Ubicación

```jsx
// hooks/useUserLocation.js
import { useState, useEffect } from 'react';
import { locationService } from '@/services/locationService';

export function useUserLocation(autoFetch = true) {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (autoFetch) {
      fetchLocation();
    }
  }, [autoFetch]);

  const fetchLocation = async () => {
    setLoading(true);
    setError(null);

    try {
      const loc = await locationService.getUserLocation();
      setLocation(loc);
    } catch (err) {
      setError(err.message);
      // Usar ubicación por defecto en caso de error
      const defaultLoc = locationService.getDefaultLocation();
      setLocation(defaultLoc);
    } finally {
      setLoading(false);
    }
  };

  const refreshLocation = async () => {
    locationService.clearLocation();
    await fetchLocation();
  };

  return {
    location,
    loading,
    error,
    refreshLocation,
    hasLocation: location !== null
  };
}
```

### Uso del Hook

```jsx
// pages/MapPage.jsx
import { useUserLocation } from '@/hooks/useUserLocation';

export default function MapPage() {
  const { location, loading, error, refreshLocation } = useUserLocation();

  if (loading) return <div>Cargando ubicación...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Mapa de Incidentes</h1>
      <p>Tu ubicación: {location.lat}, {location.lng}</p>
      <button onClick={refreshLocation}>Actualizar Ubicación</button>
      
      {/* Tu mapa aquí */}
    </div>
  );
}
```

---

## 🔒 Estrategia 2: Permissions API (Más Avanzado)

```javascript
// Verificar estado del permiso de geolocalización
async function checkLocationPermission() {
  if (!navigator.permissions) {
    return 'unsupported';
  }

  try {
    const result = await navigator.permissions.query({ name: 'geolocation' });
    
    // Estados posibles: 'granted', 'denied', 'prompt'
    console.log('Estado del permiso:', result.state);
    
    // Escuchar cambios en el permiso
    result.addEventListener('change', () => {
      console.log('Permiso cambió a:', result.state);
      
      if (result.state === 'granted') {
        // Usuario dio permiso, actualizar ubicación
        locationService.getUserLocation();
      }
    });

    return result.state;
  } catch (error) {
    console.error('Error verificando permisos:', error);
    return 'error';
  }
}

// Uso en componente
useEffect(() => {
  checkLocationPermission().then(state => {
    if (state === 'granted') {
      // Permiso ya concedido, NO mostrar modal
      locationService.getUserLocation();
    } else if (state === 'prompt') {
      // Primera vez, mostrar explicación antes de pedir permiso
      setShowLocationModal(true);
    } else if (state === 'denied') {
      // Usuario negó el permiso, usar ubicación por defecto
      setUserLocation(locationService.getDefaultLocation());
    }
  });
}, []);
```

---

## ⚡ Estrategia 3: Tracking Continuo (Entidades Públicas)

Para entidades que necesitan enviar su ubicación en tiempo real:

```jsx
// components/EntityLocationTracker.jsx
import { useEffect, useRef } from 'react';
import { locationService } from '@/services/locationService';
import { io } from 'socket.io-client';

export function EntityLocationTracker({ userId, userType }) {
  const socketRef = useRef(null);
  const watchIdRef = useRef(null);

  useEffect(() => {
    // Conectar WebSocket
    socketRef.current = io('http://localhost:3000', {
      auth: { token: localStorage.getItem('access_token') }
    });

    // Iniciar tracking de ubicación
    watchIdRef.current = locationService.watchLocation((location) => {
      // Enviar ubicación actualizada al servidor cada 5 segundos
      socketRef.current.emit('location:update', {
        userId,
        userType,
        latitude: location.lat,
        longitude: location.lng,
        timestamp: new Date()
      });

      console.log('📡 Ubicación enviada:', location);
    });

    // Cleanup
    return () => {
      if (watchIdRef.current) {
        locationService.stopWatchingLocation(watchIdRef.current);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [userId, userType]);

  return (
    <div className="tracking-indicator">
      🟢 Ubicación en tiempo real activa
    </div>
  );
}
```

---

## 📱 Estrategia 4: Búsqueda Manual (Backup)

Para usuarios que niegan el permiso:

```jsx
// components/ManualLocationPicker.jsx
import { useState } from 'react';

export function ManualLocationPicker({ onLocationSelect }) {
  const [address, setAddress] = useState('');

  const searchLocation = async () => {
    // Usar Google Places API o Nominatim (OpenStreetMap)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)},Costa Rica&format=json&limit=1`
    );

    const data = await response.json();
    
    if (data.length > 0) {
      const location = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        manual: true
      };

      // Guardar ubicación manual
      locationService.saveLocation(location);
      onLocationSelect(location);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Ej: Heredia Centro, Costa Rica"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <button onClick={searchLocation}>Buscar</button>
    </div>
  );
}
```

---

## 🎯 Flujo Completo Recomendado

```jsx
// pages/MapPage.jsx - IMPLEMENTACIÓN COMPLETA
import { useState, useEffect } from 'react';
import { locationService } from '@/services/locationService';

export default function MapPage() {
  const [location, setLocation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [permissionState, setPermissionState] = useState('unknown');

  useEffect(() => {
    initLocation();
  }, []);

  const initLocation = async () => {
    // 1. Verificar si hay ubicación guardada válida
    const cached = locationService.getCachedLocation();
    if (cached && !locationService.isLocationExpired(cached)) {
      console.log('✅ Usando ubicación guardada');
      setLocation(cached);
      return;
    }

    // 2. Verificar estado del permiso
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      setPermissionState(permission.state);

      if (permission.state === 'granted') {
        // Ya tiene permiso, obtener ubicación directamente
        const loc = await locationService.getUserLocation();
        setLocation(loc);
      } else if (permission.state === 'prompt') {
        // Primera vez, mostrar modal explicativo
        setShowModal(true);
      } else {
        // Permiso denegado, usar ubicación por defecto
        setLocation(locationService.getDefaultLocation());
      }
    } catch (error) {
      // Navegador no soporta Permissions API, intentar obtener ubicación
      try {
        const loc = await locationService.getUserLocation();
        setLocation(loc);
      } catch (err) {
        setLocation(locationService.getDefaultLocation());
      }
    }
  };

  const handleAllowLocation = async () => {
    setShowModal(false);
    try {
      const loc = await locationService.getUserLocation();
      setLocation(loc);
    } catch (error) {
      setLocation(locationService.getDefaultLocation());
    }
  };

  const handleUseDefault = () => {
    setShowModal(false);
    setLocation(locationService.getDefaultLocation());
  };

  return (
    <div>
      {showModal && (
        <div className="modal">
          <h3>📍 ¿Habilitar Ubicación?</h3>
          <p>Para mostrarte incidentes cercanos necesitamos tu ubicación.</p>
          <p>✅ Tu privacidad está protegida</p>
          <p>✅ Solo se usa localmente</p>
          <button onClick={handleAllowLocation}>Permitir Siempre</button>
          <button onClick={handleUseDefault}>Usar San José Centro</button>
        </div>
      )}

      {location && (
        <div>
          <p>📍 {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>
          {/* Renderizar mapa */}
        </div>
      )}
    </div>
  );
}
```

---

## 🔑 Resumen de Ventajas

| Estrategia | Ventaja | Cuándo Usar |
|------------|---------|-------------|
| **localStorage + caché** | No pide permiso cada vez | Ciudadanos en mapa |
| **Permissions API** | Verifica estado antes de pedir | Apps modernas |
| **watchPosition** | Tracking en tiempo real | Entidades públicas |
| **Búsqueda manual** | Backup si niegan permiso | Todos los casos |

---

## ✅ Checklist de Implementación

- [ ] Crear `locationService.js` con caché de 24h
- [ ] Implementar `useUserLocation` hook
- [ ] Verificar estado del permiso antes de pedirlo
- [ ] Guardar ubicación en localStorage
- [ ] Usar ubicación en caché si es válida
- [ ] Fallback a ubicación por defecto (San José)
- [ ] Botón "Actualizar ubicación" para forzar refresh
- [ ] Limpiar ubicación al logout

---

**¡Con esto el usuario solo da permiso UNA VEZ y se guarda para siempre!** 🎉

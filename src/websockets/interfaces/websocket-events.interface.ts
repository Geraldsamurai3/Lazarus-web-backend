export interface IncidentCreatedPayload {
  incident: {
    id: number;
    tipo: string;
    descripcion: string;
    severidad: string;
    latitud: number;
    longitud: number;
    direccion: string;
    estado: string;
    fecha_creacion: Date;
    usuario: {
      id: number;
      nombre: string;
    };
  };
}

export interface IncidentUpdatedPayload {
  incidentId: number;
  oldStatus: string;
  newStatus: string;
  updatedBy: number;
}

export interface LocationUpdatePayload {
  userId: number;
  userType: 'CIUDADANO' | 'ENTIDAD';
  latitude: number;
  longitude: number;
  timestamp: Date;
}

export interface NotificationPayload {
  userId: number;
  message: string;
  incidentId?: number;
  type: 'INFO' | 'WARNING' | 'CRITICAL';
}

export interface NearbyIncidentPayload {
  userId: number;
  incidents: Array<{
    id: number;
    tipo: string;
    severidad: string;
    distance: number;
    latitud: number;
    longitud: number;
  }>;
}
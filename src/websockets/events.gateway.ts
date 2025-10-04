import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import type {
  IncidentCreatedPayload,
  IncidentUpdatedPayload,
  LocationUpdatePayload,
  NotificationPayload,
  NearbyIncidentPayload,
} from './interfaces/websocket-events.interface';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'], // Add your frontend URLs
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('EventsGateway');
  private userLocations: Map<number, { socket: Socket; location: LocationUpdatePayload }> = new Map();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    
    // Extract userId from handshake query or auth
    const userId = client.handshake.query.userId as string;
    if (userId) {
      client.join(`user:${userId}`);
      this.logger.log(`User ${userId} joined their personal room`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Clean up user location
    this.userLocations.forEach((value, key) => {
      if (value.socket.id === client.id) {
        this.userLocations.delete(key);
        this.logger.log(`Removed location data for user ${key}`);
      }
    });
  }

  // ============================================
  // INCIDENT EVENTS
  // ============================================

  /**
   * Broadcast new incident to all connected clients
   */
  emitIncidentCreated(payload: IncidentCreatedPayload) {
    this.logger.log(`Broadcasting new incident: ${payload.incident.id}`);
    this.server.emit('incident:created', payload);
  }

  /**
   * Broadcast incident update to all clients
   */
  emitIncidentUpdated(payload: IncidentUpdatedPayload) {
    this.logger.log(`Broadcasting incident update: ${payload.incidentId}`);
    this.server.emit('incident:updated', payload);
  }

  /**
   * Notify users near a new incident
   */
  emitNearbyIncident(userIds: number[], payload: NearbyIncidentPayload) {
    userIds.forEach(userId => {
      this.server.to(`user:${userId}`).emit('incident:nearby', payload);
    });
    this.logger.log(`Notified ${userIds.length} users about nearby incident`);
  }

  // ============================================
  // LOCATION TRACKING
  // ============================================

  /**
   * Update user location in real-time
   */
  @SubscribeMessage('location:update')
  handleLocationUpdate(
    @MessageBody() data: LocationUpdatePayload,
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`Location update from user ${data.userId}`);
    
    // Store user location
    this.userLocations.set(data.userId, {
      socket: client,
      location: data,
    });

    // Broadcast to entities/admin tracking this user
    if (data.userType === 'ENTIDAD') {
      this.server.emit('entity:location', {
        userId: data.userId,
        latitude: data.latitude,
        longitude: data.longitude,
        timestamp: data.timestamp,
      });
    }

    return { success: true, message: 'Location updated' };
  }

  /**
   * Subscribe to specific entity location updates
   */
  @SubscribeMessage('entity:track')
  handleTrackEntity(
    @MessageBody() data: { entityId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `entity:${data.entityId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} tracking entity ${data.entityId}`);
    return { success: true, room };
  }

  /**
   * Get all active entity locations
   */
  @SubscribeMessage('entities:getLocations')
  handleGetEntityLocations(@ConnectedSocket() client: Socket) {
    const entities: Array<{
      userId: number;
      latitude: number;
      longitude: number;
      timestamp: Date;
    }> = [];
    
    this.userLocations.forEach((value, key) => {
      if (value.location.userType === 'ENTIDAD') {
        entities.push({
          userId: key,
          latitude: value.location.latitude,
          longitude: value.location.longitude,
          timestamp: value.location.timestamp,
        });
      }
    });
    return entities;
  }

  // ============================================
  // NOTIFICATIONS
  // ============================================

  /**
   * Send notification to specific user
   */
  emitNotificationToUser(userId: number, payload: NotificationPayload) {
    this.server.to(`user:${userId}`).emit('notification', payload);
    this.logger.log(`Notification sent to user ${userId}`);
  }

  /**
   * Broadcast notification to all users
   */
  emitBroadcastNotification(payload: NotificationPayload) {
    this.server.emit('notification:broadcast', payload);
    this.logger.log(`Broadcast notification sent`);
  }

  // ============================================
  // INCIDENT SUBSCRIPTIONS
  // ============================================

  /**
   * Subscribe to specific incident updates
   */
  @SubscribeMessage('incident:subscribe')
  handleSubscribeToIncident(
    @MessageBody() data: { incidentId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `incident:${data.incidentId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} subscribed to incident ${data.incidentId}`);
    return { success: true, room };
  }

  /**
   * Unsubscribe from incident updates
   */
  @SubscribeMessage('incident:unsubscribe')
  handleUnsubscribeFromIncident(
    @MessageBody() data: { incidentId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `incident:${data.incidentId}`;
    client.leave(room);
    this.logger.log(`Client ${client.id} unsubscribed from incident ${data.incidentId}`);
    return { success: true };
  }

  /**
   * Emit update to specific incident room
   */
  emitIncidentRoomUpdate(incidentId: number, payload: any) {
    this.server.to(`incident:${incidentId}`).emit('incident:update', payload);
  }

  // ============================================
  // GEOFENCING
  // ============================================

  /**
   * Subscribe to incidents in specific area
   */
  @SubscribeMessage('area:subscribe')
  handleSubscribeToArea(
    @MessageBody() data: { latitude: number; longitude: number; radius: number },
    @ConnectedSocket() client: Socket,
  ) {
    const areaId = `area:${data.latitude.toFixed(2)}_${data.longitude.toFixed(2)}`;
    client.join(areaId);
    this.logger.log(`Client ${client.id} subscribed to area ${areaId}`);
    return { success: true, areaId };
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // ============================================
  // EMERGENCY ALERTS
  // ============================================

  /**
   * Broadcast critical emergency alert
   */
  emitEmergencyAlert(payload: {
    type: 'CRITICAL' | 'EVACUATION' | 'WARNING';
    message: string;
    area?: { latitude: number; longitude: number; radius: number };
  }) {
    this.server.emit('alert:emergency', payload);
    this.logger.warn(`EMERGENCY ALERT: ${payload.type} - ${payload.message}`);
  }

  // ============================================
  // HEARTBEAT
  // ============================================

  /**
   * Ping/Pong for connection health check
   */
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket): any {
    this.logger.log(`Ping received from client ${client.id}`);
    
    // Return data directly - NestJS will send it as acknowledgment
    return {
      timestamp: new Date(),
      clientId: client.id,
      message: 'Server is alive!'
    };
  }
}
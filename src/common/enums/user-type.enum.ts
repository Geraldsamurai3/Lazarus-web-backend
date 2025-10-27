/**
 * Tipos de usuario en el sistema Lazarus
 * Reemplaza el antiguo UserRole de user.entity.ts
 */
export enum UserType {
  CIUDADANO = 'CIUDADANO',  // Usuario regular que reporta incidentes
  ENTIDAD = 'ENTIDAD',       // Entidad pública (bomberos, policía, etc.)
  ADMIN = 'ADMIN',           // Administrador del sistema
}

/**
 * Estados de usuario
 */
export enum UserStatus {
  HABILITADO = 'HABILITADO',
  DESHABILITADO = 'DESHABILITADO',
}

/**
 * Nivel de acceso para administradores
 */
export enum AdminAccessLevel {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MODERADOR = 'MODERADOR',
}

/**
 * Tipos de entidades públicas
 */
export enum EntityType {
  BOMBEROS = 'BOMBEROS',
  POLICIA = 'POLICIA',
  CRUZ_ROJA = 'CRUZ_ROJA',
  TRANSITO = 'TRANSITO',
  AMBULANCIA = 'AMBULANCIA',
  MUNICIPALIDAD = 'MUNICIPALIDAD',
  OTROS = 'OTROS',
}

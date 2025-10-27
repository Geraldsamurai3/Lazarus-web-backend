import { Injectable, NotFoundException } from '@nestjs/common';
import { UnifiedAuthService } from './services/unified-auth.service';
import { UserType } from '../common/enums/user-type.enum';
import { Ciudadano } from './entity/ciudadano.entity';
import { EntidadPublica } from './entity/entidad-publica.entity';
import { Administrador } from './entity/administrador.entity';

/**
 * UsersService ahora actúa como facade/proxy para UnifiedAuthService
 * Mantiene compatibilidad con código existente mientras usa las 3 nuevas entidades
 */
@Injectable()
export class UsersService {
  constructor(
    private unifiedAuthService: UnifiedAuthService,
  ) {}

  /**
   * Buscar usuario por email en todas las tablas
   */
  async findByEmail(email: string): Promise<{ user: any; userType: UserType } | null> {
    return this.unifiedAuthService.findByEmail(email);
  }

  /**
   * Buscar usuario por ID y tipo específico
   */
  async findById(id: number, userType: UserType): Promise<any> {
    return this.unifiedAuthService.findById(id, userType);
  }

  /**
   * Obtener ciudadano por ID
   */
  async findCiudadanoById(id: number): Promise<Ciudadano | null> {
    return this.unifiedAuthService.findCiudadanoById(id);
  }

  /**
   * Obtener entidad por ID
   */
  async findEntidadById(id: number): Promise<EntidadPublica | null> {
    return this.unifiedAuthService.findEntidadById(id);
  }

  /**
   * Obtener administrador por ID
   */
  async findAdminById(id: number): Promise<Administrador | null> {
    return this.unifiedAuthService.findAdminById(id);
  }

  /**
   * Obtener todos los ciudadanos
   */
  async getAllCiudadanos(): Promise<Ciudadano[]> {
    return this.unifiedAuthService.getAllCiudadanos();
  }

  /**
   * Obtener todas las entidades públicas
   */
  async getAllEntidades(): Promise<EntidadPublica[]> {
    return this.unifiedAuthService.getAllEntidades();
  }

  /**
   * Obtener todos los administradores
   */
  async getAllAdmins(): Promise<Administrador[]> {
    return this.unifiedAuthService.getAllAdmins();
  }

  /**
   * Obtener todos los usuarios de todas las tablas
   */
  async findAll(): Promise<Array<any>> {
    const [ciudadanos, entidades, admins] = await Promise.all([
      this.getAllCiudadanos(),
      this.getAllEntidades(),
      this.getAllAdmins(),
    ]);

    return [
      ...ciudadanos.map(c => ({ ...c, userType: UserType.CIUDADANO })),
      ...entidades.map(e => ({ ...e, userType: UserType.ENTIDAD })),
      ...admins.map(a => ({ ...a, userType: UserType.ADMIN })),
    ];
  }

  /**
   * Incrementar strikes de un ciudadano
   */
  async incrementStrikes(ciudadanoId: number): Promise<Ciudadano> {
    return this.unifiedAuthService.incrementStrikes(ciudadanoId);
  }

  /**
   * Habilitar/Deshabilitar usuario
   */
  async toggleUserStatus(id: number, userType: UserType): Promise<void> {
    return this.unifiedAuthService.toggleUserStatus(id, userType);
  }

  /**
   * Validar credenciales de usuario
   */
  async validateUser(email: string, contraseña: string): Promise<any> {
    return this.unifiedAuthService.validateUser(email, contraseña);
  }
}

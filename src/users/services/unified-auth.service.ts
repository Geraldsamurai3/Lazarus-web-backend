import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Ciudadano } from '../entity/ciudadano.entity';
import { EntidadPublica } from '../entity/entidad-publica.entity';
import { Administrador } from '../entity/administrador.entity';
import { LoginDto, RegisterCiudadanoDto, RegisterEntidadDto, RegisterAdminDto } from '../dto/user-roles.dto';
import { UserType } from '../../common/enums/user-type.enum';

@Injectable()
export class UnifiedAuthService {
  constructor(
    @InjectRepository(Ciudadano)
    private ciudadanoRepository: Repository<Ciudadano>,
    @InjectRepository(EntidadPublica)
    private entidadRepository: Repository<EntidadPublica>,
    @InjectRepository(Administrador)
    private adminRepository: Repository<Administrador>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, contraseña: string): Promise<any> {
    // Buscar en todas las tablas
    let user: any = null;
    let userType: UserType | null = null;
    let userId: number | null = null;

    // Buscar en ciudadanos
    const ciudadano = await this.ciudadanoRepository.findOne({ where: { email } });
    if (ciudadano) {
      user = ciudadano;
      userType = UserType.CIUDADANO;
      userId = ciudadano.id_ciudadano;
    }

    // Buscar en entidades
    if (!user) {
      const entidad = await this.entidadRepository.findOne({ where: { email } });
      if (entidad) {
        user = entidad;
        userType = UserType.ENTIDAD;
        userId = entidad.id_entidad;
      }
    }

    // Buscar en administradores
    if (!user) {
      const admin = await this.adminRepository.findOne({ where: { email } });
      if (admin) {
        user = admin;
        userType = UserType.ADMIN;
        userId = admin.id_admin;
      }
    }

    if (!user) {
      return null;
    }

    // Verificar si está activo
    if (!user.activo) {
      throw new UnauthorizedException('Cuenta deshabilitada');
    }

    // Validar contraseña
    const isPasswordValid = await bcrypt.compare(contraseña, user.contraseña);
    if (!isPasswordValid) {
      return null;
    }

    const { contraseña: _, ...result } = user;
    return { ...result, userType, userId };
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.contraseña);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      email: user.email,
      sub: user.userId,
      userType: user.userType,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.userId,
        email: user.email,
        userType: user.userType,
        ...this.getUserSpecificData(user),
      },
    };
  }

  async registerCiudadano(registerDto: RegisterCiudadanoDto) {
    // Verificar si el email ya existe en cualquier tabla
    const existsInCiudadanos = await this.ciudadanoRepository.findOne({
      where: { email: registerDto.email },
    });
    const existsInEntidades = await this.entidadRepository.findOne({
      where: { email: registerDto.email },
    });
    const existsInAdmins = await this.adminRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existsInCiudadanos || existsInEntidades || existsInAdmins) {
      throw new ConflictException('El email ya está registrado');
    }

    // Verificar cédula única
    const existsCedula = await this.ciudadanoRepository.findOne({
      where: { cedula: registerDto.cedula },
    });

    if (existsCedula) {
      throw new ConflictException('La cédula ya está registrada');
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(registerDto.contraseña, 10);

    // Crear ciudadano
    const ciudadano = this.ciudadanoRepository.create({
      ...registerDto,
      contraseña: hashedPassword,
    });

    const savedCiudadano = await this.ciudadanoRepository.save(ciudadano);

    // Auto-login
    const payload = {
      email: savedCiudadano.email,
      sub: savedCiudadano.id_ciudadano,
      userType: UserType.CIUDADANO,
    };

    const { contraseña, ...result } = savedCiudadano;

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: savedCiudadano.id_ciudadano,
        userType: UserType.CIUDADANO,
        ...result,
      },
    };
  }

  private getUserSpecificData(user: any) {
    if (user.userType === UserType.CIUDADANO) {
      return {
        nombre: user.nombre,
        apellidos: user.apellidos,
        cedula: user.cedula,
        telefono: user.telefono,
        strikes: user.strikes,
      };
    } else if (user.userType === UserType.ENTIDAD) {
      return {
        nombre_entidad: user.nombre_entidad,
        tipo_entidad: user.tipo_entidad,
        telefono_emergencia: user.telefono_emergencia,
      };
    } else if (user.userType === UserType.ADMIN) {
      return {
        nombre: user.nombre,
        apellidos: user.apellidos,
        nivel_acceso: user.nivel_acceso,
      };
    }
    return {};
  }

  async findCiudadanoById(id: number): Promise<Ciudadano | null> {
    return this.ciudadanoRepository.findOne({ where: { id_ciudadano: id } });
  }

  async findEntidadById(id: number): Promise<EntidadPublica | null> {
    return this.entidadRepository.findOne({ where: { id_entidad: id } });
  }

  async findAdminById(id: number): Promise<Administrador | null> {
    return this.adminRepository.findOne({ where: { id_admin: id } });
  }

  async incrementStrikes(ciudadanoId: number): Promise<Ciudadano> {
    const ciudadano = await this.findCiudadanoById(ciudadanoId);
    
    if (!ciudadano) {
      throw new NotFoundException('Ciudadano no encontrado');
    }

    ciudadano.strikes += 1;

    // Deshabilitar si alcanza 3 strikes
    if (ciudadano.strikes >= 3) {
      ciudadano.activo = false;
    }

    return this.ciudadanoRepository.save(ciudadano);
  }

  /**
   * Buscar usuario por email en todas las tablas
   */
  async findByEmail(email: string): Promise<{ user: any; userType: UserType } | null> {
    // Buscar en ciudadanos
    const ciudadano = await this.ciudadanoRepository.findOne({ where: { email } });
    if (ciudadano) {
      return { user: ciudadano, userType: UserType.CIUDADANO };
    }

    // Buscar en entidades
    const entidad = await this.entidadRepository.findOne({ where: { email } });
    if (entidad) {
      return { user: entidad, userType: UserType.ENTIDAD };
    }

    // Buscar en administradores
    const admin = await this.adminRepository.findOne({ where: { email } });
    if (admin) {
      return { user: admin, userType: UserType.ADMIN };
    }

    return null;
  }

  /**
   * Buscar usuario por ID y tipo
   */
  async findById(id: number, userType: UserType): Promise<any> {
    switch (userType) {
      case UserType.CIUDADANO:
        return this.findCiudadanoById(id);
      case UserType.ENTIDAD:
        return this.findEntidadById(id);
      case UserType.ADMIN:
        return this.findAdminById(id);
      default:
        return null;
    }
  }

  /**
   * Obtener todos los ciudadanos
   */
  async getAllCiudadanos(): Promise<Ciudadano[]> {
    return this.ciudadanoRepository.find();
  }

  /**
   * Obtener todas las entidades
   */
  async getAllEntidades(): Promise<EntidadPublica[]> {
    return this.entidadRepository.find();
  }

  /**
   * Obtener todos los administradores
   */
  async getAllAdmins(): Promise<Administrador[]> {
    return this.adminRepository.find();
  }

  /**
   * Deshabilitar/habilitar usuario
   */
  async toggleUserStatus(id: number, userType: UserType): Promise<void> {
    const user = await this.findById(id, userType);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    user.activo = !user.activo;

    switch (userType) {
      case UserType.CIUDADANO:
        await this.ciudadanoRepository.save(user);
        break;
      case UserType.ENTIDAD:
        await this.entidadRepository.save(user);
        break;
      case UserType.ADMIN:
        await this.adminRepository.save(user);
        break;
    }
  }

  /**
   * Registrar Entidad Pública (solo ADMIN)
   */
  async registerEntidad(registerDto: RegisterEntidadDto) {
    // Verificar si el email ya existe en cualquier tabla
    const existsInCiudadanos = await this.ciudadanoRepository.findOne({
      where: { email: registerDto.email },
    });
    const existsInEntidades = await this.entidadRepository.findOne({
      where: { email: registerDto.email },
    });
    const existsInAdmins = await this.adminRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existsInCiudadanos || existsInEntidades || existsInAdmins) {
      throw new ConflictException('El email ya está registrado');
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(registerDto.contraseña, 10);

    // Crear entidad
    const entidad = this.entidadRepository.create({
      ...registerDto,
      contraseña: hashedPassword,
    });

    const savedEntidad = await this.entidadRepository.save(entidad);

    // Auto-login
    const payload = {
      email: savedEntidad.email,
      sub: savedEntidad.id_entidad,
      userType: UserType.ENTIDAD,
    };

    const { contraseña, ...result } = savedEntidad;

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: savedEntidad.id_entidad,
        userType: UserType.ENTIDAD,
        ...result,
      },
    };
  }

  /**
   * Registrar Administrador (solo ADMIN)
   */
  async registerAdmin(registerDto: RegisterAdminDto) {
    // Verificar si el email ya existe en cualquier tabla
    const existsInCiudadanos = await this.ciudadanoRepository.findOne({
      where: { email: registerDto.email },
    });
    const existsInEntidades = await this.entidadRepository.findOne({
      where: { email: registerDto.email },
    });
    const existsInAdmins = await this.adminRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existsInCiudadanos || existsInEntidades || existsInAdmins) {
      throw new ConflictException('El email ya está registrado');
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(registerDto.contraseña, 10);

    // Crear administrador
    const admin = this.adminRepository.create({
      ...registerDto,
      contraseña: hashedPassword,
    });

    const savedAdmin = await this.adminRepository.save(admin);

    // Auto-login
    const payload = {
      email: savedAdmin.email,
      sub: savedAdmin.id_admin,
      userType: UserType.ADMIN,
    };

    const { contraseña, ...result } = savedAdmin;

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: savedAdmin.id_admin,
        userType: UserType.ADMIN,
        ...result,
      },
    };
  }
}

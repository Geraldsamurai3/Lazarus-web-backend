import { Injectable, UnauthorizedException, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Ciudadano } from '../entity/ciudadano.entity';
import { EntidadPublica } from '../entity/entidad-publica.entity';
import { Administrador } from '../entity/administrador.entity';
import { PasswordResetToken } from '../entity/password-reset-token.entity';
import { LoginDto, RegisterCiudadanoDto, RegisterEntidadDto, RegisterAdminDto, ForgotPasswordDto, ResetPasswordDto } from '../dto/user-roles.dto';
import { UserType } from '../../common/enums/user-type.enum';
import { EmailService } from '../../email/email.service';

@Injectable()
export class UnifiedAuthService {
  constructor(
    @InjectRepository(Ciudadano)
    private ciudadanoRepository: Repository<Ciudadano>,
    @InjectRepository(EntidadPublica)
    private entidadRepository: Repository<EntidadPublica>,
    @InjectRepository(Administrador)
    private adminRepository: Repository<Administrador>,
    @InjectRepository(PasswordResetToken)
    private passwordResetTokenRepository: Repository<PasswordResetToken>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  /**
   * Verifica si un email ya existe en cualquiera de las 3 tablas
   * @returns true si el email existe, false si no existe
   */
  async emailExists(email: string): Promise<boolean> {
    const existsInCiudadanos = await this.ciudadanoRepository.findOne({
      where: { email },
    });
    
    if (existsInCiudadanos) return true;

    const existsInEntidades = await this.entidadRepository.findOne({
      where: { email },
    });
    
    if (existsInEntidades) return true;

    const existsInAdmins = await this.adminRepository.findOne({
      where: { email },
    });
    
    return !!existsInAdmins;
  }

  /**
   * Verifica si un email está disponible para registro (endpoint público)
   * @returns { available: boolean, message: string }
   */
  async checkEmailAvailability(email: string): Promise<{ available: boolean; message: string }> {
    const exists = await this.emailExists(email);
    
    if (exists) {
      return {
        available: false,
        message: 'El email ya está registrado en el sistema',
      };
    }

    return {
      available: true,
      message: 'El email está disponible',
    };
  }

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
    const emailInUse = await this.emailExists(registerDto.email);
    if (emailInUse) {
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

    // 📧 Enviar email de bienvenida
    try {
      await this.emailService.sendWelcomeEmail(
        savedCiudadano.email,
        `${savedCiudadano.nombre} ${savedCiudadano.apellidos}`,
        UserType.CIUDADANO,
      );
    } catch (error) {
      console.error('Error enviando email de bienvenida:', error);
    }

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

  async incrementStrikes(ciudadanoId: number, incidentId?: number): Promise<Ciudadano> {
    const ciudadano = await this.findCiudadanoById(ciudadanoId);
    
    if (!ciudadano) {
      throw new NotFoundException('Ciudadano no encontrado');
    }

    ciudadano.strikes += 1;

    // Deshabilitar si alcanza 3 strikes
    if (ciudadano.strikes >= 3) {
      ciudadano.activo = false;
    }

    const updatedCiudadano = await this.ciudadanoRepository.save(ciudadano);

    // 📧 Enviar email de strike
    try {
      await this.emailService.sendStrikeEmail(
        updatedCiudadano.email,
        `${updatedCiudadano.nombre} ${updatedCiudadano.apellidos}`,
        updatedCiudadano.strikes,
        incidentId || 0,
      );
    } catch (error) {
      console.error('Error enviando email de strike:', error);
    }

    return updatedCiudadano;
  }

  /**
   * Buscar usuario por email en todas las tablas
   */
  async findByEmail(email: string): Promise<{ 
    user: any; 
    userType: UserType;
    repository: Repository<any>;
  } | null> {
    // Buscar en ciudadanos
    const ciudadano = await this.ciudadanoRepository.findOne({ where: { email } });
    if (ciudadano) {
      return { 
        user: ciudadano, 
        userType: UserType.CIUDADANO,
        repository: this.ciudadanoRepository,
      };
    }

    // Buscar en entidades
    const entidad = await this.entidadRepository.findOne({ where: { email } });
    if (entidad) {
      return { 
        user: entidad, 
        userType: UserType.ENTIDAD,
        repository: this.entidadRepository,
      };
    }

    // Buscar en administradores
    const admin = await this.adminRepository.findOne({ where: { email } });
    if (admin) {
      return { 
        user: admin, 
        userType: UserType.ADMIN,
        repository: this.adminRepository,
      };
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
    const emailInUse = await this.emailExists(registerDto.email);
    if (emailInUse) {
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

    // 📧 Enviar email de bienvenida
    try {
      await this.emailService.sendWelcomeEmail(
        savedEntidad.email,
        savedEntidad.nombre_entidad,
        UserType.ENTIDAD,
      );
    } catch (error) {
      console.error('Error enviando email de bienvenida:', error);
    }

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
    const emailInUse = await this.emailExists(registerDto.email);
    if (emailInUse) {
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

    // 📧 Enviar email de bienvenida
    try {
      await this.emailService.sendWelcomeEmail(
        savedAdmin.email,
        `${savedAdmin.nombre} ${savedAdmin.apellidos}`,
        UserType.ADMIN,
      );
    } catch (error) {
      console.error('Error enviando email de bienvenida:', error);
    }

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

  /**
   * Forgot Password - Generar token y enviar email
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ success: boolean; message: string }> {
    const { email } = forgotPasswordDto;

    console.log(`Solicitud de reset de contraseña para: ${email}`);

    // Buscar usuario en todas las tablas
    const userInfo = await this.findByEmail(email);

    if (!userInfo) {
      console.log(`Email no encontrado: ${email}`);
      return { 
        success: false,
        message: 'No se encontró ninguna cuenta asociada a este correo electrónico. Por favor, verifica que el email sea correcto o regístrate si aún no tienes una cuenta.' 
      };
    }

    const { user, userType } = userInfo;

    // Generar token único
    const token = crypto.randomBytes(32).toString('hex');

    // Expiración: 1 hora
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Guardar token en la base de datos
    const resetToken = this.passwordResetTokenRepository.create({
      email,
      token,
      user_type: userType,
      expires_at: expiresAt,
    });

    await this.passwordResetTokenRepository.save(resetToken);

    // Enviar email con el token
    try {
      const nombre = userType === UserType.ENTIDAD 
        ? user.nombre_entidad 
        : `${user.nombre} ${user.apellidos || ''}`.trim();

      await this.emailService.sendPasswordResetEmail(email, nombre, token);
      
      console.log(`Token de reset generado y enviado a ${email} (${userType})`);
    } catch (error) {
      console.error('Error enviando email de reset:', error);
      throw new BadRequestException('Error al enviar el correo de recuperación. Por favor, intenta nuevamente.');
    }

    return { 
      success: true,
      message: 'Se han enviado las instrucciones de recuperación a tu correo electrónico. Por favor, revisa tu bandeja de entrada y sigue los pasos para restablecer tu contraseña. El enlace expirará en 1 hora.' 
    };
  }

  /**
   * 🔑 Reset Password - Validar token y cambiar contraseña
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const { token, newPassword } = resetPasswordDto;

    // Buscar token válido
    const resetToken = await this.passwordResetTokenRepository.findOne({
      where: {
        token,
        used: false,
        expires_at: MoreThan(new Date()),
      },
    });

    if (!resetToken) {
      throw new BadRequestException('Token inválido o expirado');
    }

    // Buscar usuario según el tipo
    let user: any = null;
    let repository: Repository<any> | null = null;

    switch (resetToken.user_type) {
      case UserType.CIUDADANO:
        user = await this.ciudadanoRepository.findOne({ where: { email: resetToken.email } });
        repository = this.ciudadanoRepository;
        break;
      case UserType.ENTIDAD:
        user = await this.entidadRepository.findOne({ where: { email: resetToken.email } });
        repository = this.entidadRepository;
        break;
      case UserType.ADMIN:
        user = await this.adminRepository.findOne({ where: { email: resetToken.email } });
        repository = this.adminRepository;
        break;
    }

    if (!user || !repository) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    user.contraseña = hashedPassword;
    await repository.save(user);

    // Marcar token como usado
    resetToken.used = true;
    await this.passwordResetTokenRepository.save(resetToken);

    console.log(`Contraseña actualizada para ${resetToken.email} (${resetToken.user_type})`);

    return { message: 'Contraseña actualizada exitosamente' };
  }

  /**
   * Obtiene el perfil completo del usuario autenticado
   */
  async getProfile(userId: number, userType: UserType): Promise<any> {
    let user: any = null;

    switch (userType) {
      case UserType.CIUDADANO:
        user = await this.ciudadanoRepository.findOne({
          where: { id_ciudadano: userId },
        });
        if (user) {
          return {
            id: user.id_ciudadano,
            nombre: user.nombre,
            apellidos: user.apellidos,
            email: user.email,
            cedula: user.cedula,
            telefono: user.telefono,
            provincia: user.provincia,
            canton: user.canton,
            distrito: user.distrito,
            direccion: user.direccion,
            userType: 'ciudadano',
            activo: user.activo,
            strikes: user.strikes,
            fecha_creacion: user.fecha_creacion,
            fecha_actualizacion: user.fecha_actualizacion,
          };
        }
        break;

      case UserType.ENTIDAD:
        user = await this.entidadRepository.findOne({
          where: { id_entidad: userId },
        });
        if (user) {
          return {
            id: user.id_entidad,
            nombre_entidad: user.nombre_entidad,
            tipo_entidad: user.tipo_entidad,
            email: user.email,
            telefono_emergencia: user.telefono_emergencia,
            provincia: user.provincia,
            canton: user.canton,
            distrito: user.distrito,
            ubicacion: user.ubicacion,
            userType: 'entidad_publica',
            activo: user.activo,
            fecha_creacion: user.fecha_creacion,
            fecha_actualizacion: user.fecha_actualizacion,
          };
        }
        break;

      case UserType.ADMIN:
        user = await this.adminRepository.findOne({
          where: { id_admin: userId },
        });
        if (user) {
          return {
            id: user.id_admin,
            nombre: user.nombre,
            apellidos: user.apellidos,
            email: user.email,
            provincia: user.provincia,
            canton: user.canton,
            distrito: user.distrito,
            nivel_acceso: user.nivel_acceso,
            userType: 'administrador',
            activo: user.activo,
            fecha_creacion: user.fecha_creacion,
            fecha_actualizacion: user.fecha_actualizacion,
          };
        }
        break;
    }

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  /**
   * Actualiza el perfil del usuario autenticado
   */
  async updateProfile(userId: number, userType: UserType, updateData: any): Promise<any> {
    let user: any = null;
    let repository: any = null;

    switch (userType) {
      case UserType.CIUDADANO:
        repository = this.ciudadanoRepository;
        user = await repository.findOne({
          where: { id_ciudadano: userId },
        });
        
        if (user) {
          // Solo permitir actualizar campos específicos de ciudadano
          const allowedFields = ['nombre', 'apellidos', 'telefono', 'provincia', 'canton', 'distrito', 'direccion'];
          const filteredData = Object.keys(updateData)
            .filter(key => allowedFields.includes(key) && updateData[key] !== undefined)
            .reduce((obj, key) => {
              obj[key] = updateData[key];
              return obj;
            }, {} as Record<string, any>);

          if (Object.keys(filteredData).length === 0) {
            throw new BadRequestException('No hay campos válidos para actualizar');
          }

          await repository.update({ id_ciudadano: userId }, filteredData);
          console.log(`Perfil actualizado - Ciudadano ID: ${userId}`);
        }
        break;

      case UserType.ENTIDAD:
        repository = this.entidadRepository;
        user = await repository.findOne({
          where: { id_entidad: userId },
        });
        
        if (user) {
          // Solo permitir actualizar campos específicos de entidad
          const allowedFields = ['nombre_entidad', 'telefono_emergencia', 'provincia', 'canton', 'distrito', 'ubicacion'];
          const filteredData = Object.keys(updateData)
            .filter(key => allowedFields.includes(key) && updateData[key] !== undefined)
            .reduce((obj, key) => {
              obj[key] = updateData[key];
              return obj;
            }, {} as Record<string, any>);

          if (Object.keys(filteredData).length === 0) {
            throw new BadRequestException('No hay campos válidos para actualizar');
          }

          await repository.update({ id_entidad: userId }, filteredData);
          console.log(`Perfil actualizado - Entidad ID: ${userId}`);
        }
        break;

      case UserType.ADMIN:
        repository = this.adminRepository;
        user = await repository.findOne({
          where: { id_admin: userId },
        });
        
        if (user) {
          // Solo permitir actualizar campos específicos de administrador
          const allowedFields = ['nombre', 'apellidos', 'provincia', 'canton', 'distrito'];
          const filteredData = Object.keys(updateData)
            .filter(key => allowedFields.includes(key) && updateData[key] !== undefined)
            .reduce((obj, key) => {
              obj[key] = updateData[key];
              return obj;
            }, {} as Record<string, any>);

          if (Object.keys(filteredData).length === 0) {
            throw new BadRequestException('No hay campos válidos para actualizar');
          }

          await repository.update({ id_admin: userId }, filteredData);
          console.log(`Perfil actualizado - Administrador ID: ${userId}`);
        }
        break;
    }

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Obtener el perfil actualizado
    return this.getProfile(userId, userType);
  }
}

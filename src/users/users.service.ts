import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole, UserStatus } from './entity/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.contraseña, 10);

    const user = this.usersRepository.create({
      ...createUserDto,
      contraseña: hashedPassword,
    });

    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingUser) {
        throw new ConflictException('El email ya está en uso');
      }
    }

    if (updateUserDto.contraseña) {
      updateUserDto.contraseña = await bcrypt.hash(updateUserDto.contraseña, 10);
    }

    await this.usersRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  async incrementStrikes(id: number): Promise<User> {
    const user = await this.findOne(id);
    user.strikes += 1;
    
    // Auto-disable user after 3 strikes
    if (user.strikes >= 3) {
      user.estado = UserStatus.DESHABILITADO;
    }

    return this.usersRepository.save(user);
  }

  async validatePassword(plainTextPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainTextPassword, hashedPassword);
  }

  async getUserCount(): Promise<number> {
    return this.usersRepository.count();
  }

  async changeUserRole(userId: number, newRole: UserRole, adminUserId: number): Promise<User> {
    // Verify that the admin user exists and is actually an admin
    const adminUser = await this.findOne(adminUserId);
    if (adminUser.rol !== UserRole.ADMIN) {
      throw new ConflictException('Solo los administradores pueden cambiar roles de usuarios');
    }

    // Verify target user exists
    const targetUser = await this.findOne(userId);
    
    // Prevent admin from changing their own role (security measure)
    if (userId === adminUserId) {
      throw new ConflictException('Los administradores no pueden cambiar su propio rol');
    }

    // Update the user role
    await this.usersRepository.update(userId, { rol: newRole });
    return this.findOne(userId);
  }
}

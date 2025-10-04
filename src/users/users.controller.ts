import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, ChangeUserRoleDto } from './dto/user.dto';
import { User, UserRole } from './entity/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body(ValidationPipe) createUserDto: CreateUserDto): Promise<Omit<User, 'contraseña'>> {
    const user = await this.usersService.create(createUserDto);
    // Don't return password in response
    const { contraseña, ...result } = user;
    return result;
  }

  @Get()
  async findAll(): Promise<Omit<User, 'contraseña'>[]> {
    const users = await this.usersService.findAll();
    return users.map(({ contraseña, ...user }) => user);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Omit<User, 'contraseña'>> {
    const user = await this.usersService.findOne(id);
    const { contraseña, ...result } = user;
    return result;
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
  ): Promise<Omit<User, 'contraseña'>> {
    const user = await this.usersService.update(id, updateUserDto);
    const { contraseña, ...result } = user;
    return result;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.usersService.remove(id);
  }

  @Patch(':id/strike')
  async incrementStrikes(@Param('id', ParseIntPipe) id: number): Promise<Omit<User, 'contraseña'>> {
    const user = await this.usersService.incrementStrikes(id);
    const { contraseña, ...result } = user;
    return result;
  }

  @Patch(':id/role')
  async changeUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) changeRoleDto: ChangeUserRoleDto,
  ): Promise<Omit<User, 'contraseña'>> {
    const user = await this.usersService.changeUserRole(id, changeRoleDto.rol, changeRoleDto.adminUserId);
    const { contraseña, ...result } = user;
    return result;
  }
}

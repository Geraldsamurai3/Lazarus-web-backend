import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Ciudadano } from './entity/ciudadano.entity';
import { EntidadPublica } from './entity/entidad-publica.entity';
import { Administrador } from './entity/administrador.entity';
import { UnifiedAuthService } from './services/unified-auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ciudadano, EntidadPublica, Administrador]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, UnifiedAuthService],
  exports: [UsersService, UnifiedAuthService, TypeOrmModule],
})
export class UsersModule {}

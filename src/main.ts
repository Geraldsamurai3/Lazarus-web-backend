import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Enable CORS desde variables de entorno
  const corsOrigins = configService.get<string>('CORS_ORIGINS');
  const allowedOrigins = corsOrigins 
    ? corsOrigins.split(',').map(origin => origin.trim())
    : ['http://localhost:3000', 'http://localhost:3001'];

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  console.log('✅ CORS habilitado para:', allowedOrigins);

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Global serialization (ocultar campos @Exclude)
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Global prefix for all endpoints

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`Lazarus API está ejecutándose en http://localhost:${port}`);
  console.log(`Documentación disponible en http://localhost:${port}`);
  console.log(`WebSocket disponible en ws://localhost:${port}`);
}
bootstrap();

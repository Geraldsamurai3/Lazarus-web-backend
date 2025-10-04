import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend integration
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://10.24.23.119:3000'], // Frontend URLs
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Global prefix for all endpoints

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`🚀 Lazarus API está ejecutándose en http://localhost:${port}`);
  console.log(`📊 Documentación disponible en http://localhost:${port}`);
  console.log(`🔌 WebSocket disponible en ws://localhost:${port}`);
}
bootstrap();

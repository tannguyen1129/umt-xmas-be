import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
// 1. Thêm import này để lấy middleware của Express
import { json, urlencoded } from 'express'; 

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api');
  
  app.enableCors({
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // --- SỬA ĐỔI QUAN TRỌNG: TĂNG GIỚI HẠN UPLOAD ---
  // Tăng giới hạn lên 50MB để thoải mái nhận ảnh 4K
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  // --------------------------------------------------

  app.useGlobalPipes(new ValidationPipe());

  // Sử dụng process.cwd() để lấy đường dẫn gốc của dự án
  app.useStaticAssets(join(process.cwd(), 'public')); 

  await app.listen(4000);
  console.log(`Application is running on: http://localhost:4000`);
}
bootstrap();
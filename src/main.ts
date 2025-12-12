import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  app.enableCors({
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe());

  // --- SỬA ĐỔI QUAN TRỌNG TẠI ĐÂY ---
  // Sử dụng process.cwd() để lấy đường dẫn gốc của dự án
  // Điều này đảm bảo tìm thấy thư mục public dù đang chạy ở chế độ dev hay prod
  app.useStaticAssets(join(process.cwd(), 'public')); 
  // -----------------------------------

  await app.listen(4000);
  console.log(`Application is running on: http://localhost:4000`);
}
bootstrap();
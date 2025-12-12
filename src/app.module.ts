import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WishesModule } from './wishes/wishes.module';
import { AdminModule } from './admin/admin.module';
import { ContactsModule } from './contacts/contacts.module';

import { Wish } from './wishes/entities/wish.entity';
import { AdminUser } from './admin/entities/admin-user.entity';
import { Contact } from './contacts/entities/contact.entity';

@Module({
  imports: [
    // Load biến môi trường từ .env
    ConfigModule.forRoot({ isGlobal: true }),

    // Cấu hình database
    TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.DB_HOST!,
  port: parseInt(process.env.DB_PORT!, 10),
  username: process.env.DB_USERNAME!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_DATABASE!,
  entities: [Wish, AdminUser, Contact],
  synchronize: true,
  autoLoadEntities: true,
}),

    WishesModule,
    AdminModule,
    ContactsModule,
  ],
})
export class AppModule {}

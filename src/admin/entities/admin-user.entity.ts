import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('admin_users')
export class AdminUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string; 
}
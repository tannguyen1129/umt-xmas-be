// entities/wish.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum UserCategory {
  HS_THPT = 'HS_THPT',
  SV_UMT = 'SV_UMT',
  KHAC = 'KHAC',
}

export enum WishStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('wishes')
export class Wish {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  full_name: string;

  @Column()
  phone: string;

  // Phân loại đối tượng
  @Column({ type: 'enum', enum: UserCategory })
  category: UserCategory;

  // Dành cho HS THPT (Nullable)
  @Column({ nullable: true })
  school_name: string;

  // Dành cho SV UMT (Nullable)
  @Column({ nullable: true })
  faculty: string; 

  @Column({ nullable: true })
  course_class: string; 

  @Column('text')
  wish_content: string;

  @Column()
  template_id: number;

  // --- MỚI: Đường dẫn ảnh thiệp ---
  @Column({ nullable: true })
  image_url: string;

  @Column({ default: false })
  is_agreed: boolean;

  @Column({ type: 'enum', enum: WishStatus, default: WishStatus.PENDING })
  status: WishStatus;

  @Column({ nullable: true })
  ip_address: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
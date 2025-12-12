// dto/create-wish.dto.ts
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, IsBoolean, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer'; // Cần thêm cái này
import { UserCategory } from '../entities/wish.entity';

export class CreateWishDto {
  @IsNotEmpty()
  @IsString()
  full_name: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsEnum(UserCategory)
  category: UserCategory;

  @IsOptional()
  @IsString()
  school_name?: string;

  @IsOptional()
  @IsString()
  faculty?: string;

  @IsOptional()
  @IsString()
  course_class?: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  wish_content: string;

  // FormData gửi số lên sẽ là string "1", cần ép kiểu về number
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  template_id: number;

  // FormData gửi boolean lên sẽ là string "true", cần ép kiểu
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  is_agreed: boolean;
}
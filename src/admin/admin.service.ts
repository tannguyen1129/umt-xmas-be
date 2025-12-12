import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminUser } from './entities/admin-user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(AdminUser)
    private adminRepo: Repository<AdminUser>,
    private jwtService: JwtService,
  ) {}

  // Hàm nhận tham số username và password
  async createInitialAdmin(username: string, pass: string) {
    // Kiểm tra xem user đã tồn tại chưa để tránh lỗi trùng lặp
    const existingAdmin = await this.adminRepo.findOne({ where: { username } });
    if (existingAdmin) {
      return { message: `Tài khoản '${username}' đã tồn tại!` };
    }

    const hash = await bcrypt.hash(pass, 10);
    const admin = this.adminRepo.create({ username, password: hash });
    await this.adminRepo.save(admin);
    
    return { message: 'Tạo tài khoản thành công!', username };
  }
  
  async login(username: string, pass: string) {
    const admin = await this.adminRepo.findOne({ where: { username } });
    if (!admin) throw new UnauthorizedException('Sai tài khoản');

    const isMatch = await bcrypt.compare(pass, admin.password);
    if (!isMatch) throw new UnauthorizedException('Sai mật khẩu');

    const payload = { sub: admin.id, username: admin.username };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
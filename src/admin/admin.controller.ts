import { Controller, Post, Body } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('init')
  // Nhận body chứa username và password
  createInit(@Body() body: { username?: string; password?: string }) {
    // Nếu không gửi gì thì dùng mặc định 'admin'/'admin123' cho tiện test
    const user = body.username || 'admin';
    const pass = body.password || 'admin123';
    
    return this.adminService.createInitialAdmin(user, pass);
  }

  @Post('login')
  login(@Body() body: any) {
    return this.adminService.login(body.username, body.password);
  }
}
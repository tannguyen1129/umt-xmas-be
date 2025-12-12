import { Controller, Get, Post, Body, Patch, Param, Query, Req, Delete, Res, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Response } from 'express'; 

@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('postcardImage', {
    // Cấu hình lưu file tạm thời (hoặc lưu luôn vào public/uploads)
    storage: diskStorage({
      destination: './public/uploads', // Đảm bảo folder này tồn tại
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = extname(file.originalname);
        callback(null, `wish-${uniqueSuffix}${ext}`);
      },
    }),
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
        return callback(new BadRequestException('Chỉ chấp nhận file ảnh!'), false);
      }
      callback(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn 5MB
  }))
  async create(
    @Body() createWishDto: CreateWishDto, 
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any
  ) { 
    if (!file) {
      throw new BadRequestException('Vui lòng gửi kèm ảnh thiệp!');
    }

    const ip = req.ip || req.socket.remoteAddress;
    
    // Đường dẫn file để lưu vào DB (Ví dụ: /uploads/filename.png)
    const imageUrl = `/uploads/${file.filename}`;

    return this.wishesService.create(createWishDto, imageUrl, ip);
  }


  @Get('public')
  findAllPublic() {
    return this.wishesService.findAllApproved();
  }

  @Get('admin')
  findAllForAdmin(@Query('status') status: string, @Query('category') category: string) {
    return this.wishesService.findAllForAdmin(status, category);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.wishesService.updateStatus(id, status);
  }

  @Get('stats')
  getStats() {
    return this.wishesService.getStats();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.wishesService.remove(id);
  }

  @Get('export/excel')
  async exportExcel(@Res() res: Response) {
    const workbook = await this.wishesService.downloadExcel();
    
    // Thiết lập Header để trình duyệt hiểu đây là file tải về
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=umt-wishes.xlsx');

    // Ghi file trực tiếp vào response stream
    await workbook.xlsx.write(res);
    res.end();
  }
}
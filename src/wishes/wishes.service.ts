import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wish, WishStatus, UserCategory } from './entities/wish.entity';
import { CreateWishDto } from './dto/create-wish.dto';
import * as ExcelJS from 'exceljs';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private wishRepository: Repository<Wish>,
  ) {}

  async create(createWishDto: CreateWishDto, imageUrl: string, ip: string) {
    // FIX LỖI: Thay null bằng undefined để khớp với kiểu dữ liệu của DTO
    if (createWishDto.category === UserCategory.HS_THPT) {
      createWishDto.faculty = undefined;
      createWishDto.course_class = undefined;
    } else if (createWishDto.category === UserCategory.SV_UMT) {
      createWishDto.school_name = undefined;
    }

    const newWish = this.wishRepository.create({
      ...createWishDto,
      image_url: imageUrl,
      ip_address: ip,
    });
    
    return this.wishRepository.save(newWish);
  }

  findAllApproved() {
    return this.wishRepository.find({
      where: { status: WishStatus.APPROVED },
      order: { created_at: 'DESC' },
      select: ['full_name', 'wish_content', 'template_id', 'category', 'school_name', 'faculty', 'course_class', 'image_url', 'created_at'],
    });
  }

  findAllForAdmin(status: string, category: string) {
    const query = this.wishRepository.createQueryBuilder('wish');

    if (status) {
      query.andWhere('wish.status = :status', { status });
    }
    if (category) {
      query.andWhere('wish.category = :category', { category });
    }

    return query.orderBy('wish.created_at', 'DESC').getMany();
  }

  async updateStatus(id: string, status: string) {
    return this.wishRepository.update(id, { status: status as WishStatus });
  }

  // 1. Hàm Xóa
  async remove(id: string) {
    const wish = await this.wishRepository.findOne({ where: { id } });
    if (!wish) throw new NotFoundException('Không tìm thấy lời chúc');
    return this.wishRepository.remove(wish);
  }

  // 2. Hàm Thống kê (Dashboard Stats)
  async getStats() {
    const total = await this.wishRepository.count();
    const approved = await this.wishRepository.count({ where: { status: WishStatus.APPROVED } });
    const pending = await this.wishRepository.count({ where: { status: WishStatus.PENDING } });
    const hs = await this.wishRepository.count({ where: { category: UserCategory.HS_THPT } });
    const sv = await this.wishRepository.count({ where: { category: UserCategory.SV_UMT } });

    return { total, approved, pending, hs, sv };
  }

  // 3. Hàm Xuất Excel
  async downloadExcel() {
    const wishes = await this.wishRepository.find({ order: { created_at: 'DESC' } });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Danh sách Lời chúc');

    // Tạo Header
    sheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Họ tên', key: 'full_name', width: 25 },
      { header: 'SĐT', key: 'phone', width: 15 },
      { header: 'Đối tượng', key: 'category', width: 15 },
      { header: 'Trường/Khoa', key: 'org_info', width: 30 },
      { header: 'Lời chúc', key: 'wish_content', width: 50 },
      { header: 'Trạng thái', key: 'status', width: 15 },
      { header: 'Link Ảnh', key: 'image_url', width: 30 }, // Thêm cột ảnh vào Excel luôn
      { header: 'Ngày tạo', key: 'created_at', width: 20 },
    ];

    // Thêm dữ liệu
    wishes.forEach((w) => {
      sheet.addRow({
        id: w.id.substring(0, 8) + '...', 
        full_name: w.full_name,
        phone: w.phone,
        category: w.category === 'HS_THPT' ? 'Học sinh' : 'Sinh viên',
        org_info: w.school_name || `${w.faculty || ''} - ${w.course_class || ''}`,
        wish_content: w.wish_content,
        status: w.status,
        image_url: w.image_url,
        created_at: w.created_at.toLocaleString('vi-VN'),
      });
    });

    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF003B70' } };

    return workbook;
  }
}
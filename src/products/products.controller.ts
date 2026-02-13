/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  Injectable, // 👈 เพิ่ม
  NestInterceptor, // 👈 เพิ่ม
  ExecutionContext, // 👈 เพิ่ม
  CallHandler, // 👈 เพิ่ม
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { PRODUCT_IMAGE } from './products.constants';
import { Observable, throwError } from 'rxjs'; // 👈 เพิ่ม
import { catchError } from 'rxjs/operators'; // 👈 เพิ่ม
import { unlink } from 'fs/promises'; // 👈 เพิ่ม (ใช้ลบไฟล์)
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UseGuards } from '@nestjs/common';

// 👇 1. สร้าง Class Interceptor ไว้ตรงนี้ (หรือไว้ล่างสุดก็ได้)
@Injectable()
export class CleanupFileInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError(async (err) => {
        const req = context.switchToHttp().getRequest();
        // ถ้ามีไฟล์ค้างอยู่ และเกิด Error -> ลบทิ้ง
        if (req.file && req.file.path) {
          try {
            await unlink(req.file.path);
            console.log(`🗑️ Auto-cleanup: ${req.file.path}`);
          } catch (e) {}
        }
        return throwError(() => err);
      }),
    );
  }
}

// 👇 2. ส่วน Controller ของเดิม
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  // เรียกใช้ตัวที่เราเขียนไว้ด้านบน
  @UseInterceptors(FileInterceptor('image'), CleanupFileInterceptor)
  create(
    @Body() dto: CreateProductDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({ maxSize: PRODUCT_IMAGE.MAX_SIZE }),
        ],
      }),
    )
    file?: Express.Multer.File,
  ) {
    return this.productsService.create(dto, file);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'), CleanupFileInterceptor)
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({ maxSize: PRODUCT_IMAGE.MAX_SIZE }),
        ],
      }),
    )
    file?: Express.Multer.File,
  ) {
    return this.productsService.update(id, updateProductDto, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}

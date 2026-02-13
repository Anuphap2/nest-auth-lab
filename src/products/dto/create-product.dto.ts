import {
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  IsOptional,
  IsArray,
} from 'class-validator';

import { Type, Transform } from 'class-transformer';
export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @IsOptional()
  @Transform(({ value }) => {
    // กรณีที่ 1: เป็น String ก้อนเดียว (เลือกสีเดียว หรือส่งมาแบบ "Red,Blue")
    if (typeof value === 'string') {
      // ถ้ามีจุลภาค ให้แยกออกเป็น array
      if (value.includes(',')) return value.split(',');
      // ถ้าไม่มีจุลภาค (สีเดียว) ให้จับใส่กล่อง array เลย
      return [value];
    }
    // กรณีที่ 2: เป็น Array อยู่แล้ว (เลือกหลายสี) หรือเป็นค่าอื่น ให้คืนค่าเดิม
    return value;
  })
  @IsArray({ message: 'color must be an array (สีต้องเป็นอาเรย์)' })
  @IsString({ each: true })
  color?: string[];

  @IsOptional()
  @IsString()
  description?: string;

}

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true }) // เพิ่มวันที่สร้าง/แก้ไขให้อัตโนมัติ
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, min: 0, type: Number, max: 1000000, default: 0 })
  price: number;

  @Prop({ type: [String], default: [] })
  color: string[];

  @Prop({ minlength: 0, maxlength: 500, default: '' })
  description: string;

  @Prop()
  imageUrl: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

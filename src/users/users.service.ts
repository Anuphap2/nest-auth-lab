import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserDoc } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private user: Model<UserDoc>) {}
  findByEmail(email: string) {
    return this.user.findOne({ email }).exec();
  }

  findByEmailWithPassword(email: string) {
    return this.user.findOne({ email }).select('+passwordHash').exec();
  }

  create(data: { email: string; passwordHash: string }) {
    return this.user.create(data);
  }
}

import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { AuthDto } from './dto/auth.dto';

import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  async signToken(userId: string, email: string) {
    const payload = { sub: userId, email };
    const token = await this.jwtService.signAsync(payload);

    return { access_token: token };
  }

  async signUp(dto: AuthDto) {
    const email = this.normalizeEmail(dto.email);
    const userExists = await this.userService.findByEmail(email);

    if (userExists) {
      throw new BadRequestException('Email already in use');
    }

    const passwordHash = await argon2.hash(dto.password);

    const newUser = await this.userService.create({
      email,
      passwordHash,
    });

    return this.signToken(newUser._id.toString(), email);
  }

  async signIn(dto: AuthDto) {
    const email = this.normalizeEmail(dto.email);
    const user = await this.userService.findByEmailWithPassword(email);

    if (!user)
      throw new UnauthorizedException('Email or password is incorrect');

    const passwordMatch = await argon2.verify(user.passwordHash, dto.password);

    if (!passwordMatch) {
      throw new UnauthorizedException('Email or password is incorrect');
    }
    return this.signToken(user._id.toString(), email);
  }
}

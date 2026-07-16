import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Role } from './role.enum';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  // ── Login ──────────────────────────────────────────────────────────
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { trainer: true },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const token = this.jwt.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        branchId: user.branchId,
        trainerId: user.trainerId,
        trainer: user.trainer,
      },
    };
  }

  // ── Register (SuperAdmin / Owner only) ──────────────────────────────
  async register(dto: RegisterDto, requestingUser: { role: Role }) {
    const allowed: Role[] = [Role.SuperAdmin, Role.Owner];
    if (!allowed.includes(requestingUser.role)) {
      throw new ForbiddenException('Only SuperAdmin or Owner can add system users');
    }

    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new BadRequestException('Email already registered');

    const hash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: hash,
        name: dto.name,
        role: dto.role,
        branchId: dto.branchId ?? null,
        trainerId: dto.trainerId ?? null,
      },
    });

    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }
}

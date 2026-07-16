import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGymDto } from './dto/create-gym.dto';

@Injectable()
export class GymService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.gym.findMany({ include: { branches: true } });
  }

  findOne(id: string) {
    return this.prisma.gym.findUnique({ where: { id }, include: { branches: true } });
  }

  create(dto: CreateGymDto) {
    return this.prisma.gym.create({ data: { name: dto.name } });
  }

  remove(id: string) {
    return this.prisma.gym.delete({ where: { id } });
  }
}

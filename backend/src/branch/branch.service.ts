import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBranchDto } from './dto/create-branch.dto';

@Injectable()
export class BranchService {
  constructor(private prisma: PrismaService) {}

  findAll(gymId?: string) {
    return this.prisma.branch.findMany({
      where: gymId ? { gymId } : undefined,
      include: { trainers: true },
    });
  }

  async findOne(id: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
      include: { trainers: true, members: true },
    });
    if (!branch) throw new NotFoundException('Branch not found');
    return branch;
  }

  create(dto: CreateBranchDto) {
    return this.prisma.branch.create({
      data: {
        gymId:         dto.gym_id,
        name:          dto.name,
        address:       dto.address,
        phone:         dto.phone,
        managerName:   dto.manager_name,
        openingTime:   dto.opening_time,
        closingTime:   dto.closing_time,
        lunchStart:    dto.lunch_start,
        lunchEnd:      dto.lunch_end,
        monthlyRate:   dto.monthly_rate   ?? 0,
        quarterlyRate: dto.quarterly_rate ?? 0,
        dailyRate:     dto.daily_rate     ?? 0,
      },
    });
  }

  async update(id: string, dto: Partial<CreateBranchDto>) {
    await this.findOne(id);
    return this.prisma.branch.update({
      where: { id },
      data: {
        name:          dto.name,
        address:       dto.address,
        phone:         dto.phone,
        managerName:   dto.manager_name,
        openingTime:   dto.opening_time,
        closingTime:   dto.closing_time,
        lunchStart:    dto.lunch_start,
        lunchEnd:      dto.lunch_end,
        monthlyRate:   dto.monthly_rate,
        quarterlyRate: dto.quarterly_rate,
        dailyRate:     dto.daily_rate,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.branch.delete({ where: { id } });
  }
}

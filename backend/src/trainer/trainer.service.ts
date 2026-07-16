import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { UpdateTrainerStatusDto } from './dto/update-trainer-status.dto';
import { Role } from '../auth/role.enum';

@Injectable()
export class TrainerService {
  constructor(private prisma: PrismaService) {}

  findAll(branchId?: string) {
    return this.prisma.trainer.findMany({
      where: branchId ? { branchId } : undefined,
      include: { branch: true, members: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { firstName: 'asc' },
    });
  }

  async findOne(id: string) {
    const trainer = await this.prisma.trainer.findUnique({
      where: { id },
      include: { branch: true, members: true, schedules: true },
    });
    if (!trainer) throw new NotFoundException('Trainer not found');
    return trainer;
  }

  create(dto: CreateTrainerDto) {
    return this.prisma.trainer.create({
      data: {
        branchId:         dto.branch_id,
        firstName:        dto.first_name,
        lastName:         dto.last_name,
        phone:            dto.phone,
        email:            dto.email,
        specialization:   dto.specialization,
        experienceYrs:    dto.experience_yrs   ?? 0,
        stipendPerMember: dto.stipend_per_member ?? 0,
      },
    });
  }

  /** PATCH /trainers/:id/status  — Trainers may only update their own */
  async updateStatus(
    id: string,
    dto: UpdateTrainerStatusDto,
    requestingUser: { role: Role; trainerId?: string | null },
  ) {
    await this.findOne(id);

    // Trainers can only edit their own profile
    if (
      requestingUser.role === Role.Trainer &&
      requestingUser.trainerId !== id
    ) {
      throw new ForbiddenException('You can only update your own status');
    }

    return this.prisma.trainer.update({
      where: { id },
      data: {
        status:              dto.status,
        unavailableUntil:    dto.unavailable_until ? new Date(dto.unavailable_until) : null,
        unavailableDuration: dto.unavailable_duration ?? null,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.trainer.delete({ where: { id } });
  }
}

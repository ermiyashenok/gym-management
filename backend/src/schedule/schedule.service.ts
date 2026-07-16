import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';

@Injectable()
export class ScheduleService {
  constructor(private prisma: PrismaService) {}

  findAll(trainerId?: string, memberId?: string) {
    return this.prisma.schedule.findMany({
      where: {
        ...(trainerId ? { trainerId } : {}),
        ...(memberId  ? { memberId  } : {}),
      },
      include: {
        trainer: { select: { id: true, firstName: true, lastName: true } },
        member:  { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: [{ day: 'asc' }, { time: 'asc' }],
    });
  }

  /**
   * POST /schedules — Book a slot with double-booking guard
   */
  async create(dto: CreateScheduleDto) {
    // 1. Verify trainer exists
    const trainer = await this.prisma.trainer.findUnique({ where: { id: dto.trainer_id } });
    if (!trainer) throw new NotFoundException('Trainer not found');

    // 2. Verify member exists
    const member = await this.prisma.member.findUnique({ where: { id: dto.member_id } });
    if (!member) throw new NotFoundException('Member not found');

    // 3. Check for double-booking (unique constraint: trainer_id + day + time)
    const existing = await this.prisma.schedule.findFirst({
      where: { trainerId: dto.trainer_id, day: dto.day, time: dto.time },
    });
    if (existing) {
      throw new ConflictException(
        `Trainer already has a session booked at ${dto.time} on day ${dto.day}`,
      );
    }

    // 4. Save slot + create a notification
    return this.prisma.$transaction(async (tx) => {
      const schedule = await tx.schedule.create({
        data: {
          trainerId: dto.trainer_id,
          day:       dto.day,
          time:      dto.time,
          memberId:  dto.member_id,
        },
      });

      await tx.notification.create({
        data: {
          type:     'Info',
          message:  `Session booked: ${trainer.firstName} ${trainer.lastName} with ${member.firstName} ${member.lastName} on day ${dto.day} at ${dto.time}`,
          memberId: dto.member_id,
          branchId: trainer.branchId,
          isRead:   false,
        },
      });

      return schedule;
    });
  }

  /**
   * DELETE /schedules?trainerId=&day=&time=
   */
  async remove(trainerId: string, day: number, time: string) {
    const slot = await this.prisma.schedule.findFirst({
      where: { trainerId, day, time },
    });
    if (!slot) throw new NotFoundException('Schedule slot not found');
    return this.prisma.schedule.delete({ where: { id: slot.id } });
  }
}

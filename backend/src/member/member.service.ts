import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

@Injectable()
export class MemberService {
  constructor(private prisma: PrismaService) {}

  // ── Helpers ───────────────────────────────────────────────────────────

  private calcRenewalDate(plan: string, from: Date): Date {
    const d = new Date(from);
    if (plan === 'Monthly')   d.setMonth(d.getMonth() + 1);
    if (plan === 'Quarterly') d.setMonth(d.getMonth() + 3);
    if (plan === 'Annual')    d.setFullYear(d.getFullYear() + 1);
    return d;
  }

  // ── Queries ───────────────────────────────────────────────────────────

  findAll(branchId?: string) {
    return this.prisma.member.findMany({
      where: branchId ? { branchId } : undefined,
      include: { trainer: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const member = await this.prisma.member.findUnique({
      where: { id },
      include: { trainer: true, payments: true, schedules: true },
    });
    if (!member) throw new NotFoundException(`Member ${id} not found`);
    return member;
  }

  // ── Register new member (transactional) ──────────────────────────────

  async create(dto: CreateMemberDto, recordedBy: string) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Generate next GF-XXXXX ID
      const lastMember = await tx.member.findFirst({
        where:   { id: { startsWith: 'GF-' } },
        orderBy: { id: 'desc' },
      });
      let newId = 'GF-10001';
      if (lastMember) {
        const match = lastMember.id.match(/GF-(\d+)/);
        if (match) newId = `GF-${String(parseInt(match[1]) + 1).padStart(5, '0')}`;
      }

      // 2. Calculate renewal date
      const joinDate    = new Date(dto.start_date);
      const renewalDate = this.calcRenewalDate(dto.plan, joinDate);

      // 3. Create member
      const member = await tx.member.create({
        data: {
          id:          newId,
          branchId:    dto.branch_id,
          trainerId:   dto.trainer_id ?? null,
          firstName:   dto.first_name,
          lastName:    dto.last_name,
          phone:       dto.phone,
          email:       dto.email,
          dob:         dto.dob ? new Date(dto.dob) : null,
          gender:      dto.gender,
          plan:        dto.plan,
          joinDate,
          renewalDate,
          notes:       dto.notes,
        },
      });

      // 4. Record initial payment
      await tx.payment.create({
        data: {
          memberId:    newId,
          paymentType: 'Membership',
          amount:      dto.payment_amount,
          currency:    'Birr',
          method:      dto.payment_method as any,
          planLabel:   `${dto.plan} Plan Registration`,
          recordedBy,
          paidAt:      new Date(),
        },
      });

      // 5. Create registration notification
      await tx.notification.create({
        data: {
          type:     'Success',
          message:  `New member registered: ${dto.first_name} ${dto.last_name}`,
          memberId: newId,
          branchId: dto.branch_id,
          isRead:   false,
        },
      });

      return member;
    });
  }

  // ── Update profile ────────────────────────────────────────────────────

  async update(id: string, dto: UpdateMemberDto) {
    await this.findOne(id);
    return this.prisma.member.update({
      where: { id },
      data:  {
        firstName:  dto.first_name,
        lastName:   dto.last_name,
        phone:      dto.phone,
        email:      dto.email,
        dob:        dto.dob ? new Date(dto.dob) : undefined,
        gender:     dto.gender,
        plan:       dto.plan,
        trainerId:  dto.trainer_id,
        notes:      dto.notes,
      },
    });
  }

  // ── Delete ─────────────────────────────────────────────────────────────

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.member.delete({ where: { id } });
  }
}

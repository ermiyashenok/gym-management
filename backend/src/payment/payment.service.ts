import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { DailyEntryDto } from './dto/daily-entry.dto';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  findAll(branchId?: string, memberId?: string) {
    return this.prisma.payment.findMany({
      where: {
        ...(memberId ? { memberId } : {}),
        ...(branchId ? { member: { branchId } } : {}),
      },
      orderBy: { paidAt: 'desc' },
    });
  }

  /**
   * POST /payments  — Membership renewal
   * If renewal_date is in the future, extend from there. Otherwise extend from today.
   */
  async renewMembership(dto: CreatePaymentDto, recordedBy: string) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Fetch member
      const member = await tx.member.findUnique({ where: { id: dto.member_id } });
      if (!member) throw new NotFoundException(`Member ${dto.member_id} not found`);

      // 2. Determine extension start
      const today       = new Date();
      const baseDate    = member.renewalDate > today ? member.renewalDate : today;
      const newRenewal  = new Date(baseDate);

      if (dto.plan === 'Monthly')   newRenewal.setMonth(newRenewal.getMonth() + 1);
      if (dto.plan === 'Quarterly') newRenewal.setMonth(newRenewal.getMonth() + 3);
      if (dto.plan === 'Annual')    newRenewal.setFullYear(newRenewal.getFullYear() + 1);

      // 3. Update member renewal date & plan
      await tx.member.update({
        where: { id: dto.member_id },
        data:  { renewalDate: newRenewal, plan: dto.plan },
      });

      // 4. Save payment log
      const payment = await tx.payment.create({
        data: {
          memberId:    dto.member_id,
          paymentType: 'Membership',
          amount:      dto.payment_amount,
          currency:    'Birr',
          method:      dto.payment_method,
          planLabel:   `${dto.plan} Plan Renewal`,
          recordedBy,
          paidAt:      new Date(),
        },
      });

      // 5. Create success notification
      await tx.notification.create({
        data: {
          type:     'Success',
          message:  `Membership renewed for ${member.firstName} ${member.lastName} until ${newRenewal.toLocaleDateString()}`,
          memberId: dto.member_id,
          branchId: member.branchId,
          isRead:   false,
        },
      });

      return { payment, newRenewalDate: newRenewal };
    });
  }

  /**
   * POST /payments/daily  — Walk-in daily entry
   * Amount taken from branch daily_rate config.
   */
  async recordDailyEntry(dto: DailyEntryDto, recordedBy: string) {
    const branch = await this.prisma.branch.findUnique({ where: { id: dto.branch_id } });
    if (!branch) throw new NotFoundException(`Branch ${dto.branch_id} not found`);
    if (branch.dailyRate <= 0) throw new BadRequestException('Daily rate not configured for this branch');

    return this.prisma.payment.create({
      data: {
        memberId:    null,
        paymentType: 'Daily_Entry',
        amount:      branch.dailyRate,
        currency:    'Birr',
        method:      dto.payment_method,
        planLabel:   `Daily Walk-In — ${branch.name}`,
        recordedBy,
        paidAt:      new Date(),
      },
    });
  }
}

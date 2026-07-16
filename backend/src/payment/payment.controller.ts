import { Body, Controller, Get, Post, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { DailyEntryDto } from './dto/daily-entry.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('payments')
export class PaymentController {
  constructor(private payment: PaymentService) {}

  /** GET /api/payments?branchId=&memberId= */
  @Get()
  findAll(
    @Query('branchId') branchId?: string,
    @Query('memberId') memberId?: string,
  ) {
    return this.payment.findAll(branchId, memberId);
  }

  /** POST /api/payments  — Membership renewal */
  @Roles(Role.SuperAdmin, Role.Manager, Role.Staff)
  @Post()
  renew(@Body() dto: CreatePaymentDto, @Request() req) {
    return this.payment.renewMembership(dto, req.user?.name ?? 'System');
  }

  /** POST /api/payments/daily  — Walk-in cash ledger */
  @Roles(Role.SuperAdmin, Role.Manager, Role.Staff)
  @Post('daily')
  dailyEntry(@Body() dto: DailyEntryDto, @Request() req) {
    return this.payment.recordDailyEntry(dto, req.user?.name ?? 'System');
  }
}

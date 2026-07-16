import { Body, Controller, Get, Post, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('expenses')
export class ExpenseController {
  constructor(private expense: ExpenseService) {}

  /** GET /api/expenses?branchId= */
  @Get()
  findAll(@Query('branchId') branchId?: string) {
    return this.expense.findAll(branchId);
  }

  /** POST /api/expenses */
  @Roles(Role.SuperAdmin, Role.Manager, Role.Staff)
  @Post()
  create(@Body() dto: CreateExpenseDto, @Request() req) {
    return this.expense.create(dto, req.user?.name ?? 'System');
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';

@Injectable()
export class ExpenseService {
  constructor(private prisma: PrismaService) {}

  findAll(branchId?: string) {
    return this.prisma.expense.findMany({
      where:   branchId ? { branchId } : undefined,
      orderBy: { date: 'desc' },
    });
  }

  async create(dto: CreateExpenseDto, recordedBy: string) {
    const branch = await this.prisma.branch.findUnique({ where: { id: dto.branch_id } });
    if (!branch) throw new NotFoundException(`Branch ${dto.branch_id} not found`);

    return this.prisma.expense.create({
      data: {
        branchId:   dto.branch_id,
        type:       dto.type,
        reason:     dto.reason,
        amount:     dto.amount,
        recordedBy,
      },
    });
  }
}

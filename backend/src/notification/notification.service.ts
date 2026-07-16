import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  /** GET /notifications?branchId= — unread first */
  findAll(branchId?: string) {
    return this.prisma.notification.findMany({
      where:   branchId ? { branchId } : undefined,
      orderBy: [{ isRead: 'asc' }, { createdAt: 'desc' }],
    });
  }

  /** PUT /notifications/:id/read */
  async markRead(id: string) {
    const n = await this.prisma.notification.findUnique({ where: { id } });
    if (!n) throw new NotFoundException('Notification not found');
    return this.prisma.notification.update({ where: { id }, data: { isRead: true } });
  }

  /** PUT /notifications/read-all?branchId= */
  markAllRead(branchId: string) {
    return this.prisma.notification.updateMany({
      where: { branchId, isRead: false },
      data:  { isRead: true },
    });
  }
}

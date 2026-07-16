import { Controller, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { NotificationService } from './notification.service';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private notification: NotificationService) {}

  /** GET /api/notifications?branchId= — unread first */
  @Get()
  findAll(@Query('branchId') branchId?: string) {
    return this.notification.findAll(branchId);
  }

  /** PUT /api/notifications/read-all?branchId= — must be before :id route */
  @Put('read-all')
  markAllRead(@Query('branchId') branchId: string) {
    return this.notification.markAllRead(branchId);
  }

  /** PUT /api/notifications/:id/read */
  @Put(':id/read')
  markRead(@Param('id') id: string) {
    return this.notification.markRead(id);
  }
}

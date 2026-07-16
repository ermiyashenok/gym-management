import { Body, Controller, Delete, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('schedules')
export class ScheduleController {
  constructor(private schedule: ScheduleService) {}

  /** GET /api/schedules?trainerId=&memberId= */
  @Get()
  findAll(
    @Query('trainerId') trainerId?: string,
    @Query('memberId')  memberId?: string,
  ) {
    return this.schedule.findAll(trainerId, memberId);
  }

  /** POST /api/schedules — Book a slot */
  @Roles(Role.SuperAdmin, Role.Manager, Role.Staff)
  @Post()
  create(@Body() dto: CreateScheduleDto) {
    return this.schedule.create(dto);
  }

  /** DELETE /api/schedules?trainerId=&day=&time= — Cancel a slot */
  @Roles(Role.SuperAdmin, Role.Manager, Role.Staff)
  @Delete()
  remove(
    @Query('trainerId') trainerId: string,
    @Query('day')       day: string,
    @Query('time')      time: string,
  ) {
    return this.schedule.remove(trainerId, parseInt(day), time);
  }
}

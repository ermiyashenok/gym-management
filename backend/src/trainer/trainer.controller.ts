import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query, Request, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TrainerService } from './trainer.service';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { UpdateTrainerStatusDto } from './dto/update-trainer-status.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../auth/role.enum';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('trainers')
export class TrainerController {
  constructor(private trainer: TrainerService) {}

  /** GET /api/trainers?branchId=... */
  @Get()
  findAll(@Query('branchId') branchId?: string) {
    return this.trainer.findAll(branchId);
  }

  /** GET /api/trainers/:id */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.trainer.findOne(id);
  }

  /** POST /api/trainers */
  @Roles(Role.SuperAdmin, Role.Owner)
  @Post()
  create(@Body() dto: CreateTrainerDto) {
    return this.trainer.create(dto);
  }

  /** PATCH /api/trainers/:id/status  – accessible by all roles; service enforces self-edit for Trainers */
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTrainerStatusDto,
    @Request() req,
  ) {
    return this.trainer.updateStatus(id, dto, req.user);
  }

  /** DELETE /api/trainers/:id */
  @Roles(Role.SuperAdmin, Role.Owner)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.trainer.remove(id);
  }
}

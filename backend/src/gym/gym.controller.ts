import {
  Controller, Get, Post, Delete, Param, Body, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GymService } from './gym.service';
import { CreateGymDto } from './dto/create-gym.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../auth/role.enum';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('gyms')
export class GymController {
  constructor(private gym: GymService) {}

  /** GET /api/gyms */
  @Get()
  findAll() { return this.gym.findAll(); }

  /** GET /api/gyms/:id */
  @Get(':id')
  findOne(@Param('id') id: string) { return this.gym.findOne(id); }

  /** POST /api/gyms */
  @Roles(Role.SuperAdmin)
  @Post()
  create(@Body() dto: CreateGymDto) { return this.gym.create(dto); }

  /** DELETE /api/gyms/:id */
  @Roles(Role.SuperAdmin)
  @Delete(':id')
  remove(@Param('id') id: string) { return this.gym.remove(id); }
}

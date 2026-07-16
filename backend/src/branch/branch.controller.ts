import {
  Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BranchService } from './branch.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../auth/role.enum';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('branches')
export class BranchController {
  constructor(private branch: BranchService) {}

  /** GET /api/branches?gymId=... */
  @Get()
  findAll(@Query('gymId') gymId?: string) { return this.branch.findAll(gymId); }

  /** GET /api/branches/:id */
  @Get(':id')
  findOne(@Param('id') id: string) { return this.branch.findOne(id); }

  /** POST /api/branches */
  @Roles(Role.SuperAdmin, Role.Owner)
  @Post()
  create(@Body() dto: CreateBranchDto) { return this.branch.create(dto); }

  /** PUT /api/branches/:id */
  @Roles(Role.SuperAdmin, Role.Owner, Role.Manager)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateBranchDto>) {
    return this.branch.update(id, dto);
  }

  /** DELETE /api/branches/:id */
  @Roles(Role.SuperAdmin, Role.Owner)
  @Delete(':id')
  remove(@Param('id') id: string) { return this.branch.remove(id); }
}

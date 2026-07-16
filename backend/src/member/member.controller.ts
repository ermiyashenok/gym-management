import {
  Controller, Get, Post, Put, Delete, Param, Body, Query, Request, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MemberService } from './member.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../auth/role.enum';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('members')
export class MemberController {
  constructor(private member: MemberService) {}

  /** GET /api/members?branchId=... */
  @Get()
  findAll(@Query('branchId') branchId?: string) {
    return this.member.findAll(branchId);
  }

  /** GET /api/members/:id */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.member.findOne(id);
  }

  /** POST /api/members */
  @Roles(Role.SuperAdmin, Role.Manager, Role.Staff)
  @Post()
  create(@Body() dto: CreateMemberDto, @Request() req) {
    return this.member.create(dto, req.user?.name ?? 'System');
  }

  /** PUT /api/members/:id */
  @Roles(Role.SuperAdmin, Role.Manager, Role.Staff)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMemberDto) {
    return this.member.update(id, dto);
  }

  /** DELETE /api/members/:id */
  @Roles(Role.SuperAdmin, Role.Manager)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.member.remove(id);
  }
}

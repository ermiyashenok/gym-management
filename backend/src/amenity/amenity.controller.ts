import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { AmenityService } from './amenity.service';
import { CreateAmenityDto } from './dto/create-amenity.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('amenities')
export class AmenityController {
  constructor(private amenity: AmenityService) {}

  /** GET /api/amenities?branchId= */
  @Get()
  findAll(@Query('branchId') branchId?: string) {
    return this.amenity.findAll(branchId);
  }

  /** POST /api/amenities */
  @Roles(Role.SuperAdmin, Role.Manager, Role.Staff)
  @Post()
  create(@Body() dto: CreateAmenityDto) {
    return this.amenity.create(dto);
  }

  /** POST /api/amenities/:id/sell */
  @Roles(Role.SuperAdmin, Role.Manager, Role.Staff)
  @Post(':id/sell')
  sell(@Param('id') id: string, @Request() req) {
    return this.amenity.sell(id, req.user?.name ?? 'System');
  }
}

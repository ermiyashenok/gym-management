import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAmenityDto } from './dto/create-amenity.dto';

@Injectable()
export class AmenityService {
  constructor(private prisma: PrismaService) {}

  findAll(branchId?: string) {
    return this.prisma.amenity.findMany({
      where: branchId ? { branchId } : undefined,
      orderBy: { name: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.amenity.findUniqueOrThrow({ where: { id } });
  }

  create(dto: CreateAmenityDto) {
    return this.prisma.amenity.create({
      data: {
        branchId: dto.branch_id,
        name:     dto.name,
        category: dto.category,
        price:    dto.price,
        stock:    dto.stock,
        imageUrl: dto.image_url,
      },
    });
  }

  /**
   * POST /amenities/:id/sell
   * Decrements stock by 1 and creates an Amenity_Sale payment record.
   */
  async sell(id: string, recordedBy: string) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Fetch product
      const amenity = await tx.amenity.findUnique({ where: { id } });
      if (!amenity) throw new NotFoundException('Product not found');

      // 2. Check stock
      if (amenity.stock <= 0) {
        throw new BadRequestException('Item out of stock');
      }

      // 3. Decrement stock
      await tx.amenity.update({
        where: { id },
        data:  { stock: { decrement: 1 } },
      });

      // 4. Create payment record
      const payment = await tx.payment.create({
        data: {
          memberId:    null,
          paymentType: 'Amenity_Sale',
          amount:      amenity.price,
          currency:    'Birr',
          method:      'Cash',
          planLabel:   `Sold ${amenity.name}`,
          recordedBy,
          paidAt:      new Date(),
        },
      });

      return { payment, remainingStock: amenity.stock - 1 };
    });
  }
}

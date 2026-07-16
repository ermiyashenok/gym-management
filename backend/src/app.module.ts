import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { GymModule } from './gym/gym.module';
import { BranchModule } from './branch/branch.module';
import { TrainerModule } from './trainer/trainer.module';
import { MemberModule } from './member/member.module';
import { PaymentModule } from './payment/payment.module';
import { ScheduleModule } from './schedule/schedule.module';
import { AmenityModule } from './amenity/amenity.module';
import { ExpenseModule } from './expense/expense.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    GymModule,
    BranchModule,
    TrainerModule,
    MemberModule,
    PaymentModule,
    ScheduleModule,
    AmenityModule,
    ExpenseModule,
    NotificationModule,
  ],
  // No controllers/providers at root level – all handled by feature modules
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { PaymentResolver } from './payments.resolver';
import { PaymentService } from './payments.service';

@Module({
    imports: [TypeOrmModule.forFeature([Payment, Restaurant])],
    providers: [PaymentService, PaymentResolver],
})
export class PaymentsModule {}

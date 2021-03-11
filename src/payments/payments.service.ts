import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron, Interval, SchedulerRegistry, Timeout } from '@nestjs/schedule';
import { LessThan, Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Users } from 'src/users/entities/users.entity';
import { CreatePaymentInput, CreatePaymentOuput, } from './dtos/create-payment.dto';
import { GetPaymentsOutput } from './dtos/get-payments.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly payments: Repository<Payment>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  async createPayment( owner: Users, { transactionId, restaurantId }: CreatePaymentInput, ): Promise<CreatePaymentOuput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantId);

      if (!restaurant) {
        return { ok: false, error: 'Restaurant not found.', };
      }

      if (restaurant.ownerId !== owner.id) {
        return { ok: false, error: 'You are not allowed to do this.', };
      }

      await this.payments.save( this.payments.create({ transactionId, user: owner, restaurant, }), );

      restaurant.isPromoted = true;
      const date = new Date();
      date.setDate(date.getDate() + 7);
      restaurant.promotedUntil = date;
      this.restaurants.save(restaurant);

      return { ok: true, };
    } catch {
      return { ok: false, error: 'Could not create payment.' };
    }
  }

  async getPayments(user: Users): Promise<GetPaymentsOutput> {
    try {
      const payments = await this.payments.find({ user: user });
      return { ok: true, payments, };
    } catch {
      return { ok: false, error: 'Could not load payments.', };
    }
  }

  @Interval(2000)
  async checkPromotedRestaurants() {
    const restaurants = await this.restaurants.find({ isPromoted: true, promotedUntil: LessThan(new Date()), });

    restaurants.forEach(async restaurant => {
      restaurant.isPromoted = false;
      restaurant.promotedUntil = null;
      await this.restaurants.save(restaurant);
    });
  }
/*
  @Cron('30 * * * * *', {
    name: 'myJob',
  })
  checkForPayments() {
    console.log('Checking for payments....(cron)');
    const job = this.schedulerRegistry.getCronJob('myJob');
    job.stop();
  }

  @Interval(5000)
  checkForPaymentsI() {
    console.log('Checking for payments....(interval)');
  }

  @Timeout(20000)
  afterStarts() {
    console.log('Congrats!');
  }
*/
}
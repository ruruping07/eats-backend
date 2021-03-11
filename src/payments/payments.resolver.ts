import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { Users } from 'src/users/entities/users.entity';
import { Payment } from './entities/payment.entity';
import { CreatePaymentInput, CreatePaymentOuput, } from './dtos/create-payment.dto';
import { GetPaymentsOutput } from './dtos/get-payments.dto';
import { PaymentService } from './payments.service';

@Resolver(() => Payment)
export class PaymentResolver {
  constructor(private readonly paymentService: PaymentService) {}

  @Mutation(() => CreatePaymentOuput)
  @Role(['Owner'])
  createPayment( @AuthUser() owner: Users, @Args('input') createPaymentInput: CreatePaymentInput, ): Promise<CreatePaymentOuput> {
    return this.paymentService.createPayment(owner, createPaymentInput);
  }

  @Query(() => GetPaymentsOutput)
  @Role(['Owner'])
  getPayments(@AuthUser() user: Users): Promise<GetPaymentsOutput> {
    return this.paymentService.getPayments(user);
  }
}
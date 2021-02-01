import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { CreateAccountInput, CreateAccountOutput } from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { Users } from './entities/users.entity';
import { UserService } from './users.service';

@Resolver(() => Users)
export class UserResolver {
  constructor(private readonly usersService: UserService) {}

  @Query(() => Users)
  me(@Context() context) {
    if(!context.user) {
      return;
    } else {
      return context.user;
    }
    //return this.usersService.findById(3);
  }

  @Mutation(() => CreateAccountOutput)
  createAccount(@Args('input') createAccountInput: CreateAccountInput): Promise<CreateAccountOutput> {
    return this.usersService.createAccount(createAccountInput);
  }

  @Mutation(() => LoginOutput)
  async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
    return this.usersService.login(loginInput);
  }
}

import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { Users } from './entities/users.entity';
import { UserService } from './users.service';
import { UserProfileInput, UserProfileOutput } from './dtos/user-profile.dt';
import { CreateAccountInput, CreateAccountOutput } from './dtos/create-account.dto';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';

@Resolver(() => Users)
export class UserResolver {
  constructor(private readonly usersService: UserService) {}

  @Query(() => Users)
  @UseGuards(AuthGuard)
  me(@AuthUser() authUser: Users) {
    return authUser;
  }

  @Mutation(() => CreateAccountOutput)
  createAccount(@Args('input') createAccountInput: CreateAccountInput): Promise<CreateAccountOutput> {
    return this.usersService.createAccount(createAccountInput);
  }

  @Mutation(() => LoginOutput)
  async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
    return this.usersService.login(loginInput);
  }

  @UseGuards(AuthGuard)
  @Query(() => UserProfileOutput)
  async userProfile(@Args() userProfileInput: UserProfileInput,): Promise<UserProfileOutput> {
    try {
      const user = await this.usersService.findById(userProfileInput.userId);

      if (!user) {
        throw Error();
      }

      return { ok: true, users: user };
    } catch (e) {
      return { error: 'User Not Found', ok: false, };
    }
  }

  @UseGuards(AuthGuard)
  @Mutation(() => EditProfileOutput)
  async editProfile(  @AuthUser() authUser: Users,  @Args('input') editProfileInput: EditProfileInput,): Promise<EditProfileOutput> {
    try {
      await this.usersService.editProfile(authUser.id, editProfileInput);

      return { ok: true, };
    } catch (error) {
      return {  ok: false, error, };
    }
  }
}

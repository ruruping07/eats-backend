import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UserService } from './users.service';

@Resolver(of => User)
export class UserResolver {
    constructor(private readonly usersService: UserService) {}
    
    @Query(returns => Boolean)
    hi() {
        return true;
    }
}
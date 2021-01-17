import { Resolver, Query, Args, Mutation } from "@nestjs/graphql";
import { CreateRestaurantDto } from "./dtos/create-restaurant.dto";
import { Restaurant } from "./entities/restaurant.entity";

@Resolver(of => Restaurant) 
export class RestaurantResolver {
    @Query(() => Restaurant)
    restaurants(@Args('veganOnly') veganOnly: boolean): Restaurant[] {
        return [];
    }

    @Mutation(() => Boolean)
    createRestaurant(
        @Args() createRestaurantInput:CreateRestaurantDto,
    ): boolean {
        return true;
    }
}
import { Resolver, Query, Args, Mutation } from "@nestjs/graphql";
import { CreateRestaurantDto } from "./dtos/create-restaurant.dto";
import { Restaurant } from "./entities/restaurant.entity";
import { RestaurantService } from "./restaurants.service";

@Resolver(of => Restaurant) 
export class RestaurantResolver {
    constructor(private readonly restaurantService: RestaurantService) {}

    @Query(() => [Restaurant])
    restaurants(): Promise<Restaurant[]> {
        return this.restaurantService.getAll();
    }

    @Mutation(() => Boolean)
    createRestaurant(
        @Args() createRestaurantInput:CreateRestaurantDto,): boolean {
        return true;
    }
}
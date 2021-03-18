import { Resolver, Query, Args, Mutation, Int, ResolveField, Parent } from '@nestjs/graphql';
import { RestaurantService } from './restaurants.service';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { CreateRestaurantInput, CreateRestaurantOutput, } from './dtos/create-restaurant.dto';
import { EditRestaurantInput, EditRestaurantOutput,} from './dtos/edit-restaurant.dto';
import { DeleteRestaurantInput, DeleteRestaurantOutput, } from './dtos/delete-restaurant.dto';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';
import { RestaurantsInput, RestaurantsOutput } from './dtos/restaurants.dto';
import { RestaurantInput, RestaurantOutput } from './dtos/restaurant.dto';
import { SearchRestaurantInput, SearchRestaurantOutput,} from './dtos/search-restaurant.dto';
import { CreateDishInput, CreateDishOutput } from './dtos/create-dish.dto';
import { DeleteDishInput, DeleteDishOutput } from './dtos/delete-dish.dto'
import { EditDishInput, EditDishOutput } from './dtos/edit-dish.dto';
import { MyRestaurantsOutput } from './dtos/my-restaurants.dto';
import { MyRestaurantInput, MyRestaurantOutput } from './dtos/my-restaurant';
import { Role } from 'src/auth/role.decorator';
import { Restaurant } from './entities/restaurant.entity';
import { Users } from 'src/users/entities/users.entity';
import { Category } from './entities/category.entity';
import { Dish } from './entities/dish.entity';
import { UseFilters } from '@nestjs/common';



@Resolver(() => Restaurant)
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Mutation(() => CreateRestaurantOutput)
  @Role(['Owner'])
  async createRestaurant(
    @AuthUser() authUser: Users,
    @Args('input') createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    return this.restaurantService.createRestaurant(authUser, createRestaurantInput,);
  }

  @Query(() => MyRestaurantsOutput)
  @Role(['Owner'])
  myRestaurants(@AuthUser() owner: Users): Promise<MyRestaurantsOutput> {
    return this.restaurantService.myRestaurants(owner);
  }

  @Query(() => MyRestaurantOutput)
  @Role(['Owner'])
  myRestaurant(
    @AuthUser() owner: Users,
    @Args('input') myRestaurantInput: MyRestaurantInput,
  ): Promise<MyRestaurantOutput> {
    return this.restaurantService.myRestaurant(owner, myRestaurantInput);
  }  

  @Mutation(() => EditRestaurantOutput)
  @Role(['Owner'])
  editRestaurant(
    @AuthUser() owner: Users, 
    @Args('input') editRestaurantInput: EditRestaurantInput,
    ): Promise<EditRestaurantOutput> {
    return this.restaurantService.editRestaurant(owner, editRestaurantInput);
  }

  @Mutation(() => DeleteRestaurantOutput)
  @Role(['Owner'])
  deleteRestaurant(
    @AuthUser() owner: Users,
    @Args('input') deleteRestaurantInput: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    return this.restaurantService.deleteRestaurant( owner, deleteRestaurantInput, );
  }

  @Query(() => RestaurantsOutput)
  restaurants(
    @Args('input') restaurantsInput: RestaurantsInput,
  ): Promise<RestaurantsOutput> {
    return this.restaurantService.allRestaurants(restaurantsInput);
  }

  @Query(() => RestaurantOutput)
  restaurant(
    @Args('input') restaurantInput: RestaurantInput,
  ): Promise<RestaurantOutput> {
    return this.restaurantService.findRestaurantById(restaurantInput);
  }

  @Query(() => SearchRestaurantOutput)
  searchRestaurant(
    @Args('input') searchRestaurantInput: SearchRestaurantInput,
  ): Promise<SearchRestaurantOutput> {
    return this.restaurantService.searchRestaurantByName(searchRestaurantInput);
  }
}

@Resolver(() => Category)
export class CategoryResolver { 
  constructor(private readonly restaurantService: RestaurantService) {}

  @ResolveField(() => Int)
  restaurantCount(@Parent() category: Category): Promise<number> {
    return this.restaurantService.countRestaurants(category);
  }

  @Query(() => AllCategoriesOutput)
  allCategories(): Promise<AllCategoriesOutput> {
    return this.restaurantService.allCategories();
  }

  @Query(() => CategoryOutput)
  category(  @Args('input') categoryInput: CategoryInput, ): Promise<CategoryOutput> {
    return this.restaurantService.findCategoryBySlug(categoryInput);
  }
}

@Resolver(() => Dish)
export class DishResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Mutation(() => CreateDishOutput)
  @Role(['Owner'])
  createDish(
    @AuthUser() owner: Users,
    @Args('input') createDishInput: CreateDishInput,
  ): Promise<CreateDishOutput>  {
    return this.restaurantService.createDish(owner, createDishInput);
  }
  
  @Mutation(() => EditDishOutput)
  @Role(['Owner'])
  editDish(
    @AuthUser() owner: Users,
    @Args('input') editDishInput: EditDishInput,
  ): Promise<EditDishOutput> {
    return this.restaurantService.editDish(owner, editDishInput);
  }

  @Mutation(() => DeleteDishOutput)
  @Role(['Owner'])
  deleteDish(
    @AuthUser() owner: Users,
    @Args('input') deleteDishInput: DeleteDishInput,
  ): Promise<DeleteDishOutput> {
    return this.restaurantService.deleteDish(owner, deleteDishInput);
  }
}




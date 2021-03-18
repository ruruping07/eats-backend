import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Raw, Repository } from 'typeorm';
import { CreateRestaurantInput, CreateRestaurantOutput, } from './dtos/create-restaurant.dto';
import { EditRestaurantInput, EditRestaurantOutput,} from './dtos/edit-restaurant.dto';
import { DeleteRestaurantInput, DeleteRestaurantOutput, } from './dtos/delete-restaurant.dto';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';
import { RestaurantsInput, RestaurantsOutput } from './dtos/restaurants.dto';
import { RestaurantInput, RestaurantOutput } from './dtos/restaurant.dto';
import { SearchRestaurantInput, SearchRestaurantOutput,} from './dtos/search-restaurant.dto';
import { CreateDishInput, CreateDishOutput } from './dtos/create-dish.dto';
import { DeleteDishInput, DeleteDishOutput } from './dtos/delete-dish.dto'
import { EditDishInput, EditDishOutput } from './dtos/edit-dish.dto';
import { MyRestaurantsOutput } from './dtos/my-restaurants.dto';
import { MyRestaurantInput, MyRestaurantOutput } from './dtos/my-restaurant';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import { Restaurant } from './entities/restaurant.entity';
import { Users } from 'src/users/entities/users.entity';
import { Category } from './entities/category.entity';
import { Dish } from './entities/dish.entity';
import { CategoryRepository } from './repositories/category.repository';


@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    private readonly categories: CategoryRepository,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,    
  ) {}

  async createRestaurant( owner: Users, createRestaurantInput: CreateRestaurantInput, ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurants.create(createRestaurantInput);

      newRestaurant.owner = owner;

      const category = await this.categories.getOrCreate(createRestaurantInput.categoryName,);

      newRestaurant.category = category;
      await this.restaurants.save(newRestaurant);
      
      return { ok: true, restaurantId: newRestaurant.id, };
    } catch {
      return { ok: false, error: 'Could not create restaurant', };
    }
  }


  async myRestaurants(owner: Users): Promise<MyRestaurantsOutput> {
    try {
      const restaurants = await this.restaurants.find({ owner });
      return { restaurants, ok: true, };
    } catch {
      return { ok: false, error: 'Could not find restaurants.', };
    }
  }
  async myRestaurant( owner: Users, { id }: MyRestaurantInput, ): Promise<MyRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(
        { owner, id },
        { relations: ['menu', 'orders'] },
      );
      return { restaurant, ok: true, };
    } catch {
      return { ok: false, error: 'Could not find restaurant', };
    }
  }

  async editRestaurant(
    owner: Users,
    editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(editRestaurantInput.restaurantId,);

      if (!restaurant) {
        return { ok: false, error: 'Restaurant not found', };
      }

      if (owner.id !== restaurant.ownerId) {
        return { ok: false, error: "You can't edit a restaurant that you don't own", };
      }

      let category: Category = null;

      if (editRestaurantInput.categoryName) {
        category = await this.categories.getOrCreate(editRestaurantInput.categoryName,);
      }
      await this.restaurants.save(
        [
          { id: editRestaurantInput.restaurantId, ...editRestaurantInput, ...(category && { category }), },
        ]
      );

      return { ok: true, };
    } catch {
      return { ok: false, error: 'Could not edit Restaurant', };
    }
  }

  async deleteRestaurant(
    owner: Users,
    { restaurantId }: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantId);

      if (!restaurant) {
        return { ok: false, error: 'Restaurant not found', };
      }
      if (owner.id !== restaurant.ownerId) {
        return { ok: false, error: "You can't delete a restaurant that you don't own", };
      }

      await this.restaurants.delete(restaurantId);
      
      return { ok: true, };
    } catch {
      return { ok: false, error: 'Could not delete restaurant.', };
    }
  }

  async allCategories(): Promise<AllCategoriesOutput> {
    try {
      const categories = await this.categories.find();
      return { ok: true, categories, };
    } catch {
      return { ok: false, error: 'Could not load categories', };
    }
  }

  countRestaurants(category: Category) {
    return this.restaurants.count({ category });
  }

  async findCategoryBySlug({ slug, page }: CategoryInput): Promise<CategoryOutput> {
    try {
      const category = await this.categories.findOne({ slug });

      if (!category) {
        return { ok: false, error: 'Category not found', };
      }

      const restaurants = await this.restaurants.find({
        where: {
          category,
        },
        order: {
          isPromoted: 'DESC',
        },
        take: 8,
        skip: (page - 1) * 8,
        
      });

      const totalResults = await this.countRestaurants(category);

      return { ok: true, restaurants, category, totalPages: Math.ceil(totalResults / 8), };
    } catch {
      return { ok: false, error: 'Could not load category', };
    }
  }

  async allRestaurants({ page }: RestaurantsInput): Promise<RestaurantsOutput> {
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        skip: (page - 1) * 8,
        take: 8,
      });
      return { ok: true, results: restaurants, totalPages: Math.ceil(totalResults / 8), totalResults, };
    } catch {
      return { ok: false, error: 'Could not load restaurants', };
    }
  }

  async findRestaurantById({ restaurantId, }: RestaurantInput): Promise<RestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantId, { relations: ['menu', 'category'], });

      if (!restaurant) {
        return { ok: false, error: 'Restaurant not found', };
      }

      return { ok: true, restaurant, };
    } catch {
      return { ok: false, error: 'Could not find restaurant', };
    }
  }

  async searchRestaurantByName({ query, page, }: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        where: {
          name: Raw(name => `${name} ILIKE '%${query}%'`),
          //name: Like(`%${query}%`),
        },
        order: {
          isPromoted: 'DESC',
        },
        skip: (page - 1) * 8,
        take: 8,
      });

      return { ok: true, restaurants, totalResults, totalPages: Math.ceil(totalResults / 8), };
    } catch {
      return { ok: false, error: 'Could not search for restaurants' };
    }
  }

  async createDish( owner: Users, createDishInput: CreateDishInput, ): Promise<CreateDishOutput> {
    try {
      const restaurant = await this.restaurants.findOne( createDishInput.restaurantId, );

      if (!restaurant) {
        return { ok: false, error: 'Restaurant not found', };
      }

      if (owner.id !== restaurant.ownerId) {
        return { ok: false, error: "You can't do that.", };
      }

      await this.dishes.save( this.dishes.create({ ...createDishInput, restaurant }), );

      return { ok: true, };
    } catch (error) {
      console.log(error);
      return { ok: false, error: 'Could not create dish', };
    }
  }

  async checkDishOwner(ownerId: number, dishId: number) {}

  async editDish( owner: Users, editDishInput: EditDishInput, ): Promise<EditDishOutput> {
    try {
      const dish = await this.dishes.findOne(editDishInput.dishId, { relations: ['restaurant'], });

      if (!dish) {
        return { ok: false, error: 'Dish not found', };
      }

      if (dish.restaurant.ownerId !== owner.id) {
        return { ok: false, error: "You can't do that.", };
      }

      await this.dishes.save([ { id: editDishInput.dishId, ...editDishInput, }, ]);

      return { ok: true, };
    } catch {
      return { ok: false, error: 'Could not delete dish', };
    }
  }

  async deleteDish( owner: Users, { dishId }: DeleteDishInput, ): Promise<DeleteDishOutput> {
    try {
      const dish = await this.dishes.findOne(dishId, { relations: ['restaurant'], });

      if (!dish) {
        return { ok: false, error: 'Dish not found', };
      }

      if (dish.restaurant.ownerId !== owner.id) {
        return { ok: false, error: "You can't do that.", };
      }

      await this.dishes.delete(dishId);

      return { ok: true, };
    } catch {
      return { ok: false, error: 'Could not delete dish', };
    }
  }
}

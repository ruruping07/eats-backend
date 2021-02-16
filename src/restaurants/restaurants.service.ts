import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRestaurantInput, CreateRestaurantOutput, } from './dtos/create-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { Users } from 'src/users/entities/users.entity';
import { Category } from './entities/category.entity';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
  ) {}

  async createRestaurant( owner: Users, createRestaurantInput: CreateRestaurantInput, ): Promise<CreateRestaurantOutput> {
    try {
      console.log(owner);
      console.log(createRestaurantInput);
      const newRestaurant = this.restaurants.create(createRestaurantInput);

      newRestaurant.owner = owner;
      const categoryName = createRestaurantInput.categoryName.trim().toLowerCase();
      const categorySlug = categoryName.replace(/ /g, '-');
      let category = await this.categories.findOne({ slug: categorySlug });

      if (!category) {
        category = await this.categories.save(this.categories.create({ slug: categorySlug, name: categoryName }),);
      }

      newRestaurant.category = category;
      await this.restaurants.save(newRestaurant);
      
      return { ok: true, };
    } catch {
      return { ok: false, error: 'Could not create restaurant', };
    }
  }
}

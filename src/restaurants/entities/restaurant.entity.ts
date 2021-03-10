import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';
import { Column, Entity, ManyToOne, RelationId, OneToMany } from 'typeorm';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Category } from './category.entity';
import { Users } from 'src/users/entities/users.entity';
import { Dish } from './dish.entity';
import { Order } from 'src/orders/entities/order.entity';
import { UseFilters } from '@nestjs/common';

@InputType('RestaurantInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Restaurant extends CoreEntity {
  @Field(() => String)
  @Column()
  @IsString()
  @Length(5)
  name: string;

  @Field(() => String)
  @Column()
  @IsString()
  coverImg: string;

  @Field(() => String)
  @Column()
  @IsString()
  address: string;

  @Field(() => Category, { nullable: true })
  @ManyToOne(
    () => Category,
    category => category.restaurants,
    { nullable: true, onDelete: 'SET NULL' },
  )
  category: Category;

  @Field(() => Users)
  @ManyToOne(
    () => Users,
    users => users.restaurants,
    { onDelete: 'CASCADE' },
  )
  owner: Users;

  @RelationId((restaurant: Restaurant) => restaurant.owner)
  ownerId: number;

  @Field(() => [Dish])
  @OneToMany(
    () => Dish,
    dish => dish.restaurant,
  )
  menu: Dish[];

  @Field(() => [Order])
  @OneToMany(
    () => Order,
    order => order.restaurant,
  )
  orders: Order[];
}

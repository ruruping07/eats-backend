  import { Field, Float, InputType, ObjectType, registerEnumType, } from '@nestjs/graphql';
  import { IsEnum, IsNumber } from 'class-validator';
  import { CoreEntity } from 'src/common/entities/core.entity';
  import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
  import { Users } from 'src/users/entities/users.entity';
  import { OrderItem } from './order-item.entity';
  import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, RelationId, } from 'typeorm';
  
  export enum OrderStatus {
    Pending = 'Pending',
    Cooking = 'Cooking',
    Cooked = 'Cooked',
    PickedUp = 'PickedUp',
    Delivered = 'Delivered',
  }
  
  registerEnumType(OrderStatus, { name: 'OrderStatus' });
  
  @InputType('OrderInputType', { isAbstract: true })
  @ObjectType()
  @Entity()
  export class Order extends CoreEntity {
    @Field(() => Users, { nullable: true })
    @ManyToOne(
        () => Users,
      user => user.orders,
      { onDelete: 'SET NULL', nullable: true, eager: true },
    )
    customer?: Users;

    @RelationId((order: Order) => order.customer)
    customerId: number;
  
    @Field(() => Users, { nullable: true })
    @ManyToOne(
        () => Users,
      user => user.rides,
      { onDelete: 'SET NULL', nullable: true, eager: true },
    )
    driver?: Users;

    @RelationId((order: Order) => order.driver)
    driverId: number;
  
    @Field(() => Restaurant, { nullable: true })
    @ManyToOne(
        () => Restaurant,
      restaurant => restaurant.orders,
      { onDelete: 'SET NULL', nullable: true, eager: true },
    )
    restaurant?: Restaurant;
  
    @Field(() => [OrderItem])
    @ManyToMany(() => OrderItem, { eager: true })
    @JoinTable()
    items: OrderItem[];
  
    @Column({ nullable: true })
    @Field(() => Float, { nullable: true })
    total?: number;
    
    @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.Pending  })
    @Field(() => OrderStatus)
    @IsEnum(OrderStatus)
    status: OrderStatus;
  }
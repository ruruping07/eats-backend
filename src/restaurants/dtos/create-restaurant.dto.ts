import { Field, InputType, ObjectType, OmitType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Restaurant } from '../entities/restaurant.entity';
@InputType()
export class CreateRestaurantInput extends PickType(Restaurant, ['name', 'coverImg', 'address',]) {
    @Field(() => String)
    categoryName: string;
}

@ObjectType()
export class CreateRestaurantOutput extends CoreOutput {
    @Field(() => Number)
    restaurantId?: number;
}
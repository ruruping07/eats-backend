import { ArgsType, Field, InputType } from "@nestjs/graphql";
import { IsBoolean, IsString, Length } from "class-validator";

//@InputType()
@ArgsType()
export class CreateRestaurantDto {
    @Field(type => String)
    @IsString()
    @Length(3, 20)
    name: string;

    @Field(type => Boolean)
    @IsBoolean()
    isBegan: boolean;

    @Field(type => String)
    @IsString()
    address: string;

    @Field(type => String)
    @IsString()
    ownerName: string;
}
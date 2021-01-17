import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Restaurant {
    @Field(Type => String) 
    name: string;

    @Field(Type => Boolean, { nullable: true}) 
    isBegan: boolean;

    @Field(Type => String) 
    address: string;

    @Field(Type => String) 
    ownerName: string;
}

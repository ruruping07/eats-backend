import { Field, ObjectType } from "@nestjs/graphql";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
@Entity()
export class Restaurant {

    @PrimaryGeneratedColumn()
    @Field(Type => Number) 
    id: number;

    @Field(Type => String) 
    @Column()
    name: string;

    @Field(Type => Boolean, { nullable: true}) 
    @Column()
    isBegan: boolean;

    @Field(Type => String) 
    @Column()
    address: string;

    @Field(Type => String) 
    @Column()
    ownerName: string;

    @Field(Type => String) 
    @Column()
    categoryName: string;
}

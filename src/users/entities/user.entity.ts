import {Field,InputType,ObjectType,registerEnumType,} from '@nestjs/graphql';
import { Column, Entity } from 'typeorm';
import { IsBoolean, IsEmail, IsEnum, IsString } from 'class-validator';

export enum UserRole {
    Client = 'Client',
    Owner = 'Owner',
    Delivery = 'Delivery',
}

registerEnumType(UserRole, { name: 'UserRole' });

@InputType('UserInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class User {
    @Column({ unique: true })
    @Field(type => String)
    @IsEmail()
    email: string;
  
    @Column({ select: false })
    @Field(type => String)
    @IsString()
    password: string;
  
    @Column({ type: 'enum', enum: UserRole })
    @Field(type => UserRole)
    @IsEnum(UserRole)
    role: UserRole;
  
    @Column({ default: false })
    @Field(type => Boolean)
    @IsBoolean()
    verified: boolean;
  

}
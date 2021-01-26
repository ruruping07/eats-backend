import {Field,InputType,ObjectType,registerEnumType,} from '@nestjs/graphql';
import { BeforeInsert, Column, Entity } from 'typeorm';
import { IsBoolean, IsEmail, IsEnum, IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import * as bcrypt from "bcrypt";
import { InternalServerErrorException } from '@nestjs/common';

export enum UserRole {
    Client = 'Client',
    Owner = 'Owner',
    Delivery = 'Delivery',
}

registerEnumType(UserRole, { name: 'UserRole' });

@InputType('UserInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Users extends CoreEntity {
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
  
    @BeforeInsert()
    async hashPassword(): Promise<void> {
        try {
            this.password = await bcrypt.hash(this.password, 10);
        } catch(e) {
            console.log(e);
            throw new InternalServerErrorException();
        }        
    }
}
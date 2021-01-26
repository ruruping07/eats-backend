import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountInput, CreateAccountOutput } from './dtos/create-account.dto';
import { Users } from './entities/users.entity';

@Injectable()
export class UserService {
  constructor(
      @InjectRepository(Users) private readonly users: Repository<Users>,
  ) {}
  
  async createAccount({email, password, role}: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      const exists = await this.users.findOne({ email });

      if(exists) {
        return { ok: false, error: "Error: 등록된 이메일" }; 
      }

      await this.users.save(this.users.create({email, password, role}));

      return { ok: true }
    } catch(e) {
      console.log(e);
      return { ok: false, error: "Error: 알수 없는 오류" };
    }
  }
}
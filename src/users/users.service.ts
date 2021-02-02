import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountInput, CreateAccountOutput } from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { EditProfileInput } from './dtos/edit-profile.dto';
import { Users } from './entities/users.entity';
import { JwtService } from 'src/jwt/jwt.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Users) private readonly users: Repository<Users>,
    private readonly jwtService: JwtService,
  ) {}

  async createAccount({ email, password, role }: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      const exists = await this.users.findOne({ email });

      if (exists) {
        return { ok: false, error: 'Error: 등록된 이메일' };
      }

      await this.users.save(this.users.create({ email, password, role }));

      return { ok: true };
    } catch (e) {
      console.log(e);
      return { ok: false, error: 'Error: 알수 없는 오류' };
    }
  }

  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      const user = await this.users.findOne({ email });

      if (!user) {
        return { ok: false, error: 'Error: 등록된 이메일이 아님' };
      }

      const isPassword = await user.checkPassword(password);

      if (!isPassword) {
        return { ok: false, error: '잘못된 비밀번호' };
      }

      const token = this.jwtService.sign(user.id);

      return { ok: true, token };
    } catch (e) {
      console.log(e);
      return { ok: false, error: 'Error: 알수 없는 오류' };
    }
  }

  async findById(id: number): Promise<Users> {
    return this.users.findOne({ id });
  }

  async editProfile(userId: number, editProfileInout: EditProfileInput) {
    const user = await this.users.findOne(userId);

    if (editProfileInout.email) {
      user.email = editProfileInout.email;
    }
    if (editProfileInout.password) {
      user.password = editProfileInout.password;
    }
    //return this.users.save(userId, { ...editProfileInout });
    return this.users.save(user);
  }
}

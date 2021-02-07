import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountInput, CreateAccountOutput } from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { JwtService } from 'src/jwt/jwt.service';
import { Verification } from './entities/verification.entity';
import { Users } from './entities/users.entity';
import { VerifyEmailOutput } from './dtos/verify-email.dto';
import { UserProfileOutput } from './dtos/user-profile.dt';
import { MailService } from 'src/mail/mail.service';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Users) private readonly user: Repository<Users>,
    @InjectRepository(Verification) private readonly verification: Repository<Verification>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async createAccount({ email, password, role }: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      const exists = await this.user.findOne({ email });

      if (exists) {
        return { ok: false, error: 'Error: 등록된 이메일' };
      }

      const users = await this.user.save(this.user.create({ email, password, role }));
      const verifications = await this.verification.save(this.verification.create({ users }));
      this.mailService.sendVerificationEmail(users.email, verifications.code);

      return { ok: true };
    } catch (e) {
      console.log(e);
      return { ok: false, error: 'Error: 알수 없는 오류' };
    }
  }

  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      const users = await this.user.findOne({ email }, { select: ['id', 'password'] });

      if (!users) {
        return { ok: false, error: 'Error: 등록된 이메일이 아님' };
      }

      const isPassword = await users.checkPassword(password);

      if (!isPassword) {
        return { ok: false, error: '잘못된 비밀번호' };
      }

      const token = this.jwtService.sign(users.id);

      return { ok: true, token };
    } catch (e) {
      console.log(e);
      return { ok: false, error: 'Error: 알수 없는 오류' };
    }
  }

  async findById(id: number): Promise<UserProfileOutput> {
    try {
      const users = await this.user.findOne({ id });

      if (users) {
        return { ok: true, users };
      }
    } catch (e) {
      console.log(e);
      return { ok: false, error: 'Error: editProfile' };
    }

    return { ok: false, error: 'Error: User Not Found' };
  }

  async editProfile(userId: number, editProfileInout: EditProfileInput): Promise<EditProfileOutput> {
    const users = await this.user.findOne(userId, { select: ['id'] });

    try {
      console.log('email : ' + editProfileInout.email);

      if (editProfileInout.email) {
        users.email = editProfileInout.email;
        users.verified = false;

        //await this.user.save(users);
        const verifications = await this.verification.save(this.verification.create({ users }),);
        this.mailService.sendVerificationEmail(users.email, verifications.code);
      }

      if (editProfileInout.password) {
        users.password = editProfileInout.password;
      }
    } catch (e) {
      console.log(e);
      return { ok: false, error: 'Error: editProfile' };
    }

    return { ok: true };
  }

  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
    const verifications = await this.verification.findOne({ code }, { relations: ['users'] });

    try {
      if (verifications) {
        verifications.users.verified = true;
        await this.user.save(verifications.users);
        await this.verification.delete(verifications.id);
        return { ok: true };
      }
      throw new Error();
    } catch (e) {
      return { ok: false, error: 'Error: verifyEmail' };
    }
  }
}

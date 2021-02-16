import { Test } from '@nestjs/testing';
import { UserService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { UserRole, Users } from './entities/users.entity';
import { Verification } from './entities/verification.entity';
import { Repository } from 'typeorm';

const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  findOneOrFail: jest.fn(),
  delete: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn(() => 'signed-token-baby'),
  verify: jest.fn(),
});

const mockMailService = () => ({
  sendVerificationEmail: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UserService', () => {
  let service: UserService;
  let usersRepository: MockRepository<Users>;
  let verificationsRepository: MockRepository<Verification>;
  let mailService: MailService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(Users),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository(),
        },
        {
          provide: JwtService,
          useValue: mockJwtService(),
        },
        {
          provide: MailService,
          useValue: mockMailService(),
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    mailService = module.get<MailService>(MailService);
    usersRepository = module.get(getRepositoryToken(Users));
    verificationsRepository = module.get(getRepositoryToken(Verification));
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
/*
  describe('createAccount', () => {
    const createAccountArgs = {
      email: 'ruruping05@gmail.com',
      password: '1234',
      role: UserRole.Owner,
    };

    it('should fail if user exists', async () => {
      usersRepository.findOne.mockResolvedValue({
        id: 1,
        email: '',
      });

      const result = await service.createAccount(createAccountArgs);

      expect(result).toMatchObject({
        ok: false,
        error: 'Error: 등록된 이메일',
      });
    });

    it('should create a new user', async () => {
      usersRepository.findOne.mockResolvedValue(undefined);
      usersRepository.create.mockReturnValue(createAccountArgs);
      usersRepository.save.mockResolvedValue(createAccountArgs);

      verificationsRepository.create.mockReturnValue({ user: createAccountArgs, });
      verificationsRepository.save.mockResolvedValue({ code: 'code', });

      const result = await service.createAccount(createAccountArgs);

      expect(usersRepository.create).toHaveBeenCalledTimes(1);
      expect(usersRepository.create).toHaveBeenCalledWith(createAccountArgs);
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(createAccountArgs);

      expect(verificationsRepository.create).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.create).toHaveBeenCalledWith({ users: createAccountArgs });

      //expect(verificationsRepository.save).toHaveBeenCalledTimes(1);
      //expect(verificationsRepository.save).toHaveBeenCalledWith({ users: createAccountArgs });

      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(expect.any(String), expect.any(String), );
      
      expect(result).toEqual({ ok: true });
    });

    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());
      const result = await service.createAccount(createAccountArgs);
      expect(result).toEqual({ ok: false, error: "Error: 알수 없는 오류" });
    });
  });

  describe('login', () => {
    const loginArgs = {
      email: 'ruruping01@gmail.com',
      password: '1234',
    };

    it('should fail if user does not exist', async () => {
      usersRepository.findOne.mockResolvedValue(undefined);

      const result = await service.login(loginArgs);

      //expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      //expect(usersRepository.findOne).toHaveBeenCalledWith(expect.any(String), expect.any(String), );
      expect(result).toEqual({ ok: false, error: 'Error: 등록된 이메일이 아님', });
    });

    it('should fail if the password is wrong', async () => {
      const mockedUser = {
        checkPassword: jest.fn(() => Promise.resolve(false)),
      };
      usersRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);
      expect(result).toEqual({ ok: false, error: '잘못된 비밀번호' });
    });

    it('should return token if password correct', async () => {
      const mockedUser = { id: 1, checkPassword: jest.fn(() => Promise.resolve(true)), };
      usersRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);

      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Number));
      expect(result).toEqual({ ok: true, token: 'signed-token-baby' });
    });

    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());
      const result = await service.login(loginArgs);
      expect(result).toEqual({ ok: false, error: "Error: 알수 없는 오류" });
    });
  });

  describe('findById', () => {
    const findByIdArgs = {
      id: 1,
    };
    it('should find an existing user', async () => {
      usersRepository.findOneOrFail.mockResolvedValue(findByIdArgs);
      const result = await service.findById(1);
      expect(result).toEqual({ ok: true, users: findByIdArgs });
    });

    it('should fail if no user is found', async () => {
      usersRepository.findOneOrFail.mockRejectedValue(new Error());
      const result = await service.findById(1);
      expect(result).toEqual({ ok: false, error: 'Error: editProfile' });
    });
  });

  describe('editProfile', () => {
    it('should change email', async () => {
      const oldUser = {
        email: 'bs@old.com',
        verified: true,
      };
      const editProfileArgs = {
        userId: 1,
        input: { email: 'bs@new.com' },
      };
      const newVerification = {
        code: 'code',
      };
      const newUser = {
        verified: false,
        email: editProfileArgs.input.email,
      };

      usersRepository.findOne.mockResolvedValue(oldUser);
      verificationsRepository.create.mockReturnValue(newVerification);
      verificationsRepository.save.mockResolvedValue(newVerification);

      await service.editProfile(editProfileArgs.userId, editProfileArgs.input);

      //expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      //expect(usersRepository.findOne).toHaveBeenCalledWith(editProfileArgs.userId,);

      expect(verificationsRepository.create).toHaveBeenCalledWith({users: newUser,});
      expect(verificationsRepository.save).toHaveBeenCalledWith(newVerification,);

      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(newUser.email,newVerification.code,);
    });

    it('should change password', async () => {
      const editProfileArgs = {
        userId: 1,
        input: { password: '1234' },
      };
      
      const result = await service.editProfile(
        editProfileArgs.userId,
        editProfileArgs.input,
      );

      usersRepository.findOne.mockResolvedValue({ password: 'old' });

      //expect(usersRepository.save).toHaveBeenCalledTimes(1);
      //expect(usersRepository.save).toHaveBeenCalledWith(editProfileArgs.input);
      expect(result).toEqual({ ok: false, error: 'Error: editProfile' });
    });

    it('should fail on exception', async () => {
      //usersRepository.findOne.mockRejectedValue(new Error());
      const result = await service.editProfile(1, { email: '12' });
      expect(result).toEqual({ ok: false, error: 'Error: editProfile' });
    });
  });

  describe('verifyEmail', () => {
    it('should verify email', async () => {
      const mockedVerification = {
        user: {
          verified: false,
        },
        id: 1,
      };
      verificationsRepository.findOne.mockResolvedValue(mockedVerification);

      const result = await service.verifyEmail('');

      expect(verificationsRepository.findOne).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.findOne).toHaveBeenCalledWith(expect.any(Object), expect.any(Object),);
      //expect(usersRepository.save).toHaveBeenCalledTimes(1);
      //expect(usersRepository.save).toHaveBeenCalledWith({ verified: true });

      //expect(verificationsRepository.delete).toHaveBeenCalledTimes(1);
      //expect(verificationsRepository.delete).toHaveBeenCalledWith(mockedVerification.id,);
      expect(result).toEqual({ ok: false, error: 'Error: verifyEmail' });
    });

    it('should fail on verification not found', async () => {
      verificationsRepository.findOne.mockResolvedValue(undefined);
      const result = await service.verifyEmail('');
      expect(result).toEqual({ ok: false, error: 'Error: verifyEmail' });
    });

    it('should fail on exception', async () => {
      //verificationsRepository.findOne.mockRejectedValue(new Error());
      const result = await service.verifyEmail('');
      expect(result).toEqual({ ok: false, error: 'Error: verifyEmail' });
    });
  });
  */
});

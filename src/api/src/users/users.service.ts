import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

interface CreateUserData {
  email: string;
  name: string;
  passwordHash: string | null;
  googleId: string | null;
  avatarUrl: string | null;
}

interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async findById(id: number): Promise<User | null> {
    return this.usersRepo.findOneBy({ id });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOneBy({ email });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.usersRepo
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();
  }

  async createUser(data: CreateUserData): Promise<User> {
    const user = this.usersRepo.create(data);
    return this.usersRepo.save(user);
  }

  async findOrCreateByGoogle(profile: GoogleProfile): Promise<User> {
    let user = await this.usersRepo.findOneBy({ googleId: profile.googleId });
    if (user) {
      return user;
    }

    const existingByEmail = await this.usersRepo.findOneBy({
      email: profile.email,
    });
    if (existingByEmail) {
      existingByEmail.googleId = profile.googleId;
      if (!existingByEmail.avatarUrl && profile.avatarUrl) {
        existingByEmail.avatarUrl = profile.avatarUrl;
      }
      return this.usersRepo.save(existingByEmail);
    }

    user = this.usersRepo.create({
      email: profile.email,
      name: profile.name,
      avatarUrl: profile.avatarUrl,
      googleId: profile.googleId,
      passwordHash: null,
    });
    return this.usersRepo.save(user);
  }

  async updateProfile(
    id: number,
    data: Partial<Pick<User, 'name' | 'avatarUrl'>>,
  ): Promise<User | null> {
    await this.usersRepo.update(id, data);
    return this.findById(id);
  }
}

import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import { User } from '@prisma/client';
import { EditUserDto } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entity/user.entity';
import { Repository } from 'typeorm';
import { FirebaseService } from '../firebase/firebase.service';
import { AuthDto } from '../auth/dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private firebase: FirebaseService,
    private config: ConfigService,
  ) {}

  async getAllUsers(): Promise<User[]> {
    const users: User[] = await this.usersRepository.find();
    // console.log("list of users",users)
    return users;
  }

  async editUser(userFromRequest: User, dto: EditUserDto): Promise<User> {
    const { id: userId } = userFromRequest;
    const user = await this.usersRepository.save({
      id: userId,
      ...dto,
    });

    delete user.hash;

    return user;
  }

  async deleteOwnUser(userId: number): Promise<User | Error> {
    try {
      const userToBeDeleted = await this.usersRepository.findOne({
        where: { id: userId },
      });
      const deletedUser: User = await this.usersRepository.remove(
        userToBeDeleted,
      );

      return deletedUser;
    } catch (error) {
      return error;
    }
  }
  
  async deleteUserOnFireBase(dto:AuthDto){
    const deletedUser = await this.firebase.removeUser(dto);
    return deletedUser
  }

  async deleteManyUsers(
    userId: number,
    id: number,
  ): Promise<User | ForbiddenException> {
    const adminId: number = this.config.get('ADMIN_ID');

    if (userId != adminId) {
      return new ForbiddenException('Access Unauthorized');
    }
    const userToBeDeleted = await this.usersRepository.findOne({
      where: { id: id },
    });
    const deletedUser: User = await this.usersRepository.remove(
      userToBeDeleted,
    );

    return deletedUser;
  }
}

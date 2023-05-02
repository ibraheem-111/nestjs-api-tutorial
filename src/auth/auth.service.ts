import {
  ForbiddenException,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
// import {User} from "@prisma/client";
// import { PrismaService } from "../prisma/prisma.service";
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt/dist';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { UserAt } from './at';
import { User } from '../entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FirebaseService } from '../firebase/firebase.service';
import { auth } from 'firebase-admin';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly firebaseService: FirebaseService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signin(dto: AuthDto) {
    const { password: dtoPassword, email: dtoEmail } = dto;

    const user = await this.usersRepository.findOne({
      where: {
        email: dtoEmail,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credentials incorrect');
    }

    const { hash: userHash, id: userId, email: userEmail } = user;

    const pwMatches = await argon.verify(userHash, dtoPassword);

    if (!pwMatches) {
      throw new UnauthorizedException('Password incorrect');
    }

    const userAccessToken: UserAt = await this.signToken(userId, userEmail);

    return userAccessToken;
  }

  async signup(dto: AuthDto): Promise<User> {
    const { password: dtoPassword, email: dtoEmail } = dto;

    const hash = await argon.hash(dtoPassword);

    try {

      const userExists = await auth().getUserByEmail(dtoEmail)
      
      if(userExists){
        const user = await this.usersRepository.save({
          email: dtoEmail,
          hash,
        });

        delete user.hash;
        return user;
      }else{
        throw new UnauthorizedException("Doesn't exist on firebase")
      }

    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials Taken');
        }
      }
      throw error;
    }
  }

  async signToken(userId: number, email: string): Promise<UserAt> {
    const payload = {
      sub: userId,
      email,
    };

    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: secret,
    });

    return {
      access_token: token,
    };
  }

  async fireBaseCreate(dto: AuthDto) {
    try {
      const user = await this.firebaseService.createUser(dto);

      return user;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}

import { MiddlewareConsumer, Module, NestModule, CacheModule, Inject } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { BookmarkModule } from './bookmark/bookmark.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { LoggerMiddleware } from './utils/logger.middleware';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Bookmark } from './entity';
import { DatabaseModule } from './db/database.module';
import { ConfigService } from '@nestjs/config';
import { FirebaseModule } from './firebase/firebase.module';
import { AuthMiddleware } from './utils/auth.middleware';
import { ServiceAccount } from 'firebase-admin';
import { firebase } from './utils/firebase';
import { redisStore } from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.register({
      isGlobal:true,
      // @ts-ignore
      store: async () => await redisStore({
        socket: {
          host: 'localhost',
          port: 6379,
        }
      }),
      ttl:60*60*24,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: '0.0.0.0',
        port: configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USERNAME'),
        password: configService.get('DATABASE_PASSWORD'),
        database: 'nest',
        entities: [User, Bookmark],
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UserModule,
    BookmarkModule,
    PrismaModule,
    DatabaseModule,
    FirebaseModule,
  ],
})
export class AppModule implements NestModule {
  constructor(private readonly configService: ConfigService) {}
  configure(consumer: MiddlewareConsumer) {

    const privateKey = this.configService.get<string>('PRIVATE_KEY').replace(/\\n/g, '\n');
    const clientEmail = this.configService.get('CLIENT_EMAIL');
    const projectId = this.configService.get('PROJECT_ID');

    const appConfig: ServiceAccount = {
      projectId,
      privateKey,
      clientEmail,
    };

    firebase(appConfig);

    consumer.apply(LoggerMiddleware).forRoutes('*');
    consumer.apply(AuthMiddleware).forRoutes('auth/signup', 'auth/signin');
  }
}

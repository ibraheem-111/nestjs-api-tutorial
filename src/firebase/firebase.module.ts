import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { ConfigService } from '@nestjs/config';
import { LoggerMiddleware } from '../utils/logger.middleware';

@Module({
  providers: [FirebaseService, ConfigService, LoggerMiddleware],
})
export class FirebaseModule {}

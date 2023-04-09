import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bookmark, User } from '../entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bookmark, User])],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}

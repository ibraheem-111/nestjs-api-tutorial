import { Module } from '@nestjs/common';
import { BookmarkController } from './bookmark.controller';
import { BookmarkService } from './bookmark.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bookmark, User } from '../entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bookmark]),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [BookmarkController],
  providers: [BookmarkService],
})
export class BookmarkModule {}

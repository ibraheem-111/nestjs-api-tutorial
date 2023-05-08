import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common/exceptions/forbidden.exception';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { Bookmark } from '../entity';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { BookmarkService } from './bookmark.service';
import { CreateBookmarkDto, EditBookmarkDto, SearchBookmarkDto } from './dto';
import Redis from 'ioredis';

@UseGuards(JwtGuard)
@Controller('bookmarks')
export class BookmarkController {
  constructor(private bookmarkService: BookmarkService) {}
  @Get('/')
  @ApiBearerAuth()
  async getBookmarks(@GetUser('id') userId: number): Promise<Bookmark[]> {
    try {
      const bookmarks: Bookmark[] = await this.bookmarkService.getBookmarks(
        userId,
      );
      
      return bookmarks;
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  @ApiBearerAuth()
  async getBookmarkById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) bookmarkId: number,
  ): Promise<Bookmark> {
    try{
      const bookmark: Bookmark = await this.bookmarkService.getBookmarkById(
        userId,
        bookmarkId,
      );
 
      return bookmark;

    } catch (err) {
      return err;
    }
  }

  @Post()
  @ApiBearerAuth()
  @ApiBody({ type: CreateBookmarkDto })
  async createBookmark(
    @GetUser('id') userId: number,
    @Body() dto: CreateBookmarkDto,
  ): Promise<Bookmark> {
    try {
      const bookmark: Bookmark = await this.bookmarkService.createBookmark(
        userId,
        dto,
      );
      return bookmark;
    } catch (err) {
      return err;
    }
  }

  @Post('/search')
  @ApiBearerAuth()
  @ApiBody({ type: SearchBookmarkDto })
  async searchBookmarkByTitle(
    @GetUser('id') userId: number,
    @Body() dto: EditBookmarkDto,
  ): Promise<Bookmark[]> {
    const bookmarks: Bookmark[] =
      await this.bookmarkService.searchBookmarkByTitle(userId, dto);

    return bookmarks;
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiBody({ type: EditBookmarkDto })
  async editBookmarkById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) bookmarkId: number,
    @Body() dto: EditBookmarkDto,
  ): Promise<Bookmark | ForbiddenException> {
    try {
      const bookmarkOrError: Bookmark | ForbiddenException =
        await this.bookmarkService.editBookmarkById(userId, bookmarkId, dto);
      
      return bookmarkOrError;
    } catch (err) {
      
      return err;
    }
  }

  @Delete(':id')
  @ApiBearerAuth()
  async deleteBookmarkById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) bookmarkId: number,
  ): Promise<Bookmark | ForbiddenException> {
    const bookmarkOrError: Bookmark | ForbiddenException =
      await this.bookmarkService.deleteBookmarkById(userId, bookmarkId);
    
    return bookmarkOrError;
  }
}

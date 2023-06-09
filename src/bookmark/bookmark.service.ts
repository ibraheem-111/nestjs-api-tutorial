import { ForbiddenException, Injectable } from '@nestjs/common';
// import { Bookmark } from '@prisma/client';
// import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkDto, SearchBookmarkDto } from './dto';
import { Bookmark, User } from '../entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { queries } from '../sql/index';

@Injectable()
export class BookmarkService {
  constructor(
    @InjectRepository(Bookmark)
    private bookmarksRepository: Repository<Bookmark>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async getBookmarks(userId: number): Promise<Bookmark[]> {
    // const bookmarks: Bookmark[] = await this.bookmarksRepository.find({
    //   where: {
    //     user: { id: userId },
    //     title: Raw("NULLIF(title,' ') ASC NULLS LAST")
    //   },
    //   order:{
    //     title: 'ASC',
    //   }
    // });
    //
    const query: queries = new queries();
    const { orderEmptyStringsLast } = query;
    const bookmarks: Bookmark[] = await this.bookmarksRepository
      .createQueryBuilder('bookmark')
      .innerJoin('users', 'user', 'bookmark.user = user.id')
      .orderBy(orderEmptyStringsLast, 'ASC', 'NULLS LAST')
      .getMany();

    return bookmarks;
  }

  async getBookmarkById(userId: number, bookmarkId: number): Promise<Bookmark> {
    const bookmarkFound = await this.bookmarksRepository.findOne({
      where: {
        id: bookmarkId,
        user: { id: userId },
      },
    });

    return bookmarkFound;
  }

  async createBookmark(
    userId: number,
    dto: CreateBookmarkDto,
  ): Promise<Bookmark> {
    const user = await this.usersRepository.findOne({
      where: {
        id: userId,
      },
    });
    const bookmark = await this.bookmarksRepository.save({
      user: user,
      ...dto,
    });

    return bookmark;
  }

  async editBookmarkById(
    userId: number,
    bookmarkId: number,
    dto: EditBookmarkDto,
  ): Promise<Bookmark | ForbiddenException> {
    const bookmark = await this.bookmarksRepository.findOne({
      where: {
        id: bookmarkId,
        user: { id: userId },
      },
    });

    if (!bookmark || bookmark.user.id !== userId) {
      return new ForbiddenException('Access unauthorized');
    }

    const updateResponse = await this.bookmarksRepository.update(
      bookmarkId,

      {
        title: dto.title,
        description: dto.description,
      },
    );

    const editedBookmark = await this.bookmarksRepository.findOne({
      where: {
        id: bookmarkId,
      },
    });

    return editedBookmark;
  }

  async deleteBookmarkById(
    userId: number,
    bookmarkId: number,
  ): Promise<Bookmark | ForbiddenException> {
    console.log(bookmarkId);
    const bookmark = await this.bookmarksRepository.findOne({
      where: {
        id: bookmarkId,
      },
    });

    if (!bookmark || bookmark.user.id !== userId) {
      return new ForbiddenException('Access unauthorized');
    }

    try {
      await this.bookmarksRepository.delete(bookmarkId);
    } catch (err) {
      console.log(err);
      throw err;
    }

    return bookmark;
  }

  async searchBookmarkByTitle(userId: number, dto: SearchBookmarkDto) {
    const { title } = dto;

    const bookmarks: Bookmark[] = await this.bookmarksRepository.findBy({
      title: Like(`${title}`),
    });

    return bookmarks;
  }
}

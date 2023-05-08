import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Bookmark, User } from '../entity';
import { Repository } from 'typeorm';

@Injectable()
export class DatabaseService {
  constructor(
    @InjectRepository(Bookmark)
    private bookmarksRepository: Repository<Bookmark>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async cleanDataBase() {
    try {
      await this.bookmarksRepository.clear();
      await this.usersRepository.query('TRUNCATE TABLE users CASCADE');
    } catch (err) {
      throw err;
    }
  }
}

import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common/exceptions/forbidden.exception';
import { Bookmark } from '@prisma/client';

import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { BookmarkService } from './bookmark.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@UseGuards(JwtGuard)
@Controller('bookmarks')
export class BookmarkController {
    constructor(private bookmarkService: BookmarkService){}
    @Get('/')
    async getBookmarks(@GetUser("id") userId:number): Promise<Bookmark[]>{
        try{
            const bookmarks :Bookmark[] =await this.bookmarkService.getBookmarks(userId);
            return bookmarks;
        }catch(error){
            throw error
        }
    }

    @Get(':id')
    async getBookmarkById(
        @GetUser('id') userId: number,
        @Param('id', ParseIntPipe) bookmarkId: number,
    ) : Promise<Bookmark> {
        try{
            const bookmark : Bookmark = await this.bookmarkService.getBookmarkById(
            userId,
            bookmarkId,
            );
            return bookmark;
        }
        catch(err){
            throw err;
        }
    }

    @Post()
    async createBookmark(
        @GetUser("id") userId:number, 
        @Body() dto:CreateBookmarkDto
        ): Promise <Bookmark>
        {
            try{
                const bookmark : Bookmark = await this.bookmarkService.createBookmark(userId, dto);
                return bookmark;
            }
            catch(err){
                throw err;
            }
        }

    @Patch(':id')
    async editBookmarkById(
        @GetUser('id') userId: number,
        @Param('id', ParseIntPipe) bookmarkId: number,
        @Body() dto: EditBookmarkDto,
    ) :Promise<Bookmark | ForbiddenException>
    {
        try {
            const bookmarkOrError : Bookmark | ForbiddenException = await this.bookmarkService.editBookmarkById(
            userId,
            bookmarkId,
            dto,        
            );
            return bookmarkOrError;
        }
        catch(err){
            throw err
        }
    }

    @Delete(':id')
    async deleteBookmarkById(
        @GetUser("id") userId:number,
        @Param('id', ParseIntPipe)    bookmarkId: number
    ) :Promise<Bookmark | ForbiddenException> 
    {
        try{
            const bookmarkOrError : Bookmark | ForbiddenException = await this.bookmarkService.deleteBookmarkById(userId, bookmarkId);
            return bookmarkOrError;
        }
        catch(err){
            throw err;
        }
    }
}

import { ForbiddenException, Injectable } from '@nestjs/common';
import { Bookmark } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {

    constructor(private prisma: PrismaService) {}
    
    async getBookmarks(userId: number):Promise<Bookmark[]>{

        return await this.prisma.bookmark.findMany({
            where: {
                userId
            }
        })

    }

    async getBookmarkById(
        userId: number,
        bookmarkId: number,
      ) :Promise<Bookmark>{
        const bookmarkFound = await this.prisma.bookmark.findFirst({
            where: {
              id: bookmarkId,
              userId,
            },
          });
        return bookmarkFound;
      }

    async createBookmark(
        userId: number,
        dto: CreateBookmarkDto,
      ) : Promise <Bookmark>{
        const bookmark =
          await this.prisma.bookmark.create({
            data: {
              userId,
              ...dto,
            },
          });
    
        return bookmark;
      }
    

    async editBookmarkById(userId:number, bookmarkId:number, dto:EditBookmarkDto): Promise<Bookmark | ForbiddenException>{
        
        const bookmark =
            await this.prisma.bookmark.findUnique({
                where: {
                    id: bookmarkId,
                },
            })
        
        if(!bookmark || bookmark.userId!==userId){
            return new ForbiddenException("Access unauthorized")
        }

        const editedBookmark = await this.prisma.bookmark.update({
            where:{
                id:bookmarkId,
            },
            data: {
                ...dto,
            }
        })

        return editedBookmark;

    }

    async deleteBookmarkById(userId:number, bookmarkId:number): Promise<Bookmark | ForbiddenException>{
        
        const bookmark =
            await this.prisma.bookmark.findUnique({
                where: {
                    id: bookmarkId,
                },
            })
        
        if(!bookmark || bookmark.userId!==userId){
            return new ForbiddenException("Access unauthorized");
        }

        const deletedBookmark = await this.prisma.bookmark.delete({
            where:{
                id:bookmarkId,
            },
        })

        return deletedBookmark;

    }
}

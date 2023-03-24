import { Controller, ForbiddenException, Get, ParseIntPipe, UseGuards } from '@nestjs/common';
import { Body, Delete, Param, Patch } from '@nestjs/common/decorators';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { EditUserDto } from './dto';
import {UserService} from './user.service'

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
    constructor(private userService: UserService){}
    
    @Get('me')
    getMe(@GetUser() user: User){
        try{
            const returnedUser:User=user
            return returnedUser;  
        }catch(error){
            throw   error
        }     
    };

    @Get()
    async getUsers() : Promise<User[]>{
        try{
            const users: User[] = await this.userService.getAllUsers()
            return users;

        }catch(error){
            throw error;

        }
    }

    @Patch()
    async editUser(
        @GetUser() user: User, 
        @Body() dto : EditUserDto
    ){
        try{
            const editedUser: User = await this.userService.editUser(user, dto);
            return editedUser;
        }catch(error){
            throw error
        }
    }

    @Delete()
    async deleteOwnUser(@GetUser('id') userId: number):Promise<User | Error>{
        try{
            const deletedUser: User | Error = await this.userService.deleteOwnUser(userId)
            return deletedUser
        }catch(error){
            throw error
        }
    }
    
    @Delete("/admin/:id")
    async deleteManyUsers(@GetUser('id') userId:number, @Param('id', ParseIntPipe) id:number):Promise<User | ForbiddenException>{

        const deletedUser : User | ForbiddenException = await this.userService.deleteManyUsers(userId, id)
        return deletedUser;
    }
}

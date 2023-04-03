import { Controller, ForbiddenException, Get, ParseIntPipe, UseGuards } from '@nestjs/common';
import { Body, Delete, Param, Patch } from '@nestjs/common/decorators';
import { ApiBearerAuth, ApiBody, ApiForbiddenResponse, ApiOkResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { EditUserDto } from './dto';
import {UserService} from './user.service'

@UseGuards(JwtGuard)
@Controller('users')
@ApiBearerAuth()
export class UserController {
    constructor(private userService: UserService){}
    
    @Get('me')
    @ApiUnauthorizedResponse({description:"User not logged in"})
    @ApiOkResponse({description:"Show Signedin User"})
    getMe(@GetUser() user: User): User | Error{
        try{
            const returnedUser:User=user
            return returnedUser;  
        }catch(error){
            return   error
        }     
    };

    @Get()
    @ApiUnauthorizedResponse({description:"User Not Logged In"})
    @ApiOkResponse({description:"Show All Signedup Users"})
    async getUsers() : Promise<User[]>{
        try{
            const users: User[] = await this.userService.getAllUsers()
            return users;

        }catch(error){
            return error;

        }
    }

    @Patch()
    @ApiUnauthorizedResponse({description:"User Not Logged In"})
    @ApiOkResponse({description:"Edit Signed-in user"})
    @ApiBody({type: EditUserDto})
    async editUser(
        @GetUser() user: User, 
        @Body() dto : EditUserDto
    ){
        try{
            const editedUser: User = await this.userService.editUser(user, dto);
            return editedUser;
        }catch(error){
            return error
        }
    }

    @Delete()
    @ApiUnauthorizedResponse({description:"User is not signedin"})
    @ApiOkResponse({description:"Delete signed in user"})
    async deleteOwnUser(@GetUser('id') userId: number):Promise<User | Error>{
        try{
            const deletedUser: User | Error = await this.userService.deleteOwnUser(userId)
            return deletedUser
        }catch(error){
            return error
        }
    }
    
    @Delete("/admin/:id")
    @ApiForbiddenResponse({description:"Signed in user is not admin"})
    @ApiOkResponse({description:"Delete any user"})
    async deleteManyUsers(@GetUser('id') userId:number, @Param('id', ParseIntPipe) id:number):Promise<User | ForbiddenException>{

        const deletedUser : User | ForbiddenException = await this.userService.deleteManyUsers(userId, id)
        return deletedUser;
    }
}

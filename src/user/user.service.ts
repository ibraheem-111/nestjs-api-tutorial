import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EditUserDto } from './dto';

@Injectable()
export class UserService {
    constructor(
        private prisma : PrismaService,
        private config: ConfigService
        ){

    }

    async getAllUsers(): Promise<User[]>{
        const users: User[] = await this.prisma.user.findMany()
        console.log("list of users",users)
        return users;        
    }

    async editUser(userFromRequest: User, dto: EditUserDto) : Promise<User>{
        
        const { id:userId } = userFromRequest 
        const user = await this.prisma.user.update({
            where : {
                
                id : userId,
            },
            data:{
                ...dto,   
            }
        })

        delete user.hash;

        return user;
    }

    async deleteOwnUser(userId:number):Promise<User|Error>{
        try {
            console.log(userId);
            const user:User =
            await this.prisma.user.delete({
                where:{
                    id:userId
                }
            })
            console.log("deleted user",user);
            return user;
        }catch(error){
            return error
        }
    }

    async deleteManyUsers(userId:number, id:number): Promise<User | ForbiddenException>{
        const adminId:number = this.config.get("ADMIN_ID")
        
        if(userId != adminId){
            return new ForbiddenException("Access Unauthorized")
        }
        const deletedUser: User = await this.prisma.user.delete({
                where:{
                    id:id
                }
            })
        

        return deletedUser;
        
    }
}
import { ForbiddenException, Injectable } from "@nestjs/common";
import {User, Bookmark} from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from "argon2";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { JwtService } from "@nestjs/jwt/dist";
import { ConfigService } from "@nestjs/config/dist/config.service";
import { UserAt } from "./at";


@Injectable()
export class AuthService{
    constructor(
        private prisma: PrismaService, 
        private jwt: JwtService, 
        private config: ConfigService){

    }

    async signin(dto: AuthDto){
        const {password: dtoPassword, email: dtoEmail} = dto;
        
        const user = await this.prisma.user.findUnique({
            where:{
                email: dtoEmail,
            }
        })

        if(!user){
            throw new ForbiddenException(
                'Credentials incorrect',
            )   
        }

        const {hash: userHash, id: userId, email: userEmail}=user

        const pwMatches = await argon.verify(
            userHash, dtoPassword,
        );

        if(!pwMatches){
            throw new ForbiddenException("Credentials incorrect");
        };

        const userAccessToken : UserAt = await this.signToken(userId,userEmail);
        return userAccessToken; 
    }


    async signup(dto: AuthDto):Promise<User>{
        const {password: dtoPassword, email: dtoEmail} = dto;

        const hash = await argon.hash(dtoPassword);

        try{
            const user = await this.prisma.user.create({
                data:{
                    email: dtoEmail,
                    hash,
                },
            })
            
            delete user.hash
            return user;
        }
        catch(error){
            
            if(error instanceof PrismaClientKnownRequestError)  {
                if (error.code === 'P2002'){
                    throw new ForbiddenException(
                        'Credentials Taken',
                    );
                }                
            }
            throw error;          
        }
        
    }

    async signToken(userId:number, email:string): Promise<UserAt> {
        const payload = {
            sub : userId,
            email,
        }

        const secret = this.config.get('JWT_SECRET');

        const token = await this.jwt.signAsync(payload, {
            expiresIn: '15m',
            secret: secret,
        })

        return {
            access_token: token,
        }
    }
}
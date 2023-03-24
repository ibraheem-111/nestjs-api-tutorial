import { Body, Controller, HttpCode, HttpStatus, Post} from "@nestjs/common";
import { HttpException } from "@nestjs/common/exceptions";
import { User } from "@prisma/client";
import { UserAt } from "./at";
import { AuthService } from "./auth.service";
import { AuthDto } from "./dto";

@Controller('auth')

export class AuthController{
    constructor(private authService: AuthService) {
    }

    @Post('signup')
    async signup(@Body() dto: AuthDto): Promise<User>{    
        try{
            const user : User= await this.authService.signup(dto);
            return user
        }catch{
            throw new HttpException("Something went wrong",500);
        }
    }

    @HttpCode(HttpStatus.OK)
    @Post('signin')
    async signin(@Body() dto:AuthDto): Promise<UserAt>{
        try{
            const user : UserAt= await this.authService.signin(dto);
            return user
        }catch(error){
            console.error(error);
            throw new HttpException("Something went wrong",500);
        }
    }

}
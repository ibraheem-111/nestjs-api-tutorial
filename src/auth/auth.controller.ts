import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common/exceptions';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { User } from '@prisma/client';
import { UserAt } from './at';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @ApiCreatedResponse({ description: 'User signup' })
  @ApiBody({ type: AuthDto })
  async signup(@Body() dto: AuthDto): Promise<User> {
    const user: User = await this.authService.signup(dto);
    return user;
  }

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  @ApiOkResponse({ description: 'User signin' })
  @ApiUnauthorizedResponse({ description: 'Incorrect Credentials' })
  @ApiBody({ type: AuthDto })
  async signin(@Body() dto: AuthDto): Promise<UserAt | UnauthorizedException> {
    const user: UserAt | UnauthorizedException = await this.authService.signin(
      dto,
    );
    return user;
  }
}

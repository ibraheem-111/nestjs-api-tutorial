import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class EditUserDto {
  @IsEmail()
  @IsOptional()
  @ApiPropertyOptional({ type: String, description: 'email' })
  email?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ type: String, description: 'First Name' })
  firstName?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ type: String, description: 'Last Name' })
  lastName?: string;
}

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";


export class CreateBookmarkDto{
    @IsString()
    @IsNotEmpty()
    @ApiProperty({type: String, description:"Title of the bookmark"})
    title : string;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional({type: String, description:"Description of the bookmark, Optional"})
    description?: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({type: String, description:"Link to the bookmark"})
    link:string;
}
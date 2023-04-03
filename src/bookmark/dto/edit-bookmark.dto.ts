import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";


export class EditBookmarkDto{
    @IsString()
    @IsOptional()
    @ApiPropertyOptional({type: String, description:"Title of the bookmark, Optional"})
    title? : string;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional({type: String, description:"Description of the bookmark, Optional"})
    description?: string;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional({type: String, description:"Link to the bookmark, Optional"})
    link? :string;
}
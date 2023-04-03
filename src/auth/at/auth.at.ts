import { ApiProperty } from "@nestjs/swagger";

export class UserAt {
    @ApiProperty({type:String, description:"JWT token"})
    access_token: string
}
import { Injectable } from '@nestjs/common';
import { AuthDto } from '../auth/dto';
import { auth } from 'firebase-admin';
import { User } from 'src/entity';

@Injectable()
export class FirebaseService {
    constructor(){}

    async createUser(data : AuthDto){
        try{
            const user = await auth().createUser({
                ...data
            })

            return user
        }
        catch (err){
            throw err;
        }
    }
}

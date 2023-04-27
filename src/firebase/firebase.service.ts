import { Injectable } from '@nestjs/common';
import { AuthDto } from '../auth/dto';
import { auth } from 'firebase-admin';

@Injectable()
export class FirebaseService {
    constructor(){}

    async createUser(data : AuthDto){
        try{
            const user_id = await auth().createUser({
                ...data
            })
        }
        catch (err){
            throw err;
        }
    }
}

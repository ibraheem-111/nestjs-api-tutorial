import { Injectable } from '@nestjs/common';
import { AuthDto } from '../auth/dto';
import { auth } from 'firebase-admin';

@Injectable()
export class FirebaseService {
  constructor() {}

  async createUser(data: AuthDto) {
    try {
      const {email, password} = data
      
      const user = await auth().createUser({
        email,
        password,
      });

      return user;
    } catch (err) {
      throw err;
    }
  }

  async signIn(dto : AuthDto){
    try{

      

    }
    catch{

    }
  }
}

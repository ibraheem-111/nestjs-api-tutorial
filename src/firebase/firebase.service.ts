import { Injectable } from '@nestjs/common';
import { AuthDto } from '../auth/dto';
import { auth } from 'firebase-admin';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';

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

  async removeUser(dto:AuthDto){
    try {
      const {email} = dto;
      const findUser:UserRecord = await auth().getUserByEmail(email)
      const {uid} = findUser;
      const deleteUser = await auth().deleteUser(uid);
      return findUser;
    }
    catch(error){
      throw error
    }
  }
}

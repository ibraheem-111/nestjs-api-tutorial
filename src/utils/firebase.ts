import { ServiceAccount } from "firebase-admin";
import * as admin from "firebase-admin";

export function firebase(appConfig: ServiceAccount){

    return admin.initializeApp({
        credential: admin.credential.cert(appConfig)
    })
    
}
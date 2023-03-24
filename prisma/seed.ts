import { PrismaClient } from "@prisma/client";
import { ConfigService } from "@nestjs/config";
import * as argon from "argon2";

const prisma = new PrismaClient
const config = new ConfigService



async function main () {
    const password:string = await config.get("ADMIN_PASSWORD");
    const hash = await argon.hash(password);
    const admin =await prisma.user.create({
        data:{
            email:"admin@admin.com",
            firstName:"admin",
            lastName:"admin",
            hash: hash
        }
    })
}

main();
import { HttpException, HttpStatus, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response, Request } from 'express';

export class AuthMiddleware implements NestMiddleware {
  constructor() {}

  async getToken(req: Request) {
    const { headers } = req;
    const { authorization = null } = headers;
    const split_header: string[] = authorization?.split(' ');
    const [, token = null] = split_header ? split_header : [];
    return {
      authToken: token,
    };
  }

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const authToken = this.getToken(req);
      const { UNAUTHORIZED } = HttpStatus;

      console.log("auth_middleware")
      next()
      // if (!authToken) {
      //   throw new HttpException('Unauthorized', UNAUTHORIZED);
      // }

      // next()
    } catch (err) {
      console.log('middleware auth', err);
    }
  }
}

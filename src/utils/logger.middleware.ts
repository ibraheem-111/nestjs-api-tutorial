import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    private logger = new Logger('HTTP');

    use(req: Request, res: Response, next: NextFunction): void {
        const {method, originalUrl, body} = req;

        res.on('finish', ()=>{

            this.logger.log("Request:");
            this.logger.log({
                method:method, 
                requestUrl:originalUrl,
                body:body
            })

        });

        this.getResponseLog(res)

        if(next){next();}
    }
    getResponseLog = (res: Response) => {
        const {write:rawResponse, end:rawResponseEnd} = res;
        
        const chunkBuffers = [];
        res.write = (...chunks) => {
          const resArgs = [];
          for (let i = 0; i < chunks.length; i++) {
            resArgs[i] = chunks[i];
            if (!resArgs[i]) {
              res.once('drain', res.write);
              i--;
            }
          }
          if (resArgs[0]) {
            chunkBuffers.push(Buffer.from(resArgs[0]));
          }
          return rawResponse.apply(res, resArgs);
        };
        this.logger.log("Response:")
        res.end = (...chunk) => {
          const resArgs = [];
          for (let i = 0; i < chunk.length; i++) {
            resArgs[i] = chunk[i];
          }
          if (resArgs[0]) {
            chunkBuffers.push(Buffer.from(resArgs[0]));
          }
          const body = Buffer.concat(chunkBuffers).toString('utf8');
          
           const responseLog = {
            response: {
              body: JSON.parse(body) || body || {},
            },
          };
          this.logger.log('res: ', responseLog);
          rawResponseEnd.apply(res, resArgs);
          return responseLog as unknown as Response;
        };
      };
}


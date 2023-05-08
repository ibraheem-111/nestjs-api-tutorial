import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder } from '@nestjs/swagger';
import { SwaggerModule } from '@nestjs/swagger/dist';
import { Redis } from 'ioredis';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  // const config = new ConfigService();

  // const privateKey = config.get('PRIVATE_KEY').replace(/\\n/g, '\n');
  // const clientEmail = config.get('CLIENT_EMAIL');
  // const projectId = config.get('PROJECT_ID');

  // const appConfig: ServiceAccount = {
  //   projectId,
  //   privateKey,
  //   clientEmail,
  // };

  // admin.initializeApp({
  //   credential: admin.credential.cert(appConfig),
  // });
  const options = new DocumentBuilder()
    .setTitle('CRUD REST API')
    .setDescription('REST CRUD API')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'Bearer',
      },
      'Access_Token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  await app.listen(3333);
}
bootstrap();

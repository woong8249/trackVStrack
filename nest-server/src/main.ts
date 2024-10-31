// import fs from 'fs';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { MyLogger } from './logger/logger.service';
import useragent from 'express-useragent';
import { ValidationPipe } from '@nestjs/common';

const port = process.env.APP_PORT || 3000;
const env = process.env.APP_ENV;
const origin =
  env === 'production'
    ? 'not yet'
    : ['http://localhost:4173', 'http://localhost:5173'];

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin,
    methods: 'GET',
    credentials: true, // 쿠키 등을 사용할 때
  });
  app.useLogger(await app.resolve(MyLogger));
  app.use(useragent.express());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 정의되지 않은 속성은 자동으로 제거
      forbidNonWhitelisted: true, // DTO에 정의되지 않은 속성에 대해 예외 발생
      transform: true, // query나 param 데이터를 자동으로 타입 변환 (e.g., string -> number)
    }),
  );
  const config = new DocumentBuilder()
    .setTitle('API specification')
    .setDescription('This is the API specification for development.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  //Note for Swagger UI and Swagger Editor users: Cookie authentication is currently not supported for "try it out" requests due to browser security restrictions. See this issue for more information. SwaggerHub does not have this limitation.
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  // fs.writeFileSync('./swagger.json', JSON.stringify(document, null, 2));
  await app.listen(port);
}
bootstrap();

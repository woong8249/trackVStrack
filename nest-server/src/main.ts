import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import useragent from 'express-useragent';
import { ValidationPipe } from '@nestjs/common';
import { createLogger } from 'winston';
import { WinstonModule, utilities } from 'nest-winston';
import * as winston from 'winston';
import WinstonCloudwatch from 'winston-cloudwatch';

const env = process.env.APP_ENV;
const port = process.env.APP_PORT;
const level = process.env.APP_LOG_LEVEL; // error	0 warn	1  info	2 http	3 verbose	4 debug	5 silly	6
const origin = env.includes('local')
  ? ['http://localhost:4173', 'http://localhost:5173']
  : '*';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      instance: createLogger({
        transports: [
          new winston.transports.Console({
            level,
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.ms(),
              utilities.format.nestLike('api-server', {
                colors: true,
                prettyPrint: true,
                processId: true,
                appName: true,
              }),
            ),
          }),
          new WinstonCloudwatch({
            level,
            logGroupName: process.env.AWS_CLOUD_WATCH_LOG_GROUP_NAME,
            logStreamName: process.env.AWS_CLOUD_WATCH_LOG_STREAM_NAME,
            awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
            awsRegion: process.env.AWS_REGION,
            awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY,
          }),
        ],
      }),
    }),
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 정의되지 않은 속성은 자동으로 제거
      forbidNonWhitelisted: true, // DTO에 정의되지 않은 속성에 대해 예외 발생
      transform: true, // query나 param 데이터를 자동으로 타입 변환 (e.g., string -> number)
    }),
  );
  app.enableCors({
    origin,
    methods: 'GET',
    credentials: false, // 쿠키 사용하고 있지 않음
  });
  app.use(useragent.express());
  if (env.includes('development')) {
    const config = new DocumentBuilder()
      .setTitle('API specification')
      .setDescription('This is the API specification for development.')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    //Note for Swagger UI and Swagger Editor users: Cookie authentication is currently not supported for "try it out" requests due to browser security restrictions. See this issue for more information. SwaggerHub does not have this limitation.
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('doc', app, document);
  }
  await app.listen(port);
}
bootstrap();

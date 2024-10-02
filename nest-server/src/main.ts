import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { MyLogger } from './logger/logger.service';
import useragent from 'express-useragent';

const port = process.env.APP_PORT || 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(await app.resolve(MyLogger));
  app.use(useragent.express());
  const config = new DocumentBuilder()
    .setTitle('API specification')
    .setDescription('This is the API specification for development.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  //Note for Swagger UI and Swagger Editor users: Cookie authentication is currently not supported for "try it out" requests due to browser security restrictions. See this issue for more information. SwaggerHub does not have this limitation.
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(port);
}
bootstrap();
